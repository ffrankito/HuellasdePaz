import { db } from '@/db'
import { servicios, planes, clientes, planesConfig } from '@/db/schema'
import { eq, and, ne } from 'drizzle-orm'
import Link from 'next/link'
import { MarcarPagadoButton } from '@/components/cobranzas/MarcarPagadoButton'
import { RegistrarCuotaButton } from '@/components/cobranzas/RegistrarCuotaButton'

const tipoLabel: Record<string, string> = {
  cremacion_individual: 'Cremación individual',
  cremacion_comunitaria: 'Cremación comunitaria',
  entierro: 'Entierro',
}

function fmtMoneda(n: number) {
  return `$${n.toLocaleString('es-AR')}`
}

function fmtFecha(d: Date | string) {
  return new Date(d).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function calcularMesesDesde(fecha: Date | string): number {
  const desde = new Date(fecha)
  const ahora = new Date()
  return (ahora.getFullYear() - desde.getFullYear()) * 12 + (ahora.getMonth() - desde.getMonth())
}

export default async function CobranzasPage() {

  // Servicios impagos (no cancelados)
  const serviciosImpagos = await db
    .select({
      id: servicios.id,
      numero: servicios.numero,
      tipo: servicios.tipo,
      precio: servicios.precio,
      descuento: servicios.descuento,
      estado: servicios.estado,
      creadoEn: servicios.creadoEn,
      clienteNombre: clientes.nombre,
      clienteApellido: clientes.apellido,
      clienteId: clientes.id,
    })
    .from(servicios)
    .innerJoin(clientes, eq(servicios.clienteId, clientes.id))
    .where(and(eq(servicios.pagado, false), ne(servicios.estado, 'cancelado')))
    .orderBy(servicios.creadoEn)

  // Planes activos o atrasados
  const planesActivos = await db
    .select({
      id: planes.id,
      numero: planes.numero,
      cuotasMensual: planes.cuotasMensual,
      cuotasPagadas: planes.cuotasPagadas,
      cuotasTotales: planes.cuotasTotales,
      estado: planes.estado,
      fechaUltimoPago: planes.fechaUltimoPago,
      creadoEn: planes.creadoEn,
      clienteNombre: clientes.nombre,
      clienteApellido: clientes.apellido,
      clienteId: clientes.id,
      planNombre: planesConfig.nombre,
    })
    .from(planes)
    .innerJoin(clientes, eq(planes.clienteId, clientes.id))
    .innerJoin(planesConfig, eq(planes.planConfigId, planesConfig.id))
    .where(and(ne(planes.estado, 'cancelado'), ne(planes.estado, 'utilizado')))
    .orderBy(planes.creadoEn)

  // Enriquecer planes con cuotas atrasadas
  const planesConAtraso = planesActivos.map(p => {
    const mesesTranscurridos = Math.min(calcularMesesDesde(p.creadoEn), p.cuotasTotales)
    const cuotasEsperadas = mesesTranscurridos
    const cuotasAtrasadas = Math.max(0, cuotasEsperadas - p.cuotasPagadas)
    return { ...p, cuotasAtrasadas, cuotasEsperadas }
  }).filter(p => p.cuotasAtrasadas > 0 || p.estado === 'atrasado')

  // Totales
  const totalDeudaServicios = serviciosImpagos.reduce((acc, s) => {
    const precio = Number(s.precio ?? 0)
    const descuento = Number(s.descuento ?? 0)
    return acc + precio - descuento
  }, 0)

  const totalDeudaPlanes = planesConAtraso.reduce((acc, p) => {
    return acc + Number(p.cuotasMensual) * p.cuotasAtrasadas
  }, 0)

  const cardStyle = {
    background: 'white',
    borderRadius: 16,
    border: '1px solid #f3f4f6',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  }

  return (
    <div className="page-container">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>Cobranzas</h1>
        <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Servicios impagos y cuotas de planes pendientes</p>
      </div>

      {/* Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        <div style={{ ...cardStyle, borderLeft: '3px solid #dc2626' }}>
          <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 6px' }}>Deuda servicios</p>
          <p style={{ fontSize: 26, fontWeight: 700, color: '#dc2626', margin: 0 }}>{fmtMoneda(totalDeudaServicios)}</p>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0 0' }}>{serviciosImpagos.length} servicio{serviciosImpagos.length !== 1 ? 's' : ''} impago{serviciosImpagos.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ ...cardStyle, borderLeft: '3px solid #f59e0b' }}>
          <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 6px' }}>Cuotas atrasadas</p>
          <p style={{ fontSize: 26, fontWeight: 700, color: '#a16207', margin: 0 }}>{fmtMoneda(totalDeudaPlanes)}</p>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0 0' }}>{planesConAtraso.length} plan{planesConAtraso.length !== 1 ? 'es' : ''} con atraso</p>
        </div>
        <div style={{ ...cardStyle, borderLeft: '3px solid #2d8a54' }}>
          <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 6px' }}>Total pendiente</p>
          <p style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: 0 }}>{fmtMoneda(totalDeudaServicios + totalDeudaPlanes)}</p>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0 0' }}>Entre servicios y planes</p>
        </div>
      </div>

      {/* Servicios impagos */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 }}>Servicios impagos</h2>
          <span style={{ fontSize: 12, color: '#6b7280', background: '#f3f4f6', padding: '3px 10px', borderRadius: 20 }}>
            {serviciosImpagos.length} total
          </span>
        </div>

        {serviciosImpagos.length === 0 ? (
          <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>No hay servicios impagos. 🎉</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['#', 'Cliente', 'Tipo', 'Importe', 'Estado', 'Fecha', ''].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {serviciosImpagos.map((s, i) => {
                  const importe = Number(s.precio ?? 0) - Number(s.descuento ?? 0)
                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid #f9fafb', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={{ padding: '12px 12px', color: '#9ca3af', fontWeight: 500 }}>#{s.numero}</td>
                      <td style={{ padding: '12px 12px' }}>
                        <Link href={`/dashboard/clientes/${s.clienteId}`} style={{ color: '#111827', fontWeight: 500, textDecoration: 'none' }}>
                          {s.clienteNombre} {s.clienteApellido}
                        </Link>
                      </td>
                      <td style={{ padding: '12px 12px', color: '#374151' }}>{tipoLabel[s.tipo] ?? s.tipo}</td>
                      <td style={{ padding: '12px 12px', color: '#dc2626', fontWeight: 700 }}>{fmtMoneda(importe)}</td>
                      <td style={{ padding: '12px 12px' }}>
                        <span style={{ fontSize: 11, background: '#f3f4f6', color: '#6b7280', padding: '3px 8px', borderRadius: 12, whiteSpace: 'nowrap' }}>
                          {s.estado.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '12px 12px', color: '#9ca3af', whiteSpace: 'nowrap' }}>{fmtFecha(s.creadoEn)}</td>
                      <td style={{ padding: '12px 12px' }}>
                        <MarcarPagadoButton servicioId={s.id} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Planes con cuotas atrasadas */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 }}>Planes con cuotas atrasadas</h2>
          <span style={{ fontSize: 12, color: '#6b7280', background: '#f3f4f6', padding: '3px 10px', borderRadius: 20 }}>
            {planesConAtraso.length} total
          </span>
        </div>

        {planesConAtraso.length === 0 ? (
          <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>No hay planes con cuotas atrasadas.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['#', 'Cliente', 'Plan', 'Cuota mensual', 'Cuotas', 'Atraso', 'Último pago', ''].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {planesConAtraso.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f9fafb', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                    <td style={{ padding: '12px 12px', color: '#9ca3af', fontWeight: 500 }}>#{p.numero}</td>
                    <td style={{ padding: '12px 12px' }}>
                      <Link href={`/dashboard/clientes/${p.clienteId}`} style={{ color: '#111827', fontWeight: 500, textDecoration: 'none' }}>
                        {p.clienteNombre} {p.clienteApellido}
                      </Link>
                    </td>
                    <td style={{ padding: '12px 12px', color: '#374151' }}>{p.planNombre}</td>
                    <td style={{ padding: '12px 12px', color: '#374151', fontWeight: 600 }}>{fmtMoneda(Number(p.cuotasMensual))}</td>
                    <td style={{ padding: '12px 12px', color: '#6b7280' }}>
                      {p.cuotasPagadas}/{p.cuotasTotales}
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <span style={{ fontSize: 12, background: '#fff7ed', color: '#c2410c', fontWeight: 700, padding: '3px 10px', borderRadius: 12, whiteSpace: 'nowrap' }}>
                        {p.cuotasAtrasadas} cuota{p.cuotasAtrasadas !== 1 ? 's' : ''} · {fmtMoneda(p.cuotasAtrasadas * Number(p.cuotasMensual))}
                      </span>
                    </td>
                    <td style={{ padding: '12px 12px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                      {p.fechaUltimoPago ? fmtFecha(p.fechaUltimoPago) : '—'}
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <RegistrarCuotaButton
                          planId={p.id}
                          cuotasPagadas={p.cuotasPagadas}
                          cuotasTotales={p.cuotasTotales}
                        />
                        <Link href={`/dashboard/planes/${p.id}`} style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                          Ver →
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
