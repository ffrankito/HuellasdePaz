'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function EditarStockButton({ id, stockActual }: { id: string; stockActual: number }) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [stock, setStock] = useState(stockActual)
  const [loading, setLoading] = useState(false)

  async function guardar() {
    setLoading(true)
    await fetch(`/api/inventario/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stockActual: stock }),
    })
    setAbierto(false)
    setLoading(false)
    router.refresh()
  }

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        style={{ width: '100%', padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 500, border: '1px solid #e5e7eb', background: 'white', color: '#374151', cursor: 'pointer' }}
      >
        Editar stock
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: '#f9fafb', borderRadius: 12, padding: 16, border: '1px solid #f3f4f6' }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>Actualizar stock</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={() => setStock(s => Math.max(0, s - 1))}
          style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          −
        </button>
        <input
          type="number"
          value={stock}
          min={0}
          onChange={e => setStock(parseInt(e.target.value) || 0)}
          style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 16, fontWeight: 600, textAlign: 'center', outline: 'none' }}
        />
        <button
          onClick={() => setStock(s => s + 1)}
          style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          +
        </button>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => setAbierto(false)}
          style={{ flex: 1, padding: '9px', borderRadius: 8, fontSize: 13, border: '1px solid #e5e7eb', background: 'white', color: '#374151', cursor: 'pointer' }}
        >
          Cancelar
        </button>
        <button
          onClick={guardar}
          disabled={loading}
          style={{ flex: 1, padding: '9px', borderRadius: 8, fontSize: 13, border: 'none', background: '#111827', color: 'white', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}