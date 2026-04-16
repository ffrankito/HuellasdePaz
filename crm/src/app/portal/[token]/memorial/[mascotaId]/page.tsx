import { db } from '@/db'
import { clientes, mascotas } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CompartirButtonClient } from '@/components/portal/CompartirButton'

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

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const esClienteLogueado = user?.id === cliente.authUserId

  const emoji =
    mascota.especie === 'perro' ? '🐕' : mascota.especie === 'gato' ? '🐈' : '🐾'

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
      }}
    >
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div
          style={{
            background:
              'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            borderRadius: 24,
            padding: '48px 40px',
            textAlign: 'center',
            boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.03)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -40,
              left: -40,
              width: 160,
              height: 160,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.02)',
            }}
          />

          <div style={{ marginBottom: 24, position: 'relative', zIndex: 1 }}>
            {mascota.foto ? (
              <img
                src={mascota.foto}
                alt={mascota.nombre}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid rgba(255,255,255,0.2)',
                  margin: '0 auto',
                  display: 'block',
                }}
              />
            ) : (
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 48,
                  margin: '0 auto',
                  border: '3px solid rgba(255,255,255,0.15)',
                }}
              >
                {emoji}
              </div>
            )}
          </div>

          <h1
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: 'white',
              margin: '0 0 8px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {mascota.nombre}
          </h1>

          <p
            style={{
              fontSize: 15,
              color: 'rgba(255,255,255,0.5)',
              margin: '0 0 24px',
              position: 'relative',
              zIndex: 1,
              textTransform: 'capitalize',
            }}
          >
            {mascota.especie}
            {mascota.raza ? ` · ${mascota.raza}` : ''}
          </p>

          {(mascota.fechaNacimiento || mascota.fechaFallecimiento) && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 32,
                marginBottom: 28,
                position: 'relative',
                zIndex: 1,
              }}
            >
              {mascota.fechaNacimiento && (
                <div>
                  <p
                    style={{
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.4)',
                      margin: '0 0 4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}
                  >
                    Nació
                  </p>
                  <p
                    style={{
                      fontSize: 14,
                      color: 'rgba(255,255,255,0.8)',
                      margin: 0,
                      fontWeight: 500,
                    }}
                  >
                    {new Date(mascota.fechaNacimiento).toLocaleDateString(
                      'es-AR',
                      {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      }
                    )}
                  </p>
                </div>
              )}

              {mascota.fechaNacimiento && mascota.fechaFallecimiento && (
                <div
                  style={{ width: 1, background: 'rgba(255,255,255,0.1)' }}
                />
              )}

              {mascota.fechaFallecimiento && (
                <div>
                  <p
                    style={{
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.4)',
                      margin: '0 0 4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}
                  >
                    Partió
                  </p>
                  <p
                    style={{
                      fontSize: 14,
                      color: 'rgba(255,255,255,0.8)',
                      margin: 0,
                      fontWeight: 500,
                    }}
                  >
                    {new Date(mascota.fechaFallecimiento).toLocaleDateString(
                      'es-AR',
                      {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      }
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {mascota.dedicatoria && (
            <div
              style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 14,
                padding: '16px 20px',
                marginBottom: 28,
                position: 'relative',
                zIndex: 1,
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <p
                style={{
                  fontSize: 15,
                  color: 'rgba(255,255,255,0.75)',
                  margin: 0,
                  lineHeight: 1.7,
                  fontStyle: 'italic',
                }}
              >
                &ldquo;{mascota.dedicatoria}&rdquo;
              </p>
            </div>
          )}

          <div
            style={{
              fontSize: 24,
              marginBottom: 20,
              position: 'relative',
              zIndex: 1,
              opacity: 0.3,
            }}
          >
            🐾
          </div>

          <p
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.25)',
              margin: 0,
              position: 'relative',
              zIndex: 1,
              letterSpacing: '0.05em',
            }}
          >
            HUELLAS DE PAZ · ROSARIO
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <a
            href={`/portal/${token}`}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 500,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.7)',
              textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            ← Volver
          </a>
          <CompartirButtonClient nombre={mascota.nombre} />
        </div>

        {esClienteLogueado && (
          <a
            href={`/portal/${token}/memorial/${mascotaId}/editar`}
            style={{
              display: 'block',
              width: '100%',
              marginTop: 12,
              padding: '12px',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 500,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.7)',
              textDecoration: 'none',
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          >
            ✏️ Editar memorial
          </a>
        )}

        {!esClienteLogueado && (
          <a
            href={`/portal/login?token=${token}`}
            style={{
              display: 'block',
              width: '100%',
              marginTop: 12,
              padding: '12px',
              borderRadius: 12,
              fontSize: 13,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent',
              color: 'rgba(255,255,255,0.4)',
              textDecoration: 'none',
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          >
            Iniciar sesión para editar
          </a>
        )}
      </div>
    </div>
  )
}