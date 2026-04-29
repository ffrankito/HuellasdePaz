'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function RegistrarCuotaButton({
  planId,
  cuotasPagadas,
  cuotasTotales,
}: {
  planId: string
  cuotasPagadas: number
  cuotasTotales: number
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const yaAlDia = cuotasPagadas >= cuotasTotales

  async function handleClick() {
    if (yaAlDia) return
    setLoading(true)
    await fetch(`/api/planes/${planId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cuotasPagadas: cuotasPagadas + 1 }),
    })
    router.refresh()
  }

  if (yaAlDia) return null

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
        background: loading ? '#f3f4f6' : '#fff7ed',
        color: loading ? '#9ca3af' : '#c2410c',
        cursor: loading ? 'not-allowed' : 'pointer',
        whiteSpace: 'nowrap',
        transition: 'background 0.15s',
      }}
    >
      {loading ? 'Guardando…' : '+ Registrar cuota'}
    </button>
  )
}
