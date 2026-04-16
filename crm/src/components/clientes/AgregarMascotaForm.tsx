'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function AgregarMascotaForm({ clienteId, especies }: { clienteId: string; especies: string[] }) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = e.currentTarget
    const data = {
      clienteId,
      nombre: (form.elements.namedItem('nombre') as HTMLInputElement).value,
      especie: (form.elements.namedItem('especie') as HTMLSelectElement).value,
      raza: (form.elements.namedItem('raza') as HTMLInputElement).value || null,
      color: (form.elements.namedItem('color') as HTMLInputElement).value || null,
      notas: (form.elements.namedItem('notas') as HTMLInputElement).value || null,
    }

    await fetch('/api/mascotas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    setAbierto(false)
    setLoading(false)
    router.refresh()
  }

  const inputStyle = {
    display: 'block', width: '100%', padding: '9px 12px', fontSize: 13,
    color: '#111827', background: 'white', border: '1px solid #e5e7eb',
    borderRadius: 8, outline: 'none', boxSizing: 'border-box' as const,
  }

  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 4 }

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        style={{ fontSize: 13, color: '#6b7280', background: 'none', border: '1px dashed #e5e7eb', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', width: '100%' }}
      >
        + Agregar mascota
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px', background: '#f9fafb', borderRadius: 12, border: '1px solid #f3f4f6' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={labelStyle}>Nombre *</label>
          <input name="nombre" required style={inputStyle} placeholder="Firulais" />
        </div>
        <div>
          <label style={labelStyle}>Especie *</label>
          <select name="especie" required style={inputStyle}>
            {especies.map(e => (
              <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={labelStyle}>Raza</label>
          <input name="raza" style={inputStyle} placeholder="Labrador" />
        </div>
        <div>
          <label style={labelStyle}>Color</label>
          <input name="color" style={inputStyle} placeholder="Negro" />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Notas</label>
        <input name="notas" style={inputStyle} placeholder="Información adicional..." />
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" onClick={() => setAbierto(false)}
          style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, border: '1px solid #e5e7eb', background: 'white', color: '#374151', cursor: 'pointer' }}>
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, border: 'none', background: '#111827', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}