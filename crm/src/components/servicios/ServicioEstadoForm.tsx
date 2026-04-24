'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const ESTADOS = [
  { value: 'ingresado', label: 'Ingresado' },
  { value: 'retiro_pendiente', label: 'Retiro pendiente' },
  { value: 'en_transporte', label: 'En transporte' },
  { value: 'recibido', label: 'Recibido' },
  { value: 'en_cremacion', label: 'En cremación' },
  { value: 'cremado', label: 'Cremado' },
  { value: 'listo_entrega', label: 'Listo para entrega' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'cancelado', label: 'Cancelado' },
]

export function ServicioEstadoForm({ servicioId, estadoActual }: { servicioId: string; estadoActual: string }) {
  const router = useRouter()
  const [estado, setEstado] = useState(estadoActual)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (estado === estadoActual) return
    setLoading(true)
    setError(null)
    setOk(false)

    const res = await fetch(`/api/servicios/${servicioId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    })

    setLoading(false)
    if (!res.ok) {
      setError('No se pudo actualizar el estado.')
      return
    }
    setOk(true)
    router.refresh()
  }

  const inputStyle = {
    display: 'block', width: '100%', padding: '10px 14px', fontSize: 14,
    color: '#111827', background: 'white', border: '1px solid #e5e7eb',
    borderRadius: 10, outline: 'none', boxSizing: 'border-box' as const,
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <select value={estado} onChange={e => { setEstado(e.target.value); setOk(false) }} style={inputStyle}>
        {ESTADOS.map(e => (
          <option key={e.value} value={e.value}>{e.label}</option>
        ))}
      </select>

      {error && <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>}
      {ok && <p style={{ fontSize: 13, color: '#15803d', margin: 0 }}>Estado actualizado correctamente.</p>}

      <button
        type="submit"
        disabled={loading || estado === estadoActual}
        style={{
          padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500,
          border: 'none', background: '#111827', color: 'white',
          cursor: loading || estado === estadoActual ? 'not-allowed' : 'pointer',
          opacity: loading || estado === estadoActual ? 0.5 : 1,
        }}
      >
        {loading ? 'Guardando...' : 'Guardar estado'}
      </button>
    </form>
  )
}
