'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ServicioPagoForm({ servicioId, pagado }: { servicioId: string; pagado: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    await fetch(`/api/servicios/${servicioId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pagado: !pagado }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: pagado ? '#15803d' : '#d1d5db' }} />
        <span style={{ fontSize: 14, fontWeight: 500, color: pagado ? '#15803d' : '#6b7280' }}>
          {pagado ? 'Pago registrado' : 'Pago pendiente'}
        </span>
      </div>
      <button
        onClick={toggle}
        disabled={loading}
        style={{
          padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500,
          border: '1px solid', cursor: loading ? 'not-allowed' : 'pointer',
          borderColor: pagado ? '#fee2e2' : '#bbf7d0',
          background: pagado ? '#fef2f2' : '#f0fdf4',
          color: pagado ? '#dc2626' : '#15803d',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? '...' : pagado ? 'Marcar como pendiente' : 'Marcar como pagado ✓'}
      </button>
    </div>
  )
}
