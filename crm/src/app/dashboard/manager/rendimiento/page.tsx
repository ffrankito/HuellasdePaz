import { db } from '@/db'
import { usuarios, leads, leadInteracciones } from '@/db/schema'
import { eq, count, avg, and } from 'drizzle-orm'

export default async function RendimientoPage() {
  const agentes = await db.select().from(usuarios).where(eq(usuarios.rol, 'televenta'))

  const metricas = await Promise.all(
    agentes.map(async (agente) => {
      const [total, convertidos, perdidos, activos] = await Promise.all([
        db.select({ count: count() }).from(leads).where(eq(leads.asignadoAId, agente.id)),
        db.select({ count: count() }).from(leads).where(and(eq(leads.asignadoAId, agente.id), eq(leads.estado, 'convertido'))),
        db.select({ count: count() }).from(leads).where(and(eq(leads.asignadoAId, agente.id), eq(leads.estado, 'perdido'))),
        db.select({ count: count() }).from(leads).where(and(eq(leads.asignadoAId, agente.id), eq(leads.estado, 'nuevo'))),
      ])

      const totalCount = total[0].count
      const conversion = totalCount > 0 ? Math.round((convertidos[0].count / totalCount) * 100) : 0

      return {
        agente,
        total: totalCount,
        convertidos: convertidos[0].count,
        perdidos: perdidos[0].count,
        activos: activos[0].count,
        conversion,
      }
    })
  )

  const mejorAgente = metricas.sort((a, b) => b.conversion - a.conversion)[0]

  return (
    <div className="page-container">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: 0 }}>Rendimiento del equipo</h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>
          Comparativa de desempeño entre agentes
        </p>
      </div>

      {/* Mejor agente */}
      {mejorAgente && mejorAgente.total > 0 && (
        <div style={{ background: '#111827', borderRadius: 16, padding: '24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 32 }}>🏆</div>
          <div>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mejor conversión</p>
            <p style={{ fontSize: 18, fontWeight: 600, color: 'white', margin: 0 }}>{mejorAgente.agente.nombre}</p>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '2px 0 0' }}>{mejorAgente.conversion}% de conversión · {mejorAgente.total} leads gestionados</p>
          </div>
        </div>
      )}

      {/* Tabla comparativa */}
      <div className="table-container">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              {['Agente', 'Total leads', 'Activos', 'Convertidos', 'Perdidos', 'Conversión'].map(col => (
                <th key={col} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 500, color: '#9ca3af', letterSpacing: '0.05em' }}>
                  {col.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metricas.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '48px 20px', textAlign: 'center', fontSize: 14, color: '#9ca3af' }}>
                  No hay agentes registrados todavía
                </td>
              </tr>
            ) : (
              metricas.map(({ agente, total, activos, convertidos, perdidos, conversion }) => (
                <tr key={agente.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{agente.nombre.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 500, color: '#111827', margin: 0 }}>{agente.nombre}</p>
                        <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{agente.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: '#111827' }}>{total}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#a16207', background: '#fefce8', padding: '3px 10px', borderRadius: 20 }}>{activos}</span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#15803d', background: '#f0fdf4', padding: '3px 10px', borderRadius: 20 }}>{convertidos}</span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#dc2626', background: '#fef2f2', padding: '3px 10px', borderRadius: 20 }}>{perdidos}</span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden', minWidth: 60 }}>
                        <div style={{ width: `${conversion}%`, height: '100%', background: '#111827', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#111827', minWidth: 36 }}>{conversion}%</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}