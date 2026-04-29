'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  id: string
  publicada: boolean
  destacada: boolean
}

export function ToggleNovedadBtn({ id, publicada: pubInicial, destacada: destInicial }: Props) {
  const router = useRouter()
  const [publicada, setPublicada] = useState(pubInicial)
  const [destacada, setDestacada] = useState(destInicial)

  async function toggle(field: 'publicada' | 'destacada') {
    const newVal = field === 'publicada' ? !publicada : !destacada

    // Optimistic update — immediate visual feedback
    if (field === 'publicada') setPublicada(newVal)
    else setDestacada(newVal)

    const res = await fetch(`/api/noticias/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: newVal }),
    })

    if (!res.ok) {
      // Revert on failure
      if (field === 'publicada') setPublicada(!newVal)
      else setDestacada(!newVal)
      return
    }

    // Refresh in background so page order updates (pinned items move to top)
    router.refresh()
  }

  const btnBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 30, height: 30, borderRadius: 8, cursor: 'pointer',
    transition: 'all 0.15s',
  }

  return (
    <>
      <button
        onClick={() => toggle('destacada')}
        title={destacada ? 'Quitar pin' : 'Fijar arriba'}
        style={{
          ...btnBase,
          border: destacada ? '1px solid #fbbf24' : '1px solid #e5e7eb',
          background: destacada ? '#fffbeb' : 'white',
          color: destacada ? '#d97706' : '#9ca3af',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill={destacada ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </button>

      <button
        onClick={() => toggle('publicada')}
        title={publicada ? 'Pasar a borrador' : 'Publicar'}
        style={{
          ...btnBase,
          border: publicada ? '1px solid #d1ead9' : '1px solid #e5e7eb',
          background: publicada ? '#f0faf5' : 'white',
          color: publicada ? '#2d8a54' : '#9ca3af',
        }}
      >
        {publicada ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        )}
      </button>
    </>
  )
}
