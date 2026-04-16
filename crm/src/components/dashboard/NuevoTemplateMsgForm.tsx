'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function NuevoTemplateMsgForm() {
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
      canal: (form.elements.namedItem('canal') as HTMLSelectElement).value,
      evento: (form.elements.namedItem('evento') as HTMLSelectElement).value,
      contenido: (form.elements.namedItem('contenido') as HTMLTextAreaElement).value,
      activo: true,
    }

    const res = await fetch('/api/configuracion/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      setError('Error al guardar el template.')
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
        + Agregar template
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, background: '#f9fafb', borderRadius: 12, padding: '20px', border: '1px solid #f3f4f6' }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>Nuevo template de mensaje</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <div>
          <label style={labelStyle}>Nombre *</label>
          <input name="nombre" required style={inputStyle} placeholder="Bienvenida WhatsApp" />
        </div>
        <div>
          <label style={labelStyle}>Canal *</label>
          <select name="canal" required style={inputStyle}>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Evento *</label>
          <select name="evento" required style={inputStyle}>
            <option value="bienvenida">Bienvenida</option>
            <option value="recordatorio_pago">Recordatorio de pago</option>
            <option value="servicio_recibido">Servicio recibido</option>
            <option value="servicio_listo">Servicio listo</option>
            <option value="entrega_completada">Entrega completada</option>
            <option value="seguimiento_lead">Seguimiento lead</option>
          </select>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Contenido *</label>
        <textarea
          name="contenido"
          required
          rows={4}
          style={{ ...inputStyle, resize: 'vertical' }}
          placeholder="Hola {nombre}, gracias por contactarnos..."
        />
        <p style={{ fontSize: 12, color: '#9ca3af', margin: '6px 0 0' }}>
          Variables disponibles: {'{nombre}'}, {'{mascota}'}, {'{fecha}'}, {'{monto}'}
        </p>
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