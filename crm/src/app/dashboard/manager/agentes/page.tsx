import { db } from '@/db'
import { usuarios, leads } from '@/db/schema'
import { eq, and, count } from 'drizzle-orm'
import Link from 'next/link'
import NuevoAgenteBtn from '@/components/dashboard/NuevoAgenteBtn'

export default async function ManagerAgentesPage() {
  const agentes = await db
    .select()
    .from(usuarios)
    .where(eq(usuarios.rol, 'televenta'))

  const metricas = await Promise.all(
    agentes.map(async (agente) => {
      const [total, convertidos, perdidos, nuevos] = await Promise.all([
        db.select({ count: count() }).from(leads).where(eq(leads.asignadoAId, agente.id)),
        db.select({ count: count() }).from(leads).where(and(eq(leads.asignadoAId, agente.id), eq(leads.estado, 'convertido'))),
        db.select({ count: count() }).from(leads).where(and(eq(leads.asignadoAId, agente.id), eq(leads.estado, 'perdido'))),
        db.select({ count: count() }).from(leads).where(and(eq(leads.asignadoAId, agente.id), eq(leads.estado, 'nuevo'))),
      ])
      const t = total[0].count
      return {
        ...agente,
        total: t,
        convertidos: convertidos[0].count,
        perdidos: perdidos[0].count,
        nuevos: nuevos[0].count,
        conversion: t > 0 ? Math.round((convertidos[0].count / t) * 100) : 0,
      }
    })
  )

  // Ordenar por conversión descendente
  metricas.sort((a, b) => b.conversion - a.conversion)

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: 0 }}>Agentes</h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>
            {agentes.length} {agentes.length === 1 ? 'agente activo' : 'agentes activos'}
          </p>
        </div>
        <NuevoAgenteBtn />
      </div>

      {metricas.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '48px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>No hay agentes con rol televenta registrados todavía</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Mejor agente highlight */}
          {metricas[0].total > 0 && (
            <div style={{ background: '#111827', borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
              <span style={{ fontSize: 28 }}>🏆</span>
              <div>
                <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Mejor conversión</p>
                <p style={{ fontSize: 17, fontWeight: 600, color: 'white', margin: 0 }}>{metricas[0].nombre}</p>
                <p style={{ fontSize: 13, color: '#9ca3af', margin: '2px 0 0' }}>
                  {metricas[0].conversion}% conversión · {metricas[0].total} leads gestionados
                </p>
              </div>
            </div>
          )}

          {/* Tarjetas de agentes */}
          {metricas.map((agente, idx) => (
            <div key={agente.id} style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: 'white' }}>
                    {agente.nombre.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 }}>{agente.nombre}</p>
                  <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>{agente.email}</p>
                </div>
                {idx === 0 && agente.total > 0 && (
                  <span style={{ fontSize: 11, background: '#fefce8', color: '#a16207', padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>
                    Top agente
                  </span>
                )}
                <Link
                  href={`/dashboard/leads?agenteId=${agente.id}`}
                  style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', fontWeight: 500 }}
                >
                  Ver leads →
                </Link>
              </div>

              <div className="grid-4" style={{ marginBottom: 14 }}>
                <div style={{ background: '#f9fafb', borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px' }}>Total</p>
                  <p style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>{agente.total}</p>
                </div>
                <div style={{ background: '#eff6ff', borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 11, color: '#1d4ed8', margin: '0 0 4px' }}>Sin contactar</p>
                  <p style={{ fontSize: 22, fontWeight: 700, color: '#1d4ed8', margin: 0 }}>{agente.nuevos}</p>
                </div>
                <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 11, color: '#15803d', margin: '0 0 4px' }}>Convertidos</p>
                  <p style={{ fontSize: 22, fontWeight: 700, color: '#15803d', margin: 0 }}>{agente.convertidos}</p>
                </div>
                <div style={{ background: '#fef2f2', borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 11, color: '#dc2626', margin: '0 0 4px' }}>Perdidos</p>
                  <p style={{ fontSize: 22, fontWeight: 700, color: '#dc2626', margin: 0 }}>{agente.perdidos}</p>
                </div>
              </div>

              {/* Barra de conversión */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>Tasa de conversión</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{agente.conversion}%</span>
                </div>
                <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${agente.conversion}%`, height: '100%', background: agente.conversion >= 50 ? '#15803d' : agente.conversion >= 25 ? '#a16207' : '#dc2626', borderRadius: 3, transition: 'width 0.3s ease' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}