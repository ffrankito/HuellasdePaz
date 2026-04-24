import { db } from '@/db'
import { clientes, mascotas, servicios } from '@/db/schema'
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

  const servicioMascota = await db.query.servicios.findFirst({
    where: and(eq(servicios.mascotaId, mascotaId), eq(servicios.clienteId, cliente.id)),
  })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const esClienteLogueado = user?.id === cliente.authUserId

  const emoji = mascota.especie === 'perro' ? '🐕' : mascota.especie === 'gato' ? '🐈' : '🐾'
  const galeria = (mascota.galeria ?? []) as string[]

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>

      {/* Fondo decorativo */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 20% 20%, rgba(45,138,84,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(99,102,241,0.06) 0%, transparent 60%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 520, margin: '0 auto', padding: '40px 20px 60px' }}>

        {/* Botón volver */}
        <a
          href={`/portal/${token}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 13, marginBottom: 32 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Volver al portal
        </a>

        {/* Tarjeta principal */}
        <div style={{
          background: 'linear-gradient(160deg, #1a1a1a 0%, #141414 100%)',
          borderRadius: 28,
          border: '1px solid rgba(255,255,255,0.07)',
          overflow: 'hidden',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
        }}>

          {/* Header con foto */}
          <div style={{ position: 'relative', textAlign: 'center', padding: '48px 40px 32px' }}>
            {/* Decoración fondo */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 140, background: 'linear-gradient(180deg, rgba(45,138,84,0.12) 0%, transparent 100%)' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Foto principal */}
              <div style={{ width: 140, height: 140, borderRadius: '50%', margin: '0 auto 20px', position: 'relative' }}>
                {mascota.foto ? (
                  <img
                    src={mascota.foto}
                    alt={mascota.nombre}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(45,138,84,0.4)' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'rgba(45,138,84,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, border: '4px solid rgba(45,138,84,0.25)' }}>
                    {emoji}
                  </div>
                )}
                {/* Halo */}
                <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: '1px solid rgba(45,138,84,0.2)', animation: 'pulse 3s infinite' }} />
              </div>

              <h1 style={{ fontSize: 38, fontWeight: 700, color: 'white', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                {mascota.nombre}
              </h1>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', margin: '0 0 24px', textTransform: 'capitalize' }}>
                {mascota.especie}{mascota.raza ? ` · ${mascota.raza}` : ''}
              </p>

              {/* Fechas */}
              {(mascota.fechaNacimiento || mascota.fechaFallecimiento) && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 50, padding: '10px 20px' }}>
                  {mascota.fechaNacimiento && (
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Nació</p>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: 0, fontWeight: 500 }}>{formatDate(mascota.fechaNacimiento)}</p>
                    </div>
                  )}
                  {mascota.fechaNacimiento && mascota.fechaFallecimiento && (
                    <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                  )}
                  {mascota.fechaFallecimiento && (
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Partió</p>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: 0, fontWeight: 500 }}>{formatDate(mascota.fechaFallecimiento)}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Separador decorativo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 40px', marginBottom: 28 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ fontSize: 18, opacity: 0.2 }}>🐾</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Dedicatoria */}
          {mascota.dedicatoria && (
            <div style={{ padding: '0 40px 32px' }}>
              <div style={{ background: 'rgba(45,138,84,0.08)', border: '1px solid rgba(45,138,84,0.2)', borderRadius: 16, padding: '20px 24px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: 'rgba(45,138,84,0.6)', marginBottom: 10, display: 'block' }}>
                  <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" fill="rgba(45,138,84,0.4)"/>
                  <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" fill="rgba(45,138,84,0.4)"/>
                </svg>
                <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.8, fontStyle: 'italic', fontWeight: 300 }}>
                  {mascota.dedicatoria}
                </p>
              </div>
            </div>
          )}

          {/* Galería de fotos */}
          {galeria.length > 0 && (
            <div style={{ padding: '0 40px 32px' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 14px' }}>
                Galería de recuerdos
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {galeria.map((url, i) => (
                  <div key={i} style={{ aspectRatio: '1', borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                    <img src={url} alt={`Recuerdo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer de la tarjeta */}
          <div style={{ padding: '20px 40px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(45,138,84,0.5)' }} />
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', margin: 0, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Huellas de Paz · Rosario
            </p>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(45,138,84,0.5)' }} />
          </div>
        </div>

        {/* Botones de acción */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <CompartirButtonClient nombre={mascota.nombre} />
          {servicioMascota && (
            <a
              href={`/api/portal/certificado/${servicioMascota.id}?token=${token}`}
              target="_blank"
              style={{
                flex: 1, padding: '13px', borderRadius: 14, fontSize: 13, fontWeight: 500,
                border: '1px solid rgba(45,138,84,0.4)', background: 'rgba(45,138,84,0.1)',
                color: 'rgba(45,138,84,0.9)', textDecoration: 'none', textAlign: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
              Certificado
            </a>
          )}
        </div>

        {/* Botones editar */}
        {esClienteLogueado && (
          <a
            href={`/portal/${token}/memorial/${mascotaId}/editar`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', marginTop: 10, padding: '13px', borderRadius: 14, fontSize: 13,
              fontWeight: 500, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.6)', textDecoration: 'none', boxSizing: 'border-box',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Editar memorial
          </a>
        )}

        {!esClienteLogueado && (
          <a
            href={`/portal/login?token=${token}`}
            style={{
              display: 'block', width: '100%', marginTop: 10, padding: '12px', borderRadius: 14,
              fontSize: 12, border: '1px solid rgba(255,255,255,0.07)', background: 'transparent',
              color: 'rgba(255,255,255,0.3)', textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box',
            }}
          >
            Iniciá sesión para personalizar el memorial
          </a>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.15; transform: scale(1.05); }
        }
      `}</style>
    </div>
  )
}
