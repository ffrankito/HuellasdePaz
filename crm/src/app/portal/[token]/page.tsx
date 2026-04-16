import { db } from '@/db'
import { clientes, mascotas, servicios, planes } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'

const estadoColors: Record<string, { bg: string; color: string; label: string }> = {
  ingresado: { bg: '#eff6ff', color: '#1d4ed8', label: 'Ingresado' },
  retiro_pendiente: { bg: '#fefce8', color: '#a16207', label: 'Retiro pendiente' },
  en_transporte: { bg: '#fff7ed', color: '#c2410c', label: 'En camino' },
  recibido: { bg: '#f0fdf4', color: '#15803d', label: 'Recibido' },
  en_cremacion: { bg: '#fdf4ff', color: '#7e22ce', label: 'En cremación' },
  cremado: { bg: '#f0fdf4', color: '#15803d', label: 'Cremado' },
  listo_entrega: { bg: '#fefce8', color: '#a16207', label: 'Listo para retirar' },
  entregado: { bg: '#f0fdf4', color: '#15803d', label: 'Entregado' },
  cancelado: { bg: '#fef2f2', color: '#dc2626', label: 'Cancelado' },
}

const pasos = [
  'ingresado', 'retiro_pendiente', 'en_transporte', 'recibido',
  'en_cremacion', 'cremado', 'listo_entrega', 'entregado'
]

export default async function PortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const cliente = await db.query.clientes.findFirst({
    where: eq(clientes.tokenPortal, token),
  })

  if (!cliente) notFound()

  const [mascotasData, serviciosData, planesData] = await Promise.all([
    db.select().from(mascotas).where(eq(mascotas.clienteId, cliente.id)),
    db.select().from(servicios).where(eq(servicios.clienteId, cliente.id)),
    db.select().from(planes).where(eq(planes.clienteId, cliente.id)),
  ])

  const serviciosActivos = serviciosData.filter(s => s.estado !== 'entregado' && s.estado !== 'cancelado')

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>
      <div style={{ background: '#111827', padding: '24px 24px 32px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ width: 32, height: 32, background: 'white', borderRadius: 8, marginBottom: 16 }} />
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'white', margin: '0 0 4px' }}>
            Hola, {cliente.nombre}
          </h1>
          <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>
            Bienvenido a tu portal de Huellas de Paz
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px' }}>

        {serviciosActivos.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>Servicios en curso</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {serviciosActivos.map(s => {
                const mascota = mascotasData.find(m => m.id === s.mascotaId)
                const badge = estadoColors[s.estado] ?? { bg: '#f3f4f6', color: '#374151', label: s.estado }
                const pasoActual = pasos.indexOf(s.estado)
                return (
                  <div key={s.id} style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div>
                        <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>{mascota?.nombre ?? 'Mascota'}</p>
                        <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{s.tipo.replace(/_/g, ' ')}</p>
                      </div>
                      <span style={{ background: badge.bg, color: badge.color, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                        {badge.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>Progreso</span>
                      <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{pasoActual + 1} de {pasos.length}</span>
                    </div>
                    <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${((pasoActual + 1) / pasos.length) * 100}%`, height: '100%', background: '#111827', borderRadius: 3 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {mascotasData.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>Memorial</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {mascotasData.map(m => (
                <a key={m.id} href={`/portal/${token}/memorial/${m.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, overflow: 'hidden' }}>
                        {m.foto ? (
                          <img src={m.foto} alt={m.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          m.especie === 'perro' ? '🐕' : m.especie === 'gato' ? '🐈' : '🐾'
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>{m.nombre}</p>
                        <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 2px', textTransform: 'capitalize' }}>
                          {m.especie}{m.raza ? ` · ${m.raza}` : ''}
                        </p>
                        {m.fechaFallecimiento && (
                          <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
                            {new Date(m.fechaFallecimiento).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                      <span style={{ fontSize: 13, color: '#9ca3af' }}>Ver memorial →</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {planesData.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>Mis planes</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {planesData.map(p => {
                const progreso = Math.round(((p.cuotasPagadas ?? 0) / p.cuotasTotales) * 100)
                return (
                  <div key={p.id} style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <p style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 }}>Plan de previsión</p>
                      <span style={{ fontSize: 12, fontWeight: 500, background: p.estado === 'activo' ? '#f0fdf4' : '#f3f4f6', color: p.estado === 'activo' ? '#15803d' : '#6b7280', padding: '3px 10px', borderRadius: 20 }}>
                        {p.estado}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: '#6b7280' }}>Cuotas pagadas</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{p.cuotasPagadas ?? 0} / {p.cuotasTotales}</span>
                    </div>
                    <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${progreso}%`, height: '100%', background: '#111827', borderRadius: 3 }} />
                    </div>
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: '8px 0 0', textAlign: 'right' }}>{progreso}% completado</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Huellas de Paz · Rosario, Argentina</p>
        </div>
      </div>
    </div>
  )
}