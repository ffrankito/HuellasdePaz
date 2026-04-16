import { db } from '@/db'
import { clientes, servicios, leads, planes } from '@/db/schema'
import { count, eq } from 'drizzle-orm'
import { ExportarReporteButton } from '@/components/dashboard/ExportarReporteButton'
import { GraficoPie } from '@/components/dashboard/GraficoPie'

export default async function ReportesPage() {
  const [
    totalClientes,
    totalServicios,
    serviciosEntregados,
    totalLeads,
    leadsConvertidos,
    planesData,
  ] = await Promise.all([
    db.select({ count: count() }).from(clientes),
    db.select({ count: count() }).from(servicios),
    db.select({ count: count() }).from(servicios).where(eq(servicios.estado, 'entregado')),
    db.select({ count: count() }).from(leads),
    db.select({ count: count() }).from(leads).where(eq(leads.estado, 'convertido')),
    db.select().from(planes),
  ])

  const [serviciosPorTipo, leadsPorOrigen] = await Promise.all([
    db.select({ tipo: servicios.tipo, count: count() }).from(servicios).groupBy(servicios.tipo),
    db.select({ origen: leads.origen, count: count() }).from(leads).groupBy(leads.origen),
  ])

  const planesActivos = planesData.filter(p => p.estado === 'activo')
  const gananciaCobrada = planesData.reduce((acc, p) => acc + (Number(p.cuotasMensual) * (p.cuotasPagadas ?? 0)), 0)
  const deudaPendiente = planesData.reduce((acc, p) => {
    const restantes = p.cuotasTotales - (p.cuotasPagadas ?? 0)
    return acc + (Number(p.cuotasMensual) * restantes)
  }, 0)
  const conversionLeads = totalLeads[0].count > 0
    ? Math.round((leadsConvertidos[0].count / totalLeads[0].count) * 100) : 0

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: 0 }}>Reportes</h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>Métricas generales del negocio</p>
        </div>
        <ExportarReporteButton />
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        <MetricaCard titulo="Clientes totales" valor={totalClientes[0].count} />
        <MetricaCard titulo="Servicios completados" valor={serviciosEntregados[0].count} />
        <MetricaCard titulo="Tasa de conversión" valor={`${conversionLeads}%`} />
        <MetricaCard titulo="Leads totales" valor={totalLeads[0].count} />
      </div>

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 20px' }}>Planes de previsión</h2>
        <div className="grid-3">
          <div style={{ background: '#f9fafb', borderRadius: 12, padding: '20px 24px' }}>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 8px' }}>Planes activos</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0 }}>{planesActivos.length}</p>
          </div>
          <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '20px 24px', border: '1px solid #bbf7d0' }}>
            <p style={{ fontSize: 13, color: '#15803d', margin: '0 0 8px' }}>Ganancia cobrada</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: '#15803d', margin: 0 }}>${gananciaCobrada.toLocaleString('es-AR')}</p>
          </div>
          <div style={{ background: '#fef2f2', borderRadius: 12, padding: '20px 24px', border: '1px solid #fecaca' }}>
            <p style={{ fontSize: 13, color: '#dc2626', margin: '0 0 8px' }}>Deuda pendiente</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: '#dc2626', margin: 0 }}>${deudaPendiente.toLocaleString('es-AR')}</p>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 20px' }}>Servicios por tipo</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {serviciosPorTipo.map(s => {
              const porcentaje = totalServicios[0].count > 0 ? Math.round((s.count / totalServicios[0].count) * 100) : 0
              const label: Record<string, string> = {
                cremacion_individual: 'Cremación individual',
                cremacion_comunitaria: 'Cremación comunitaria',
                entierro: 'Entierro',
              }
              return (
                <div key={s.tipo}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: '#374151' }}>{label[s.tipo] ?? s.tipo}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{s.count} ({porcentaje}%)</span>
                  </div>
                  <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${porcentaje}%`, height: '100%', background: '#111827', borderRadius: 3 }} />
                  </div>
                </div>
              )
            })}
            {serviciosPorTipo.length === 0 && <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>Sin servicios todavía</p>}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 20px' }}>Embudo de leads</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Total leads', valor: totalLeads[0].count, color: '#6b7280' },
              { label: 'Convertidos a clientes', valor: leadsConvertidos[0].count, color: '#15803d' },
              { label: 'Sin contactar', valor: planesData.filter(p => p.estado === 'activo').length, color: '#a16207' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f9fafb', borderRadius: 10 }}>
                <span style={{ fontSize: 13, color: '#374151' }}>{item.label}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: item.color }}>{item.valor}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <GraficoPie
          titulo="Servicios por tipo"
          data={[
            { label: 'Cremación individual', valor: serviciosPorTipo.find(s => s.tipo === 'cremacion_individual')?.count ?? 0, color: '#111827' },
            { label: 'Cremación comunitaria', valor: serviciosPorTipo.find(s => s.tipo === 'cremacion_comunitaria')?.count ?? 0, color: '#6b7280' },
            { label: 'Entierro', valor: serviciosPorTipo.find(s => s.tipo === 'entierro')?.count ?? 0, color: '#d1d5db' },
          ]}
        />
        <GraficoPie
          titulo="Leads por origen"
          data={[
            { label: 'Landing', valor: leadsPorOrigen.find(l => l.origen === 'landing')?.count ?? 0, color: '#111827' },
            { label: 'WhatsApp', valor: leadsPorOrigen.find(l => l.origen === 'whatsapp')?.count ?? 0, color: '#6b7280' },
            { label: 'Veterinaria', valor: leadsPorOrigen.find(l => l.origen === 'veterinaria')?.count ?? 0, color: '#9ca3af' },
            { label: 'Referido', valor: leadsPorOrigen.find(l => l.origen === 'referido')?.count ?? 0, color: '#c4c9d4' },
            { label: 'Redes', valor: leadsPorOrigen.find(l => l.origen === 'redes')?.count ?? 0, color: '#e5e7eb' },
          ]}
        />
      </div>
    </div>
  )
}

function MetricaCard({ titulo, valor }: { titulo: string; valor: number | string }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px 28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 10px' }}>{titulo}</p>
      <p style={{ fontSize: 32, fontWeight: 700, color: '#111827', margin: 0 }}>{valor}</p>
    </div>
  )
}