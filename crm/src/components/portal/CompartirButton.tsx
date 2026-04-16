'use client'

import { useState } from 'react'

export function CompartirButtonClient({ nombre }: { nombre: string }) {
  const [copiado, setCopiado] = useState(false)

  async function compartir() {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({ title: `Memorial de ${nombre} 🐾`, url })
        return
      } catch {}
    }

    await navigator.clipboard.writeText(url)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <button
      onClick={compartir}
      style={{
        flex: 1,
        padding: '12px',
        borderRadius: 12,
        fontSize: 14,
        fontWeight: 500,
        border: 'none',
        background: 'white',
        color: '#111827',
        cursor: 'pointer',
        textAlign: 'center',
      }}
    >
      {copiado ? '✓ Link copiado' : '↗ Compartir memorial'}
    </button>
  )
}