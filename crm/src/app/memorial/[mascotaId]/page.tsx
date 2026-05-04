import { db } from '@/db'
import { mascotas, clientes } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { CompartirButtonClient } from '@/components/portal/CompartirButton'

export async function generateMetadata({ params }: { params: Promise<{ mascotaId: string }> }): Promise<Metadata> {
  const { mascotaId } = await params
  const row = await db
    .select({ nombre: mascotas.nombre, especie: mascotas.especie })
    .from(mascotas)
    .where(and(eq(mascotas.id, mascotaId), eq(mascotas.memoriaPublica, true)))
    .limit(1)

  if (!row[0]) return { title: 'Memorial · Huellas de Paz' }
  return {
    title: `Memorial de ${row[0].nombre} · Huellas de Paz`,
    description: `Recordamos con amor a ${row[0].nombre}.`,
  }
}

export default async function MemorialPublicoPage({ params }: { params: Promise<{ mascotaId: string }> }) {
  const { mascotaId } = await params

  const [row] = await db
    .select({
      id: mascotas.id,
      nombre: mascotas.nombre,
      especie: mascotas.especie,
      raza: mascotas.raza,
      foto: mascotas.foto,
      galeria: mascotas.galeria,
      dedicatoria: mascotas.dedicatoria,
      fechaNacimiento: mascotas.fechaNacimiento,
      fechaFallecimiento: mascotas.fechaFallecimiento,
    })
    .from(mascotas)
    .innerJoin(clientes, eq(mascotas.clienteId, clientes.id))
    .where(and(eq(mascotas.id, mascotaId), eq(mascotas.memoriaPublica, true)))
    .limit(1)

  if (!row) notFound()

  const galeria = (row.galeria ?? []) as string[]

  function formatFecha(d: string) {
    return new Date(d).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const especieLabel = row.especie
    ? row.especie.charAt(0).toUpperCase() + row.especie.slice(1)
    : null

  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 20,
    marginBottom: 12,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#08080f', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>

      {/* Back nav */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, padding: '18px 20px' }}>
        <Link
          href="/memorial"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontWeight: 500 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Memoriales
        </Link>
      </div>

      {/* Hero */}
      <div style={{ position: 'relative', height: '58vh', minHeight: 380, maxHeight: 540, overflow: 'hidden' }}>
        {row.foto ? (
          <img
            src={row.foto}
            alt={row.nombre}
            draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(155deg, #1e1a16 0%, #0d0b09 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
        )}

        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #08080f 0%, rgba(8,8,15,0.55) 38%, rgba(8,8,15,0.08) 68%, transparent 100%)' }} />

        {/* Name overlay */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 24px 40px' }}>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            {(especieLabel || row.raza) && (
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '0 0 10px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
                {[especieLabel, row.raza].filter(Boolean).join(' · ')}
              </p>
            )}
            <h1 style={{ fontSize: 'clamp(2.75rem, 8vw, 3.5rem)', fontWeight: 700, color: 'white', margin: 0, fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: '-0.02em', lineHeight: 1.05 }}>
              {row.nombre}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '20px 16px 80px' }}>

        {/* Dates */}
        {(row.fechaNacimiento || row.fechaFallecimiento) && (
          <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 24px' }}>
            {row.fechaNacimiento && (
              <div style={{ textAlign: 'center', flex: 1 }}>
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', margin: '0 0 8px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>Nació</p>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', margin: 0, fontWeight: 500, lineHeight: 1.45 }}>
                  {formatFecha(row.fechaNacimiento)}
                </p>
              </div>
            )}
            {row.fechaNacimiento && row.fechaFallecimiento && (
              <div style={{ padding: '0 20px', flexShrink: 0 }}>
                <span style={{ fontSize: 20, lineHeight: 1 }}>🕯️</span>
              </div>
            )}
            {row.fechaFallecimiento && (
              <div style={{ textAlign: 'center', flex: 1 }}>
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', margin: '0 0 8px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>Partió</p>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', margin: 0, fontWeight: 500, lineHeight: 1.45 }}>
                  {formatFecha(row.fechaFallecimiento)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Dedicatoria */}
        {row.dedicatoria && (
          <div style={{ ...card, padding: '28px 28px 28px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 10, left: 18, fontSize: 96, color: 'rgba(45,138,84,0.1)', fontFamily: 'Georgia, serif', lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>
              &ldquo;
            </div>
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', margin: '0 0 16px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, position: 'relative', zIndex: 1 }}>
              Dedicatoria
            </p>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.85, fontStyle: 'italic', fontWeight: 300, fontFamily: 'Georgia, "Times New Roman", serif', position: 'relative', zIndex: 1 }}>
              {row.dedicatoria}
            </p>
          </div>
        )}

        {/* Galería */}
        {galeria.length > 0 && (
          <div style={{ ...card, padding: 16 }}>
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', margin: '0 0 14px 4px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>
              Galería
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: galeria.length === 1 ? '1fr' : 'repeat(2, 1fr)',
              gap: 8,
            }}>
              {galeria.map((url, i) => (
                <div key={i} style={{ aspectRatio: '1', borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,0.04)' }}>
                  <img src={url} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compartir */}
        <div style={{ ...card, padding: '22px 22px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>🔗</span>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>
              Compartí el recuerdo de <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{row.nombre}</span> con quienes lo amaban.
            </p>
          </div>
          <div style={{ display: 'flex' }}>
            <CompartirButtonClient nombre={row.nombre} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ paddingTop: 36, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginBottom: 6 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2C8 2 4 6 4 10c0 5 8 12 8 12s8-7 8-12c0-4-4-8-8-8z" fill="#4db87a" fillOpacity="0.55"/>
            </svg>
            <span style={{ fontSize: 11, color: 'rgba(77,184,122,0.4)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 500 }}>
              Huellas de Paz · Rosario
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.1)', margin: 0 }}>
            Primer crematorio con habilitación formal en Rosario
          </p>
        </div>

      </div>
    </div>
  )
}
