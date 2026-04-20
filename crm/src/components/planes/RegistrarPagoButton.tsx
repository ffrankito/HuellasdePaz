'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  planId: string
  cuotasPagadas: number
  cuotaMensual: number
}

export function RegistrarPagoButton({ planId, cuotasPagadas, cuotaMensual }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirmando, setConfirmando] = useState(false)

  async function registrarPago() {
    setLoading(true)
    await fetch(`/api/planes/${planId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cuotasPagadas: cuotasPagadas + 1 }),
    })
    setLoading(false)
    setConfirmando(false)
    router.refresh()
  }

  if (confirmando) {
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: '#374151' }}>
          ¿Registrar pago de ${cuotaMensual.toLocaleString('es-AR')}?
        </span>
        <button
          onClick={registrarPago}
          disabled={loading}
          style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#15803d', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          {loading ? 'Guardando...' : 'Confirmar'}
        </button>
        <button
          onClick={() => setConfirmando(false)}
          style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', color: '#374151', fontSize: 13, cursor: 'pointer' }}
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirmando(true)}
      style={{
        padding: '10px 20px', borderRadius: 10,
background: '#f0fdf4', color: '#15803d', fontSize: 14,
fontWeight: 600, cursor: 'pointer', border: '1px solid #bbf7d0',
        } as React.CSSProperties}
    >
      + Registrar pagos
    </button>
  )
}