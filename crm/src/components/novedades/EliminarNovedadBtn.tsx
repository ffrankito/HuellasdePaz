'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function EliminarNovedadBtn({
  id,
  titulo,
  variant = 'overlay',
}: {
  id: string
  titulo: string
  variant?: 'overlay' | 'inline'
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleEliminar() {
    if (!confirm(`¿Eliminar la novedad "${titulo}"?`)) return
    setLoading(true)
    await fetch(`/api/noticias/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  if (variant === 'inline') {
    return (
      <button
        onClick={handleEliminar}
        disabled={loading}
        title="Eliminar novedad"
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '4px 10px', borderRadius: 8,
          background: '#fef2f2', border: '1px solid #fecaca',
          color: '#dc2626', fontSize: 12, fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.5 : 1, flexShrink: 0,
        }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        </svg>
        {loading ? '...' : 'Eliminar'}
      </button>
    )
  }

  return (
    <button
      onClick={handleEliminar}
      disabled={loading}
      title="Eliminar novedad"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 30, height: 30, borderRadius: 8,
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(6px)',
        border: '1px solid rgba(255,255,255,0.3)',
        color: 'white', cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.5 : 1, transition: 'background 0.15s',
      }}
      onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(220,38,38,0.75)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)' }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        <path d="M10 11v6M14 11v6"/>
      </svg>
    </button>
  )
}
