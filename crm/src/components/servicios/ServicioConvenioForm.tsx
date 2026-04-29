'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type ConvenioActivo = { id: string; nombre: string; descuentoPorcentaje: string | null }

export function ServicioConvenioForm({ servicioId, convenioIdActual }: { servicioId: string; convenioIdActual: string | null }) {
  const router = useRouter()
  const [convenioId, setConvenioId] = useState(convenioIdActual ?? '')
  const [convenios, setConvenios] = useState<ConvenioActivo[]>([])
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/convenios?activos=true')
      .then(r => r.ok ? r.json() : [])
      .then(setConvenios)
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setOk(false)

    const res = await fetch(`/api/servicios/${servicioId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ convenioId: convenioId || null }),
    })

    setLoading(false)
    if (!res.ok) { setError('No se pudo actualizar.'); return }
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
      <select value={convenioId} onChange={e => { setConvenioId(e.target.value); setOk(false) }} style={inputStyle}>
        <option value="">Sin convenio</option>
        {convenios.map(c => (
          <option key={c.id} value={c.id}>
            {c.nombre}{c.descuentoPorcentaje && Number(c.descuentoPorcentaje) > 0 ? ` — ${c.descuentoPorcentaje}% com.` : ''}
          </option>
        ))}
      </select>
      {error && <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>}
      {ok && <p style={{ fontSize: 13, color: '#15803d', margin: 0 }}>Convenio actualizado.</p>}
      <button
        type="submit"
        disabled={loading || convenioId === (convenioIdActual ?? '')}
        style={{
          padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500,
          border: 'none', background: '#111827', color: 'white',
          cursor: loading || convenioId === (convenioIdActual ?? '') ? 'not-allowed' : 'pointer',
          opacity: loading || convenioId === (convenioIdActual ?? '') ? 0.5 : 1,
        }}
      >
        {loading ? 'Guardando...' : 'Guardar convenio'}
      </button>
    </form>
  )
}
