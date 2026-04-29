import { db } from '@/db'
import { noticiasCementerio } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { NuevaNovedadForm } from '@/components/novedades/NuevaNovedadForm'
import { NovedadCard } from '@/components/novedades/NovedadCard'

export default async function NovedadesPage() {
  const novedades = await db
    .select()
    .from(noticiasCementerio)
    .orderBy(desc(noticiasCementerio.destacada), desc(noticiasCementerio.creadoEn))

  const publicadas = novedades.filter(n => n.publicada).length
  const borradores = novedades.length - publicadas

  return (
    <div className="page-container">

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, gap: 20, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Novedades
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
            {publicadas} {publicadas === 1 ? 'publicada' : 'publicadas'}
            {borradores > 0 && (
              <span style={{ marginLeft: 8, padding: '2px 8px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
                {borradores} {borradores === 1 ? 'borrador' : 'borradores'}
              </span>
            )}
          </p>
        </div>
        <NuevaNovedadForm />
      </div>

      {novedades.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#374151', margin: '0 0 6px' }}>Todavía no hay novedades</p>
            <p style={{ fontSize: 14, color: '#9ca3af', margin: 0, maxWidth: 320 }}>
              Publicá la primera novedad para que aparezca en el portal de tus clientes.
            </p>
          </div>
        </div>
      )}

      {novedades.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: novedades.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 24,
        }}>
          {novedades.map((n, i) => (
            <NovedadCard
              key={n.id}
              id={n.id}
              titulo={n.titulo}
              contenido={n.contenido}
              imagen={n.imagen ?? null}
              creadoEn={n.creadoEn}
              publicada={n.publicada}
              destacada={n.destacada}
              single={novedades.length === 1}
              colorIndex={i}
            />
          ))}
        </div>
      )}
    </div>
  )
}
