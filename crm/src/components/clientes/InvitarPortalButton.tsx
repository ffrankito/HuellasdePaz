'use client'

import { useState } from 'react'

export function InvitarPortalButton({ clienteId, email, yaInvitado, rol }: {
  clienteId: string
  email: string | null
  yaInvitado: boolean
  rol: string
}) {
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const puedeInvitar = ['admin', 'televenta', ''].includes(rol)

  if (!puedeInvitar) return null

  async function invitar() {
    if (!email) {
      setError('El cliente no tiene email registrado')
      return
    }
    setLoading(true)
    setError(null)

    const res = await fetch('/api/portal/invitar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clienteId }),
    })

    if (res.ok) {
      setEnviado(true)
      setTimeout(() => setEnviado(false), 3000)
    } else {
      const data = await res.json()
      setError(data.error ?? 'Error al enviar la invitación')
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', margin: 0 }}>Acceso al portal</p>
      {error && <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{error}</p>}
      <button
        onClick={invitar}
        disabled={loading || !email}
        style={{
          padding: '8px 14px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 500,
          border: 'none',
          background: enviado ? '#f0fdf4' : !email ? '#f3f4f6' : '#111827',
          color: enviado ? '#15803d' : !email ? '#9ca3af' : 'white',
          cursor: loading || !email ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {enviado ? '✓ Enviado' : loading ? 'Enviando...' : !email ? 'Sin email' : yaInvitado ? 'Reenviar invitación' : 'Enviar invitación'}
      </button>
    </div>
  )
}