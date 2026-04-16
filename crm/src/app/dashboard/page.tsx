import { db } from '@/db'
import { clientes, servicios, leads, inventario } from '@/db/schema'
import { count, eq } from 'drizzle-orm'
import Link from 'next/link'

export default async function DashboardPage() {
  const [
    totalClientes,
    totalServicios,
    leadsNuevos,
    serviciosActivos,
    stockBajo,
  ] = await Promise.all([
    db.select({ count: count() }).from(clientes),
    db.select({ count: count() }).from(servicios),
    db.select({ count: count() }).from(leads).where(eq(leads.estado, 'nuevo')),
    db.select({ count: count() }).from(servicios).where(eq(servicios.estado, 'en_cremacion')),
    db.select().from(inventario).then(items => items.filter(i => i.stockActual <= i.stockMinimo)),
  ])

  const ultimosServicios = await db
    .select()
    .from(servicios)
    .orderBy(servicios.creadoEn)
    .limit(5)

  const ultimosLeads = await db
    .select()
    .from(leads)
    .where(eq(leads.estado, 'nuevo'))
    .orderBy(leads.creadoEn)
    .limit(5)

  return (
    <div className="page-container">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>
          {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Métricas */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        <StatCard title="Clientes totales" value={totalClientes[0].count} href="/dashboard/clientes" color="#111827" />
        <StatCard title="Servicios totales" value={totalServicios[0].count} href="/dashboard/servicios" color="#111827" />
        <StatCard title="Leads sin contactar" value={leadsNuevos[0].count} href="/dashboard/leads" color="#a16207" alert={leadsNuevos[0].count > 0} />
        <StatCard title="En cremación ahora" value={serviciosActivos[0].count} href="/dashboard/agenda" color="#7e22ce" />
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        {/* Últimos servicios */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 }}>Últimos servicios</h2>
            <Link href="/dashboard/servicios" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>Ver todos →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ultimosServicios.length === 0 ? (
              <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>Sin servicios todavía</p>
            ) : ultimosServicios.map(s => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f9fafb' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#111827', margin: 0 }}>{s.tipo.replace(/_/g, ' ')}</p>
                  <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>{new Date(s.creadoEn).toLocaleDateString('es-AR')}</p>
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', background: '#f3f4f6', padding: '3px 10px', borderRadius: 20 }}>
                  {s.estado.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Leads sin contactar */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 }}>Leads sin contactar</h2>
            <Link href="/dashboard/leads" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>Ver todos →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ultimosLeads.length === 0 ? (
              <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>No hay leads pendientes</p>
            ) : ultimosLeads.map(l => (
              <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f9fafb' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#111827', margin: 0 }}>{l.nombre}</p>
                  <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>{l.telefono} · {l.origen ?? 'sin origen'}</p>
                </div>
                <span style={{ fontSize: 12, color: '#a16207', background: '#fefce8', padding: '3px 10px', borderRadius: 20, fontWeight: 500 }}>
                  nuevo
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alertas de stock */}
      {stockBajo.length > 0 && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 16, padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#dc2626', margin: 0 }}>⚠ Stock bajo</h2>
            <Link href="/dashboard/inventario" style={{ fontSize: 13, color: '#dc2626', textDecoration: 'none' }}>Ver inventario →</Link>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {stockBajo.map(item => (
              <div key={item.id} style={{ background: 'white', borderRadius: 10, padding: '10px 16px', border: '1px solid #fecaca' }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#111827', margin: 0 }}>{item.nombre}</p>
                <p style={{ fontSize: 12, color: '#dc2626', margin: '2px 0 0' }}>Stock: {item.stockActual} / mín: {item.stockMinimo}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value, href, color, alert }: {
  title: string
  value: number
  href: string
  color: string
  alert?: boolean
}) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'white',
        borderRadius: 16,
        border: `1px solid ${alert ? '#fecaca' : '#f3f4f6'}`,
        padding: '24px 28px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s',
      }}>
        <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 10px' }}>{title}</p>
        <p style={{ fontSize: 36, fontWeight: 700, color, margin: 0 }}>{value}</p>
      </div>
    </Link>
  )
}