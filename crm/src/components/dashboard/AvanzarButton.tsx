'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function AvanzarButtonClient({ id, siguiente }: { id: string; siguiente: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [confirmar, setConfirmar] = useState(false)

  async function avanzar() {
    setLoading(true)
    await fetch(`/api/servicios/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: siguiente }),
    })
    router.refresh()
    setLoading(false)
  }

  async function eliminar() {
    setEliminando(true)
    await fetch(`/api/servicios/${id}`, { method: 'DELETE' })
    router.refresh()
    setEliminando(false)
    setConfirmar(false)
  }

  const labelCorto: Record<string, string> = {
    retiro_pendiente: 'Retiro',
    en_transporte: 'Transporte',
    recibido: 'Recibido',
    en_cremacion: 'Cremación',
    cremado: 'Cremado',
    listo_entrega: 'Listo',
    entregado: 'Entregado',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
      {confirmar ? (
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={eliminar}
            disabled={eliminando}
            style={{ padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: 'none', background: '#dc2626', color: 'white', cursor: 'pointer', opacity: eliminando ? 0.6 : 1 }}
          >
            {eliminando ? '...' : 'Confirmar'}
          </button>
          <button
            onClick={() => setConfirmar(false)}
            style={{ padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: '1px solid #e5e7eb', background: 'white', color: '#374151', cursor: 'pointer' }}
          >
            No
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setConfirmar(true)}
            style={{ padding: '7px 10px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Eliminar
          </button>
          <button
            onClick={avanzar}
            disabled={loading}
            style={{ padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: 'none', background: '#111827', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, whiteSpace: 'nowrap' }}
          >
            {loading ? '...' : `→ ${labelCorto[siguiente] ?? siguiente.replace(/_/g, ' ')}`}
          </button>
        </div>
      )}
    </div>
  )
}