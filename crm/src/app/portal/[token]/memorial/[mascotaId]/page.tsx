import { db } from '@/db'
import { clientes, mascotas, servicios } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CompartirButtonClient } from '@/components/portal/CompartirButton'
import { EditarMemorialInline } from '@/components/portal/EditarMemorialInline'
import { CambiarFotoMascota } from '@/components/portal/CambiarFotoMascota'

export default async function MemorialPage({
  params,
}: {
  params: Promise<{ token: string; mascotaId: string }>
}) {
  const { token, mascotaId } = await params

  const cliente = await db.query.clientes.findFirst({
    where: eq(clientes.tokenPortal, token),
  })
  if (!cliente) notFound()

  const mascota = await db.query.mascotas.findFirst({
    where: and(eq(mascotas.id, mascotaId), eq(mascotas.clienteId, cliente.id)),
  })
  if (!mascota) notFound()

  const servicioMascota = await db.query.servicios.findFirst({
    where: and(eq(servicios.mascotaId, mascotaId), eq(servicios.clienteId, cliente.id)),
  })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const esClienteLogueado = user?.id === cliente.authUserId

  const galeria = (mascota.galeria ?? []) as string[]

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#08080f', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>

      {/* Fondo estrellado sutil */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0)', backgroundSize: '36px 36px', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 50% -10%, rgba(45,138,84,0.1) 0%, transparent 55%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 480, margin: '0 auto', padding: '28px 20px 72px' }}>

        {/* Encabezado superior */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
          <a
            href={`/portal/${token}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontSize: 13, transition: 'color 0.2s' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Volver
          </a>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.22em', textTransform: 'uppercase', margin: 0 }}>
            Huellas de Paz
          </p>
        </div>

        {/* HERO */}
        <CambiarFotoMascota
          mascotaId={mascota.id}
          token={token}
          fotoActual={mascota.foto ?? null}
          nombre={mascota.nombre}
          especie={mascota.especie}
          raza={mascota.raza ?? null}
          esEditor={esClienteLogueado}
        />

        {/* Fechas */}
        {(mascota.fechaNacimiento || mascota.fechaFallecimiento) && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0, padding: '24px 16px 28px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {mascota.fechaNacimiento && (
              <div style={{ textAlign: 'center', flex: 1 }}>
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', margin: '0 0 5px', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Nació</p>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', margin: 0, fontWeight: 500 }}>{formatDate(mascota.fechaNacimiento)}</p>
              </div>
            )}
            {mascota.fechaNacimiento && mascota.fechaFallecimiento && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px' }}>
                <span style={{ fontSize: 20, opacity: 0.25 }}>🕯️</span>
              </div>
            )}
            {mascota.fechaFallecimiento && (
              <div style={{ textAlign: 'center', flex: 1 }}>
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', margin: '0 0 5px', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Partió</p>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', margin: 0, fontWeight: 500 }}>{formatDate(mascota.fechaFallecimiento)}</p>
              </div>
            )}
          </div>
        )}

        {/* Dedicatoria */}
        {mascota.dedicatoria && (
          <div style={{ padding: '36px 8px 32px' }}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ width: 2, flexShrink: 0, alignSelf: 'stretch', background: 'linear-gradient(to bottom, rgba(45,138,84,0.6), rgba(45,138,84,0.1))', borderRadius: 2, marginTop: 4 }} />
              <div>
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', margin: '0 0 14px', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Dedicatoria</p>
                <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.72)', margin: 0, lineHeight: 1.85, fontStyle: 'italic', fontWeight: 300, fontFamily: 'Georgia, Times New Roman, serif' }}>
                  {mascota.dedicatoria}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Galería */}
        {galeria.length > 0 && (
          <div style={{ paddingBottom: 36 }}>
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', margin: '0 0 14px 8px', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              Galería de recuerdos
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: galeria.length === 1 ? '1fr' : galeria.length === 2 ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
              gap: 8,
            }}>
              {galeria.map((url, i) => (
                <div
                  key={i}
                  style={{
                    aspectRatio: galeria.length % 2 !== 0 && i === galeria.length - 1 ? '2/1' : '1',
                    borderRadius: 18,
                    overflow: 'hidden',
                    background: 'rgba(255,255,255,0.04)',
                    gridColumn: galeria.length % 2 !== 0 && i === galeria.length - 1 ? '1 / -1' : undefined,
                  }}
                >
                  <img src={url} alt={`Recuerdo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <CompartirButtonClient nombre={mascota.nombre} />
          {servicioMascota && (
            <a
              href={`/api/portal/certificado/${servicioMascota.id}?token=${token}`}
              target="_blank"
              style={{
                flex: 1, padding: '13px', borderRadius: 14, fontSize: 13, fontWeight: 500,
                border: '1px solid rgba(45,138,84,0.3)', background: 'rgba(45,138,84,0.08)',
                color: 'rgba(45,138,84,0.85)', textDecoration: 'none', textAlign: 'center' as const,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
              Certificado
            </a>
          )}
        </div>

        {/* Editar / Login */}
        {esClienteLogueado ? (
          <EditarMemorialInline mascota={mascota} token={token} />
        ) : (
          <a
            href={`/portal/login?token=${token}`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '13px', borderRadius: 14, fontSize: 13,
              fontWeight: 500, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(45,138,84,0.1)',
              color: 'rgba(45,138,84,0.8)', textDecoration: 'none', boxSizing: 'border-box' as const,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Ingresá para personalizar el memorial
          </a>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 52, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(45,138,84,0.4)' }} />
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.12)', letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0 }}>
              Huellas de Paz · Rosario
            </p>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(45,138,84,0.4)' }} />
          </div>
        </div>

      </div>
    </div>
  )
}
