'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function NuevoServicioConfigForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [abierto, setAbierto] = useState(false)

  const inputStyle = {
    display: 'block', width: '100%', padding: '8px 12px', fontSize: 13,
    color: '#111827', background: 'white', border: '1px solid #e5e7eb',
    borderRadius: 8, outline: 'none', boxSizing: 'border-box' as const,
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const form = e.currentTarget
    const precioStr = (form.elements.namedItem('precio') as HTMLInputElement).value
    const data = {
      nombre: (form.elements.namedItem('nombre') as HTMLInputElement).value,
      tipo: (form.elements.namedItem('tipo') as HTMLSelectElement).value,
      precio: precioStr ? Number(precioStr) : null,
      descripcion: (form.elements.namedItem('descripcion') as HTMLInputElement).value || null,
    }
    const res = await fetch('/api/configuracion/servicios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) { setError('Error al crear.'); setLoading(false); return }
    form.reset()
    setAbierto(false)
    setLoading(false)
    router.refresh()
  }

  if (!abierto) {
    return (
      <button onClick={() => setAbierto(true)} style={{ padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500, border: '1px dashed #d1d5db', background: 'white', color: '#6b7280', cursor: 'pointer' }}>
        + Agregar servicio
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: '#f0fdf4', borderRadius: 12, padding: '18px 20px', border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#15803d', margin: 0 }}>Nuevo servicio</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#374151', marginBottom: 4 }}>Nombre *</label>
          <input name="nombre" required style={inputStyle} placeholder="Cremación Huellitas" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#374151', marginBottom: 4 }}>Tipo *</label>
          <select name="tipo" required style={inputStyle}>
            <option value="cremacion_comunitaria">Cremación comunitaria</option>
            <option value="cremacion_individual">Cremación individual</option>
            <option value="entierro">Entierro</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#374151', marginBottom: 4 }}>Precio (ARS) — vacío = Consultar</label>
          <input name="precio" type="number" min="0" style={inputStyle} placeholder="90000" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#374151', marginBottom: 4 }}>Descripción</label>
          <input name="descripcion" style={inputStyle} placeholder="Descripción breve..." />
        </div>
      </div>
      {error && <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{error}</p>}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" onClick={() => setAbierto(false)} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb', background: 'white', color: '#374151', cursor: 'pointer' }}>Cancelar</button>
        <button type="submit" disabled={loading} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, border: 'none', background: '#15803d', color: 'white', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>{loading ? 'Guardando...' : 'Crear'}</button>
      </div>
    </form>
  )
}
