import { db } from '@/db'
import { convenios, leads, clientes } from '@/db/schema'
import { eq, count } from 'drizzle-orm'
import Link from 'next/link'

const estadoColors: Record<string, { bg: string; color: string; label: string }> = {
  sin_convenio: { bg: '#f3f4f6', color: '#6b7280', label: 'Sin convenio' },
  en_negociacion: { bg: '#fefce8', color: '#a16207', label: 'En negociación' },
  activo: { bg: '#f0fdf4', color: '#15803d', label: 'Convenio activo' },
  pausado: { bg: '#fef2f2', color: '#dc2626', label: 'Pausado' },
}

export default async function ConveniosPage() {
  const data = await db.select().from(convenios)

  const conMetricas = await Promise.all(
    data.map(async (v) => {
      const [totalLeads, totalClientes] = await Promise.all([
        db.select({ count: count() }).from(leads).where(eq(leads.veterinariaId, v.id)),
        db.select({ count: count() }).from(clientes).where(eq(clientes.veterinariaId, v.id)),
      ])
      return {
        ...v,
        totalLeads: totalLeads[0].count,
        totalClientes: totalClientes[0].count,
      }
    })
  )

  const activas = data.filter(v => v.estadoConvenio === 'activo').length
  const enNegociacion = data.filter(v => v.estadoConvenio === 'en_negociacion').length

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: 0 }}>Convenios</h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>
            {data.length} registrados · {activas} con convenio activo · {enNegociacion} en negociación
          </p>
        </div>
        <Link href="/dashboard/convenios/nueva" style={{
          background: '#111827', color: 'white', padding: '10px 20px',
          borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: 'none',
        }}>
          + Nuevo convenio
        </Link>
      </div>

      {/* Métricas rápidas */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #f3f4f6', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 6px' }}>Total registrados</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0 }}>{data.length}</p>
        </div>
        <div style={{ background: '#f0fdf4', borderRadius: 14, border: '1px solid #bbf7d0', padding: '18px 20px' }}>
          <p style={{ fontSize: 12, color: '#15803d', margin: '0 0 6px' }}>Convenio activo</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#15803d', margin: 0 }}>{activas}</p>
        </div>
        <div style={{ background: '#fefce8', borderRadius: 14, border: '1px solid #fde68a', padding: '18px 20px' }}>
          <p style={{ fontSize: 12, color: '#a16207', margin: '0 0 6px' }}>En negociación</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#a16207', margin: 0 }}>{enNegociacion}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #f3f4f6', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 6px' }}>Sin convenio</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#6b7280', margin: 0 }}>
            {data.filter(v => v.estadoConvenio === 'sin_convenio').length}
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div className="table-container">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              {['Convenio', 'Tipo', 'Responsable', 'Contacto', 'Estado', 'Beneficio', 'Leads', 'Clientes', ''].map(col => (
                <th key={col} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 500, color: '#9ca3af', letterSpacing: '0.05em' }}>
                  {col.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {conMetricas.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: '48px 20px', textAlign: 'center', fontSize: 14, color: '#9ca3af' }}>
                  No hay convenios registrados todavía
                </td>
              </tr>
            ) : (
              conMetricas.map(v => {
                const badge = estadoColors[v.estadoConvenio] ?? estadoColors.sin_convenio
                return (
                  <tr key={v.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>{v.nombre}</p>
                      {v.direccion && <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{v.direccion}</p>}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#6b7280', textTransform: 'capitalize' }}>
                      {v.tipo ?? '—'}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: '#4b5563' }}>
                      {v.responsable ?? '—'}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {v.telefono && <p style={{ fontSize: 13, color: '#4b5563', margin: 0 }}>{v.telefono}</p>}
                      {v.email && <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{v.email}</p>}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ background: badge.bg, color: badge.color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {v.descuentoPorcentaje && Number(v.descuentoPorcentaje) > 0 ? (
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#15803d', margin: 0 }}>
                            {Number(v.descuentoPorcentaje)}% descuento
                          </p>
                          {v.beneficioDescripcion && (
                            <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{v.beneficioDescripcion}</p>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: 13, color: '#9ca3af' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: '#111827' }}>
                      {v.totalLeads}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: '#111827' }}>
                      {v.totalClientes}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <Link href={`/dashboard/convenios/${v.id}`} style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', fontWeight: 500 }}>
                        Ver →
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}