'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { type Convenio } from '@/db/schema'

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
} as const

export function ConvenioForm({ convenio }: { convenio?: Convenio }) {
  const router = useRouter()
  const esEdicion = !!convenio

  const [form, setForm] = useState({
    nombre: convenio?.nombre ?? '',
    tipo: convenio?.tipo ?? 'veterinaria',
    direccion: convenio?.direccion ?? '',
    telefono: convenio?.telefono ?? '',
    email: convenio?.email ?? '',
    responsable: convenio?.responsable ?? '',
    instagram: convenio?.instagram ?? '',
    web: convenio?.web ?? '',
    estadoConvenio: convenio?.estadoConvenio ?? 'sin_convenio',
    descuentoPorcentaje: convenio?.descuentoPorcentaje ?? '0',
    beneficioDescripcion: convenio?.beneficioDescripcion ?? '',
    fechaInicioConvenio: convenio?.fechaInicioConvenio
      ? new Date(convenio.fechaInicioConvenio).toISOString().split('T')[0]
      : '',
    fechaVencimientoConvenio: convenio?.fechaVencimientoConvenio
      ? new Date(convenio.fechaVencimientoConvenio).toISOString().split('T')[0]
      : '',
    notas: convenio?.notas ?? '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre.trim()) {
      setError('El nombre es requerido')
      return
    }

    setLoading(true)
    setError(null)

    const url = esEdicion
      ? `/api/convenios/${convenio.id}`
      : '/api/convenios'

    const res = await fetch(url, {
      method: esEdicion ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        descuentoPorcentaje: Number(form.descuentoPorcentaje),
        fechaInicioConvenio: form.fechaInicioConvenio || null,
        fechaVencimientoConvenio: form.fechaVencimientoConvenio || null,
      }),
    })

    if (!res.ok) {
      setError('Error al guardar. Intentá de nuevo.')
      setLoading(false)
      return
    }

    const data = await res.json()
    router.push(`/dashboard/convenios/${data.id}`)
    router.refresh()
  }

  const seccionStyle = {
    background: 'white',
    borderRadius: 16,
    border: '1px solid #f3f4f6',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 800 }}>

      {/* Datos básicos */}
      <div style={seccionStyle}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 20px' }}>Datos del convenio</h2>
        <div className="grid-2" style={{ gap: 16 }}>
          <div>
            <label style={labelStyle}>Nombre *</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} required style={inputStyle} placeholder="Ej: Veterinaria San Martín" />
          </div>
          <div>
            <label style={labelStyle}>Tipo</label>
            <select name="tipo" value={form.tipo} onChange={handleChange} style={inputStyle}>
              <option value="veterinaria">Veterinaria</option>
              <option value="petshop">Petshop</option>
              <option value="refugio">Refugio</option>
              <option value="clinica">Clínica</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Responsable</label>
            <input name="responsable" value={form.responsable} onChange={handleChange} style={inputStyle} placeholder="Dr. Juan Pérez" />
          </div>
          <div>
            <label style={labelStyle}>Teléfono</label>
            <input name="telefono" value={form.telefono} onChange={handleChange} style={inputStyle} placeholder="341 000-0000" />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} style={inputStyle} placeholder="contacto@ejemplo.com" />
          </div>
          <div>
            <label style={labelStyle}>Dirección</label>
            <input name="direccion" value={form.direccion} onChange={handleChange} style={inputStyle} placeholder="Av. Pellegrini 1234, Rosario" />
          </div>
          <div>
            <label style={labelStyle}>Instagram</label>
            <input name="instagram" value={form.instagram} onChange={handleChange} style={inputStyle} placeholder="@convenio" />
          </div>
          <div>
            <label style={labelStyle}>Web</label>
            <input name="web" value={form.web} onChange={handleChange} style={inputStyle} placeholder="www.ejemplo.com.ar" />
          </div>
        </div>
      </div>

      {/* Convenio */}
      <div style={seccionStyle}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 20px' }}>Convenio</h2>
        <div className="grid-2" style={{ gap: 16 }}>
          <div>
            <label style={labelStyle}>Estado del convenio</label>
            <select name="estadoConvenio" value={form.estadoConvenio} onChange={handleChange} style={inputStyle}>
              <option value="sin_convenio">Sin convenio</option>
              <option value="en_negociacion">En negociación</option>
              <option value="activo">Activo</option>
              <option value="pausado">Pausado</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Descuento (%)</label>
            <input name="descuentoPorcentaje" type="number" min="0" max="100" value={form.descuentoPorcentaje} onChange={handleChange} style={inputStyle} placeholder="0" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Descripción del beneficio</label>
            <input name="beneficioDescripcion" value={form.beneficioDescripcion} onChange={handleChange} style={inputStyle} placeholder="Ej: 10% de descuento en cremación individual" />
          </div>
          <div>
            <label style={labelStyle}>Inicio del convenio</label>
            <input name="fechaInicioConvenio" type="date" value={form.fechaInicioConvenio} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Vencimiento del convenio</label>
            <input name="fechaVencimientoConvenio" type="date" value={form.fechaVencimientoConvenio} onChange={handleChange} style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Notas */}
      <div style={seccionStyle}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>Notas internas</h2>
        <textarea
          name="notas"
          value={form.notas}
          onChange={handleChange}
          rows={3}
          placeholder="Notas sobre el convenio, acuerdos informales, contactos alternativos..."
          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
        />
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px' }}>
          <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        <button type="button" onClick={() => router.back()}
          style={{ padding: '11px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500, border: '1px solid #e5e7eb', background: 'white', color: '#374151', cursor: 'pointer' }}>
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          style={{ padding: '11px 24px', borderRadius: 10, fontSize: 14, fontWeight: 500, border: 'none', background: '#111827', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear convenio'}
        </button>
      </div>
    </form>
  )
}