'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ToggleParaVentaButton({ id, paraVenta }: { id: string; paraVenta: boolean }) {
  const router = useRouter()
  const [activo, setActivo] = useState(paraVenta)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const nuevo = !activo
    setActivo(nuevo)
    await fetch(`/api/inventario/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paraVenta: nuevo }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 12, border: `1.5px solid ${activo ? '#2d8a54' : '#e5e7eb'}`, background: activo ? '#f0faf5' : '#f9fafb' }}>
      <div>
        <p style={{ fontSize: 14, fontWeight: 500, color: '#111827', margin: 0 }}>Disponible para venta</p>
        <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>Aparece en el selector al crear servicios</p>
      </div>
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        style={{
          width: 44, height: 24, borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          position: 'relative', background: activo ? '#2d8a54' : '#d1d5db', transition: 'background 0.2s', flexShrink: 0, opacity: loading ? 0.7 : 1,
        }}
      >
        <span style={{
          position: 'absolute', top: 2, left: activo ? 22 : 2, width: 20, height: 20,
          borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </button>
    </div>
  )
}
