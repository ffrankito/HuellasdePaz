'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function EliminarProductoButton({ id }: { id: string }) {
  const router = useRouter()
  const [confirmar, setConfirmar] = useState(false)
  const [loading, setLoading] = useState(false)

  async function eliminar() {
    setLoading(true)
    await fetch(`/api/inventario/${id}`, { method: 'DELETE' })
    router.push('/dashboard/inventario')
    router.refresh()
  }

  if (!confirmar) {
    return (
      <button
        onClick={() => setConfirmar(true)}
        style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer' }}
      >
        Eliminar producto
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 13, color: '#6b7280' }}>¿Confirmar?</span>
      <button
        onClick={eliminar}
        disabled={loading}
        style={{ padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, border: 'none', background: '#dc2626', color: 'white', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
      >
        {loading ? '...' : 'Sí, eliminar'}
      </button>
      <button
        onClick={() => setConfirmar(false)}
        style={{ padding: '8px 14px', borderRadius: 8, fontSize: 13, border: '1px solid #e5e7eb', background: 'white', color: '#374151', cursor: 'pointer' }}
      >
        Cancelar
      </button>
    </div>
  )
}