'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function MarcarPagadoButton({ servicioId }: { servicioId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleClick() {
    setLoading(true)
    await fetch(`/api/servicios/${servicioId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pagado: true }),
    })
    router.refresh()
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        padding: '5px 12px',
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 600,
        border: 'none',
        background: loading ? '#f3f4f6' : '#f0fdf4',
        color: loading ? '#9ca3af' : '#15803d',
        cursor: loading ? 'not-allowed' : 'pointer',
        whiteSpace: 'nowrap',
        transition: 'background 0.15s',
      }}
    >
      {loading ? 'Guardando…' : '✓ Cobrado'}
    </button>
  )
}
