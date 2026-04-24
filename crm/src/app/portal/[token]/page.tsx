import { db } from '@/db'
import { clientes, mascotas, servicios, planes } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { ServiciosRealtime } from '@/components/portal/ServiciosRealtime'

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

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>

      {/* Header */}
      <div style={{ background: '#111827', padding: '24px 24px 32px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8 2 4 6 4 10c0 5 8 12 8 12s8-7 8-12c0-4-4-8-8-8z" fill="white" fillOpacity="0.9"/>
              <circle cx="9" cy="7" r="1.5" fill="white" fillOpacity="0.5"/>
              <circle cx="15" cy="7" r="1.5" fill="white" fillOpacity="0.5"/>
              <circle cx="7" cy="11" r="1.2" fill="white" fillOpacity="0.5"/>
              <circle cx="17" cy="11" r="1.2" fill="white" fillOpacity="0.5"/>
            </svg>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Huellas de Paz</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'white', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
            Hola, {cliente.nombre}
          </h1>
          <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>
            Bienvenido/a a tu portal personal
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '28px 16px' }}>

        {/* Servicios en curso (con Realtime) */}
        <ServiciosRealtime
          initialServicios={serviciosData}
          mascotas={mascotasData.map(m => ({ id: m.id, nombre: m.nombre, foto: m.foto ?? null, especie: m.especie }))}
          clienteId={cliente.id}
        />

        {/* Memorial */}
        {mascotasData.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>Memorial</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {mascotasData.map(m => (
                <a key={m.id} href={`/portal/${token}/memorial/${m.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'box-shadow 0.15s' }}>
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
                      <span style={{ fontSize: 13, color: '#9ca3af', flexShrink: 0 }}>Ver →</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Mis planes */}
        {planesData.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>Mis planes</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {planesData.map(p => {
                const progreso = Math.round(((p.cuotasPagadas ?? 0) / p.cuotasTotales) * 100)
                const coberturaActual =
                  (p.cuotasPagadas ?? 0) <= 6 ? '0%' :
                  (p.cuotasPagadas ?? 0) <= 12 ? '50%' : '100%'
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
                    <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden', marginBottom: 10 }}>
                      <div style={{ width: `${progreso}%`, height: '100%', background: '#111827', borderRadius: 3 }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>Cobertura actual: <strong style={{ color: '#374151' }}>{coberturaActual}</strong></span>
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>{progreso}% completado</span>
                    </div>
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
