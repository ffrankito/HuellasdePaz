'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function NuevoClienteForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = e.currentTarget
    const data = {
      nombre: (form.elements.namedItem('nombre') as HTMLInputElement).value,
      apellido: (form.elements.namedItem('apellido') as HTMLInputElement).value,
      telefono: (form.elements.namedItem('telefono') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value || null,
      dni: (form.elements.namedItem('dni') as HTMLInputElement).value || null,
      direccion: (form.elements.namedItem('direccion') as HTMLInputElement).value || null,
      localidad: (form.elements.namedItem('localidad') as HTMLInputElement).value || null,
      provincia: (form.elements.namedItem('provincia') as HTMLInputElement).value || 'Santa Fe',
      origen: (form.elements.namedItem('origen') as HTMLSelectElement).value || null,
      notas: (form.elements.namedItem('notas') as HTMLTextAreaElement).value || null,
    }

    const res = await fetch('/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      setError('Error al guardar el cliente. Intentá de nuevo.')
      setLoading(false)
      return
    }

    router.push('/dashboard/clientes')
    router.refresh()
  }

  const inputStyle = {
    display: 'block',
    width: '100%',
    padding: '10px 14px',
    fontSize: 14,
    color: '#111827',
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: '#374151',
    marginBottom: 6,
  }

  const fieldStyle = { display: 'flex', flexDirection: 'column' as const }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={fieldStyle}>
          <label htmlFor="nombre" style={labelStyle}>Nombre *</label>
          <input id="nombre" name="nombre" type="text" required style={inputStyle} placeholder="Juan" />
        </div>
        <div style={fieldStyle}>
          <label htmlFor="apellido" style={labelStyle}>Apellido *</label>
          <input id="apellido" name="apellido" type="text" required style={inputStyle} placeholder="García" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={fieldStyle}>
          <label htmlFor="telefono" style={labelStyle}>Teléfono *</label>
          <input id="telefono" name="telefono" type="tel" required style={inputStyle} placeholder="3413000000" />
        </div>
        <div style={fieldStyle}>
          <label htmlFor="dni" style={labelStyle}>DNI</label>
          <input id="dni" name="dni" type="text" style={inputStyle} placeholder="12.345.678" />
        </div>
      </div>

      <div style={fieldStyle}>
        <label htmlFor="email" style={labelStyle}>Email</label>
        <input id="email" name="email" type="email" style={inputStyle} placeholder="juan@email.com" />
      </div>

      <div style={fieldStyle}>
        <label htmlFor="direccion" style={labelStyle}>Dirección</label>
        <input id="direccion" name="direccion" type="text" style={inputStyle} placeholder="Av. Pellegrini 1234" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={fieldStyle}>
          <label htmlFor="localidad" style={labelStyle}>Localidad</label>
          <input id="localidad" name="localidad" type="text" style={inputStyle} placeholder="Rosario" />
        </div>
        <div style={fieldStyle}>
          <label htmlFor="provincia" style={labelStyle}>Provincia</label>
          <input id="provincia" name="provincia" type="text" style={inputStyle} defaultValue="Santa Fe" />
        </div>
      </div>

      <div style={fieldStyle}>
        <label htmlFor="origen" style={labelStyle}>Origen</label>
        <select id="origen" name="origen" style={inputStyle}>
          <option value="">Sin especificar</option>
          <option value="web">Web</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="veterinaria">Veterinaria</option>
          <option value="referido">Referido</option>
          <option value="redes">Redes sociales</option>
        </select>
      </div>

      <div style={fieldStyle}>
        <label htmlFor="notas" style={labelStyle}>Notas</label>
        <textarea
          id="notas"
          name="notas"
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' }}
          placeholder="Información adicional..."
        />
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 10, padding: '12px 16px' }}>
          <p style={{ fontSize: 14, color: '#dc2626', margin: 0 }}>{error}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{ padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500, border: '1px solid #e5e7eb', background: 'white', color: '#374151', cursor: 'pointer' }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500, border: 'none', background: '#111827', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Guardando...' : 'Guardar cliente'}
        </button>
      </div>
    </form>
  )
}