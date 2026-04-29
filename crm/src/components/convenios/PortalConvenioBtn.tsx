'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function InvitarConvenioBtn({
  convenioId,
  email,
  yaInvitado,
}: {
  convenioId: string
  email: string | null
  yaInvitado: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function invitar() {
    setLoading(true)
    setError(null)
    const res = await fetch('/api/portal/convenio/invitar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ convenioId }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Error al enviar la invitación.')
      return
    }
    setOk(true)
    router.refresh()
  }

  if (!email) {
    return (
      <span style={{ fontSize: 13, color: '#9ca3af', padding: '10px 0' }}>
        Agregá un email al convenio para enviar la invitación
      </span>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <button
        onClick={invitar}
        disabled={loading}
        style={{
          padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500,
          border: 'none', background: ok ? '#f0fdf4' : '#2d8a54',
          color: ok ? '#15803d' : 'white',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          transition: 'all 0.15s',
        }}
      >
        {loading ? 'Enviando…' : ok ? '¡Invitación enviada!' : yaInvitado ? 'Reenviar invitación' : 'Enviar invitación al portal'}
      </button>
      {error && <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{error}</p>}
    </div>
  )
}

export function TogglePortalActivoBtn({
  convenioId,
  portalActivo,
}: {
  convenioId: string
  portalActivo: boolean
}) {
  const router = useRouter()
  const [activo, setActivo] = useState(portalActivo)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const nuevo = !activo
    setActivo(nuevo)
    const res = await fetch(`/api/convenios/${convenioId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portalActivo: nuevo }),
    })
    setLoading(false)
    if (!res.ok) setActivo(!nuevo)
    else router.refresh()
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 16px', borderRadius: 10, fontSize: 14, fontWeight: 500,
        border: `1px solid ${activo ? '#bbf7d0' : '#e5e7eb'}`,
        background: activo ? '#f0fdf4' : '#f9fafb',
        color: activo ? '#15803d' : '#6b7280', cursor: 'pointer',
      }}
    >
      <span style={{ width: 32, height: 18, borderRadius: 20, background: activo ? '#2d8a54' : '#d1d5db', position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}>
        <span style={{ position: 'absolute', top: 3, left: activo ? 16 : 3, width: 12, height: 12, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
      </span>
      Portal {activo ? 'activo' : 'inactivo'}
    </button>
  )
}
