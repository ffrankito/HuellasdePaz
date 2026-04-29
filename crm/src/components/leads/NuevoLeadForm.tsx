'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type VetOption = { id: string; nombre: string }

export function NuevoLeadForm({
  origenes,
  veterinarias,
}: {
  origenes: string[]
  veterinarias: VetOption[]
}) {
  const router = useRouter()
  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    dni: '',
    email: '',
    origen: '',
    veterinariaId: '',
    mensaje: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value,
      // Si cambia origen y no es veterinaria, limpiar veterinariaId
      ...(name === 'origen' && value !== 'veterinaria' ? { veterinariaId: '' } : {}),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre.trim() || !form.telefono.trim()) {
      setError('Nombre y teléfono son requeridos')
      return
    }

    setLoading(true)
    setError(null)

    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: form.nombre.trim(),
        telefono: form.telefono.trim(),
        dni: form.dni.trim() || null,
        email: form.email.trim() || null,
        origen: form.origen || 'directo',
        veterinariaId: form.veterinariaId || null,
        mensaje: form.mensaje.trim() || null,
      }),
    })

    if (!res.ok) {
      setError('Error al guardar el lead. Intentá de nuevo.')
      setLoading(false)
      return
    }

    const lead = await res.json()
    router.push(`/dashboard/leads/${lead.id}`)
    router.refresh()
  }

  const inputStyle = {
    display: 'block',
    width: '100%',
    padding: '10px 14px',
    fontSize: 14,
    color: '#111827',
    background: '#f9fafb',
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
  } as const

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      <div className="grid-2" style={{ gap: 16 }}>
        <div>
          <label style={labelStyle}>Nombre *</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
            placeholder="Nombre completo"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Teléfono *</label>
          <input
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            required
            placeholder="341 000-0000"
            style={inputStyle}
          />
        </div>
      </div>

      <div className="grid-2" style={{ gap: 16 }}>
        <div>
          <label style={labelStyle}>DNI</label>
          <input
            name="dni"
            value={form.dni}
            onChange={handleChange}
            placeholder="12.345.678"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="email@ejemplo.com"
            style={inputStyle}
          />
        </div>
      </div>

      <div className="grid-2" style={{ gap: 16 }}>
        <div>
          <label style={labelStyle}>Origen</label>
          <select name="origen" value={form.origen} onChange={handleChange} style={inputStyle}>
            <option value="">Seleccioná un origen</option>
            {origenes.map(o => (
              <option key={o} value={o}>
                {o.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        {/* Selector de veterinaria — solo si origen es veterinaria */}
        {form.origen === 'veterinaria' && (
          <div>
            <label style={labelStyle}>Veterinaria</label>
            <select name="veterinariaId" value={form.veterinariaId} onChange={handleChange} style={inputStyle}>
              <option value="">Seleccioná la veterinaria</option>
              {veterinarias.length === 0 ? (
                <option disabled>No hay veterinarias con convenio activo</option>
              ) : (
                veterinarias.map(v => (
                  <option key={v.id} value={v.id}>{v.nombre}</option>
                ))
              )}
            </select>
          </div>
        )}
      </div>

      <div>
        <label style={labelStyle}>Mensaje / Consulta</label>
        <textarea
          name="mensaje"
          value={form.mensaje}
          onChange={handleChange}
          rows={3}
          placeholder="¿En qué está interesado el cliente?"
          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
        />
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px' }}>
          <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{ padding: '11px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500, border: '1px solid #e5e7eb', background: 'white', color: '#374151', cursor: 'pointer' }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '11px 24px', borderRadius: 10, fontSize: 14, fontWeight: 500, border: 'none', background: '#111827', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Guardando...' : 'Crear lead'}
        </button>
      </div>
    </form>
  )
}