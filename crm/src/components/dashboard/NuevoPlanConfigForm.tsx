'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function NuevoPlanConfigForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [abierto, setAbierto] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = e.currentTarget
    const data = {
      nombre: (form.elements.namedItem('nombre') as HTMLInputElement).value,
      descripcion: (form.elements.namedItem('descripcion') as HTMLInputElement).value || null,
      cuotaMensual: (form.elements.namedItem('cuotaMensual') as HTMLInputElement).value,
      cuotasTotales: parseInt((form.elements.namedItem('cuotasTotales') as HTMLInputElement).value),
      activo: true,
    }

    const res = await fetch('/api/configuracion/planes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      setError('Error al guardar el plan.')
      setLoading(false)
      return
    }

    setAbierto(false)
    setLoading(false)
    router.refresh()
  }

  const inputStyle = {
    display: 'block', width: '100%', padding: '10px 14px', fontSize: 14,
    color: '#111827', background: 'white', border: '1px solid #e5e7eb',
    borderRadius: 10, outline: 'none', boxSizing: 'border-box' as const,
  }

  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        style={{ fontSize: 13, color: '#6b7280', background: 'none', border: '1px dashed #e5e7eb', borderRadius: 8, padding: '10px 16px', cursor: 'pointer' }}
      >
        + Agregar plan
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, background: '#f9fafb', borderRadius: 12, padding: '20px', border: '1px solid #f3f4f6' }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>Nuevo plan de previsión</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={labelStyle}>Nombre *</label>
          <input name="nombre" required style={inputStyle} placeholder="Plan Básico" />
        </div>
        <div>
          <label style={labelStyle}>Descripción</label>
          <input name="descripcion" style={inputStyle} placeholder="Descripción breve" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={labelStyle}>Cuota mensual (ARS) *</label>
          <input name="cuotaMensual" type="number" min="0" required style={inputStyle} placeholder="15000" />
        </div>
        <div>
          <label style={labelStyle}>Total de cuotas *</label>
          <input name="cuotasTotales" type="number" min="1" required style={inputStyle} placeholder="12" />
        </div>
      </div>

      {error && <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" onClick={() => setAbierto(false)}
          style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, border: '1px solid #e5e7eb', background: 'white', color: '#374151', cursor: 'pointer' }}>
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, border: 'none', background: '#111827', color: 'white', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}