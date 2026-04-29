import { db } from '@/db'
import { mascotas, clientes } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

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
  const emoji = row.especie === 'perro' ? '🐕' : row.especie === 'gato' ? '🐈' : '🐾'

  function formatFecha(d: string) {
    return new Date(d).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#08080f', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>

      {/* Back link */}
      <div style={{ padding: '16px 24px', position: 'absolute', top: 0, left: 0, zIndex: 10 }}>
        <Link
          href="/memorial"
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontWeight: 500 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Memoriales
        </Link>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 0 72px' }}>

        {/* Hero */}
        {row.foto ? (
          <div style={{ borderRadius: '0 0 28px 28px', overflow: 'hidden', position: 'relative' }}>
            <div style={{ aspectRatio: '4/3', width: '100%', position: 'relative' }}>
              <img
                src={row.foto}
                alt=""
                draggable={false}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,15,0.95) 0%, rgba(8,8,15,0.4) 45%, rgba(8,8,15,0.08) 100%)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 32px 32px' }}>
              <h1 style={{ fontSize: 44, fontWeight: 700, color: 'white', margin: '0 0 6px', fontFamily: 'Georgia, Times New Roman, serif', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
                {row.nombre}
              </h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0, textTransform: 'capitalize' }}>
                {row.especie}{row.raza ? ` · ${row.raza}` : ''}
              </p>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0 40px' }}>
            <span style={{ fontSize: 80, lineHeight: 1, display: 'block', marginBottom: 20 }}>{emoji}</span>
            <h1 style={{ fontSize: 48, fontWeight: 700, color: 'white', margin: '0 0 8px', fontFamily: 'Georgia, Times New Roman, serif', letterSpacing: '-0.02em' }}>
              {row.nombre}
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', margin: 0, textTransform: 'capitalize' }}>
              {row.especie}{row.raza ? ` · ${row.raza}` : ''}
            </p>
          </div>
        )}

        <div style={{ padding: '0 20px' }}>

          {/* Fechas */}
          {(row.fechaNacimiento || row.fechaFallecimiento) && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {row.fechaNacimiento && (
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', margin: '0 0 4px', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Nació</p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', margin: 0, fontWeight: 500 }}>{formatFecha(row.fechaNacimiento)}</p>
                </div>
              )}
              {row.fechaNacimiento && row.fechaFallecimiento && (
                <span style={{ fontSize: 18, opacity: 0.2, padding: '0 12px' }}>🕯️</span>
              )}
              {row.fechaFallecimiento && (
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', margin: '0 0 4px', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Partió</p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', margin: 0, fontWeight: 500 }}>{formatFecha(row.fechaFallecimiento)}</p>
                </div>
              )}
            </div>
          )}

          {/* Dedicatoria */}
          {row.dedicatoria && (
            <div style={{ padding: '28px 0 24px', display: 'flex', gap: 16 }}>
              <div style={{ width: 2, flexShrink: 0, background: 'linear-gradient(to bottom, rgba(45,138,84,0.6), rgba(45,138,84,0.05))', borderRadius: 2, marginTop: 4 }} />
              <div>
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', margin: '0 0 12px', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Dedicatoria</p>
                <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.85, fontStyle: 'italic', fontWeight: 300, fontFamily: 'Georgia, serif' }}>
                  {row.dedicatoria}
                </p>
              </div>
            </div>
          )}

          {/* Galería */}
          {galeria.length > 0 && (
            <div style={{ paddingBottom: 28 }}>
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', margin: '0 0 12px', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Galería</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {galeria.map((url, i) => (
                  <div key={i} style={{ aspectRatio: '1', borderRadius: 14, overflow: 'hidden' }}>
                    <img src={url} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2C8 2 4 6 4 10c0 5 8 12 8 12s8-7 8-12c0-4-4-8-8-8z" fill="#4db87a" fillOpacity="0.7"/>
              </svg>
              <span style={{ fontSize: 11, color: 'rgba(77,184,122,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500 }}>
                Huellas de Paz · Rosario
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.15)', margin: 0 }}>
              Primer crematorio con habilitación formal en Rosario
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
