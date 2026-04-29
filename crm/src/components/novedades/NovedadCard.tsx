'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EditarNovedadBtn } from './EditarNovedadBtn'
import { EliminarNovedadBtn } from './EliminarNovedadBtn'

type Props = {
  id: string
  titulo: string
  contenido: string
  imagen: string | null
  creadoEn: Date
  publicada: boolean
  destacada: boolean
  single: boolean
  colorIndex: number
}

function formatFecha(fecha: Date) {
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export function NovedadCard({ id, titulo, contenido, imagen, creadoEn, publicada: pubInicial, destacada: destInicial, single, colorIndex }: Props) {
  const router = useRouter()
  const [publicada, setPublicada] = useState(pubInicial)
  const [destacada, setDestacada] = useState(destInicial)

  async function toggle(field: 'publicada' | 'destacada') {
    const newVal = field === 'publicada' ? !publicada : !destacada
    if (field === 'publicada') setPublicada(newVal)
    else setDestacada(newVal)

    const res = await fetch(`/api/noticias/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: newVal }),
    })

    if (!res.ok) {
      if (field === 'publicada') setPublicada(!newVal)
      else setDestacada(!newVal)
      return
    }

    router.refresh()
  }

  const btnBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 30, height: 30, borderRadius: 8, cursor: 'pointer',
    transition: 'all 0.15s', flexShrink: 0,
  }

  const accentColors = ['#111827', '#2d8a54', '#1d4ed8']

  return (
    <article style={{
      background: 'white',
      borderRadius: 20,
      border: destacada ? '1.5px solid #fbbf24' : publicada ? '1px solid #f0f0f0' : '1.5px dashed #d1d5db',
      overflow: 'hidden',
      boxShadow: destacada ? '0 2px 12px rgba(251,191,36,0.15)' : '0 2px 12px rgba(0,0,0,0.06)',
      display: 'flex',
      flexDirection: 'column',
      opacity: publicada ? 1 : 0.75,
      transition: 'border-color 0.2s, box-shadow 0.2s, opacity 0.2s',
      ...(single ? { maxWidth: 640 } : {}),
    }}>

      {imagen ? (
        <div style={{ position: 'relative', height: single ? 300 : 220, flexShrink: 0 }}>
          <img src={imagen} alt={titulo} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 55%)' }} />
          <span style={{
            position: 'absolute', bottom: 14, left: 16,
            fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.85)',
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            {formatFecha(creadoEn)}
          </span>
          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
            {destacada && (
              <span style={{ padding: '3px 8px', background: 'rgba(251,191,36,0.9)', borderRadius: 6, fontSize: 11, fontWeight: 600, color: '#78350f', backdropFilter: 'blur(4px)' }}>
                ★ Destacada
              </span>
            )}
            {!publicada && (
              <span style={{ padding: '3px 8px', background: 'rgba(0,0,0,0.6)', borderRadius: 6, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)' }}>
                Borrador
              </span>
            )}
          </div>
          <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6 }}>
            <button onClick={() => toggle('destacada')} title={destacada ? 'Quitar pin' : 'Fijar arriba'} style={{ ...btnBase, border: destacada ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.3)', background: destacada ? 'rgba(251,191,36,0.9)' : 'rgba(255,255,255,0.15)', color: destacada ? '#78350f' : 'white', backdropFilter: 'blur(6px)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill={destacada ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </button>
            <button onClick={() => toggle('publicada')} title={publicada ? 'Pasar a borrador' : 'Publicar'} style={{ ...btnBase, border: '1px solid rgba(255,255,255,0.3)', background: publicada ? 'rgba(45,138,84,0.85)' : 'rgba(255,255,255,0.15)', color: 'white', backdropFilter: 'blur(6px)' }}>
              {publicada ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              )}
            </button>
            <EditarNovedadBtn id={id} titulo={titulo} contenido={contenido} imagen={imagen} />
            <EliminarNovedadBtn id={id} titulo={titulo} />
          </div>
        </div>
      ) : (
        <div style={{
          height: 10,
          background: destacada ? '#fbbf24' : accentColors[colorIndex % 3],
          flexShrink: 0,
          transition: 'background 0.2s',
        }} />
      )}

      <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {!imagen && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {formatFecha(creadoEn)}
              </span>
              {destacada && (
                <span style={{ padding: '2px 7px', background: '#fffbeb', border: '1px solid #fbbf24', borderRadius: 5, fontSize: 11, fontWeight: 600, color: '#d97706', transition: 'opacity 0.15s' }}>
                  ★ Destacada
                </span>
              )}
              {!publicada && (
                <span style={{ padding: '2px 7px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 5, fontSize: 11, fontWeight: 600, color: '#6b7280' }}>
                  Borrador
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button onClick={() => toggle('destacada')} title={destacada ? 'Quitar pin' : 'Fijar arriba'} style={{ ...btnBase, border: destacada ? '1px solid #fbbf24' : '1px solid #e5e7eb', background: destacada ? '#fffbeb' : 'white', color: destacada ? '#d97706' : '#9ca3af' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill={destacada ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </button>
              <button onClick={() => toggle('publicada')} title={publicada ? 'Pasar a borrador' : 'Publicar'} style={{ ...btnBase, border: publicada ? '1px solid #d1ead9' : '1px solid #e5e7eb', background: publicada ? '#f0faf5' : 'white', color: publicada ? '#2d8a54' : '#9ca3af' }}>
                {publicada ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                )}
              </button>
              <EditarNovedadBtn id={id} titulo={titulo} contenido={contenido} imagen={imagen} />
              <EliminarNovedadBtn id={id} titulo={titulo} variant="inline" />
            </div>
          </div>
        )}

        <h2 style={{
          fontSize: single ? 20 : 17,
          fontWeight: 700, color: '#111827',
          margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: 1.3,
        }}>
          {titulo}
        </h2>

        <p style={{
          fontSize: 14, color: '#4b5563', margin: 0, lineHeight: 1.65, flex: 1,
          display: '-webkit-box',
          WebkitLineClamp: single ? undefined : 4,
          WebkitBoxOrient: 'vertical' as const,
          overflow: single ? 'visible' : 'hidden',
        }}>
          {contenido}
        </p>

        {imagen && (
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: 11, color: '#9ca3af', fontStyle: publicada ? 'normal' : 'italic' }}>
              {publicada ? 'Visible en portal de clientes' : 'No visible para clientes'}
            </span>
          </div>
        )}
      </div>
    </article>
  )
}
