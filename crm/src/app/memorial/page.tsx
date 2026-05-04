import { db } from '@/db'
import { mascotas, clientes } from '@/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'

export const metadata = {
  title: 'Memoriales · Huellas de Paz',
  description: 'Recordamos a quienes siempre estarán en nuestros corazones.',
}

export default async function MemorialesPublicosPage() {
  const rows = await db
    .select({
      id: mascotas.id,
      nombre: mascotas.nombre,
      especie: mascotas.especie,
      raza: mascotas.raza,
      foto: mascotas.foto,
      dedicatoria: mascotas.dedicatoria,
      fechaFallecimiento: mascotas.fechaFallecimiento,
    })
    .from(mascotas)
    .innerJoin(clientes, eq(mascotas.clienteId, clientes.id))
    .where(eq(mascotas.memoriaPublica, true))
    .orderBy(mascotas.nombre)

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a10', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(175deg, #16130f 0%, #0e2116 100%)', padding: '48px 24px 52px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, background: 'radial-gradient(circle, rgba(45,138,84,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(to right, transparent 5%, rgba(45,138,84,0.4) 40%, rgba(77,184,122,0.5) 50%, rgba(45,138,84,0.4) 60%, transparent 95%)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2C8 2 4 6 4 10c0 5 8 12 8 12s8-7 8-12c0-4-4-8-8-8z" fill="#4db87a" fillOpacity="0.8"/>
              <circle cx="9" cy="7" r="1.5" fill="#4db87a" fillOpacity="0.45"/>
              <circle cx="15" cy="7" r="1.5" fill="#4db87a" fillOpacity="0.45"/>
            </svg>
            <span style={{ fontSize: 11, color: 'rgba(77,184,122,0.7)', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 500 }}>
              Huellas de Paz · Rosario
            </span>
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 700, color: 'white', margin: '0 0 14px', fontFamily: 'Georgia, Times New Roman, serif', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            Memoriales
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)', margin: 0, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
            Recordamos a quienes siempre estarán en nuestros corazones.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 20px 80px' }}>
        {rows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.2)' }}>
            <p style={{ fontSize: 16, margin: 0 }}>Todavía no hay memoriales públicos.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {rows.map(m => {
              const emoji = m.especie === 'perro' ? '🐕' : m.especie === 'gato' ? '🐈' : '🐾'
              return (
                <Link
                  key={m.id}
                  href={`/memorial/${m.id}`}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <article style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 22,
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}>
                    {/* Foto */}
                    <div style={{ height: 230, background: 'rgba(255,255,255,0.03)', position: 'relative', overflow: 'hidden' }}>
                      {m.foto ? (
                        <img
                          src={m.foto}
                          alt=""
                          draggable={false}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(155deg, #1a1612 0%, #0d1a11 100%)', fontSize: 64 }}>
                          {emoji}
                        </div>
                      )}
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,16,0.92) 0%, rgba(10,10,16,0.18) 55%, transparent 100%)' }} />
                      <div style={{ position: 'absolute', bottom: 16, left: 18, right: 18 }}>
                        <p style={{ fontSize: 22, fontWeight: 700, color: 'white', margin: '0 0 4px', fontFamily: 'Georgia, serif', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
                          {m.nombre}
                        </p>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.42)', margin: 0, textTransform: 'capitalize' }}>
                          {m.especie}{m.raza ? ` · ${m.raza}` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Cuerpo */}
                    <div style={{ padding: '14px 18px 18px' }}>
                      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 14 }} />

                      {m.fechaFallecimiento && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: m.dedicatoria ? 10 : 12 }}>
                          <span style={{ fontSize: 13, lineHeight: 1 }}>🕯️</span>
                          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)' }}>
                            {new Date(m.fechaFallecimiento).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                      )}

                      {m.dedicatoria && (
                        <p style={{
                          fontSize: 12.5,
                          color: 'rgba(255,255,255,0.32)',
                          margin: '0 0 14px',
                          fontStyle: 'italic',
                          fontFamily: 'Georgia, serif',
                          lineHeight: 1.65,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                          &ldquo;{m.dedicatoria}&rdquo;
                        </p>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: 12, color: 'rgba(77,184,122,0.65)', fontWeight: 500 }}>Ver memorial →</span>
                      </div>
                    </div>
                  </article>
                </Link>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
