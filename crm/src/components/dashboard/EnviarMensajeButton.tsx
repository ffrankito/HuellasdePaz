'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function EnviarMensajeButton({ id, telefono, mensaje }: {
  id: string
  telefono: string
  mensaje: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function enviar() {
    setLoading(true)

    const tel = telefono.replace(/\D/g, '')
    const url = `https://wa.me/54${tel}?text=${encodeURIComponent(mensaje)}`
    window.open(url, '_blank')

    await fetch(`/api/comunicaciones/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'enviado' }),
    })

    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={enviar}
      disabled={loading}
      style={{
        width: '100%',
        padding: '9px 16px',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 500,
        border: 'none',
        background: '#25D366',
        color: 'white',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}
    >
      {loading ? 'Enviando...' : '↗ Enviar por WhatsApp'}
    </button>
  )
}