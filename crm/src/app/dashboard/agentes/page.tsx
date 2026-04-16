import { db } from '@/db'
import { usuarios, leads } from '@/db/schema'
import { eq, count } from 'drizzle-orm'

export default async function AgentesPage() {
  const agentes = await db.select().from(usuarios).where(eq(usuarios.rol, 'televenta'))

  const metricas = await Promise.all(
    agentes.map(async (agente) => {
      const [totalLeads, leadsConvertidos, leadsActivos] = await Promise.all([
        db.select({ count: count() }).from(leads).where(eq(leads.asignadoAId, agente.id)),
        db.select({ count: count() }).from(leads).where(eq(leads.estado, 'convertido')),
        db.select({ count: count() }).from(leads).where(eq(leads.estado, 'nuevo')),
      ])
      return {
        ...agente,
        totalLeads: totalLeads[0].count,
        convertidos: leadsConvertidos[0].count,
        activos: leadsActivos[0].count,
        conversion: totalLeads[0].count > 0
          ? Math.round((leadsConvertidos[0].count / totalLeads[0].count) * 100)
          : 0,
      }
    })
  )

  return (
    <div className="page-container">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: 0 }}>Agentes</h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>
          {agentes.length} agentes activos
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {metricas.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>No hay agentes registrados todavía</p>
          </div>
        ) : (
          metricas.map(agente => (
            <div key={agente.id} style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: 'white' }}>{agente.nombre.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 }}>{agente.nombre}</p>
                  <p style={{ fontSize: 13, color: '#6b7280', margin: '2px 0 0' }}>{agente.email}</p>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <span style={{ fontSize: 11, background: '#f0fdf4', color: '#15803d', padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>
                    Activo
                  </span>
                </div>
              </div>

              <div className="grid-4">
                <div style={{ background: '#f9fafb', borderRadius: 12, padding: '16px' }}>
                  <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 6px' }}>Total leads</p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>{agente.totalLeads}</p>
                </div>
                <div style={{ background: '#f9fafb', borderRadius: 12, padding: '16px' }}>
                  <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 6px' }}>Activos</p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: '#a16207', margin: 0 }}>{agente.activos}</p>
                </div>
                <div style={{ background: '#f9fafb', borderRadius: 12, padding: '16px' }}>
                  <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 6px' }}>Convertidos</p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: '#15803d', margin: 0 }}>{agente.convertidos}</p>
                </div>
                <div style={{ background: '#f9fafb', borderRadius: 12, padding: '16px' }}>
                  <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 6px' }}>Conversión</p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>{agente.conversion}%</p>
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>Tasa de conversión</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{agente.conversion}%</span>
                </div>
                <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${agente.conversion}%`, height: '100%', background: '#111827', borderRadius: 3 }} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}