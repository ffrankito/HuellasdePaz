'use client'

import { useState } from 'react'

export function PortalLinkButton({ token }: { token: string }) {
  const [copiado, setCopiado] = useState(false)

  function copiar() {
    const url = `${window.location.origin}/portal/${token}`
    navigator.clipboard.writeText(url)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  function abrir() {
    window.open(`/portal/${token}`, '_blank')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', margin: 0 }}>Portal del cliente</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={abrir}
          style={{ flex: 1, padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, border: '1px solid #e5e7eb', background: 'white', color: '#374151', cursor: 'pointer' }}
        >
          Ver portal
        </button>
        <button
          onClick={copiar}
          style={{ flex: 1, padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, border: 'none', background: copiado ? '#15803d' : '#111827', color: 'white', cursor: 'pointer', transition: 'background 0.2s' }}
        >
          {copiado ? '✓ Copiado' : 'Copiar link'}
        </button>
      </div>
    </div>
  )
}