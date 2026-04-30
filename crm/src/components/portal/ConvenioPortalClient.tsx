'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Lead = {
  id: string
  nombre: string
  telefono: string
  estado: string
  creadoEn: string
  mensaje: string | null
}

type Stats = {
  total: number
  convertidos: number
  perdidos: number
  enProceso: number
}

const estadoBadge: Record<string, { bg: string; color: string; label: string }> = {
  nuevo:       { bg: '#eff6ff', color: '#1d4ed8', label: 'Nuevo' },
  contactado:  { bg: '#f5f3ff', color: '#7c3aed', label: 'Contactado' },
  interesado:  { bg: '#fefce8', color: '#a16207', label: 'Interesado' },
  cotizado:    { bg: '#fff7ed', color: '#c2410c', label: 'Cotizado' },
  convertido:  { bg: '#f0fdf4', color: '#15803d', label: 'Cliente' },
  perdido:     { bg: '#f3f4f6', color: '#6b7280', label: 'Perdido' },
}

const inputStyle = {
  display: 'block', width: '100%', padding: '10px 14px', fontSize: 14,
  color: '#111827', background: 'white', border: '1px solid #e5e7eb',
  borderRadius: 10, outline: 'none', boxSizing: 'border-box' as const,
}

export function ConvenioPortalClient({
  token,
  convenioNombre,
  serviciosDisponibles,
  initialStats,
  initialLeads,
}: {
  token: string
  convenioNombre: string
  serviciosDisponibles: { id: string; nombre: string }[]
  initialStats: Stats
  initialLeads: Lead[]
}) {
  const router = useRouter()
  const [form, setForm] = useState({ nombre: '', telefono: '', dni: '', email: '', mascotaNombre: '', mascotaEspecie: '', servicioInteres: '', notas: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre.trim() || !form.telefono.trim()) {
      setError('Nombre y teléfono son obligatorios.')
      return
    }
    setLoading(true)
    setError(null)
    setSuccess(false)

    const res = await fetch(`/api/portal/convenio/${token}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Error al enviar. Intentá de nuevo.')
      return
    }

    setSuccess(true)
    setForm({ nombre: '', telefono: '', dni: '', email: '', mascotaNombre: '', mascotaEspecie: '', servicioInteres: '', notas: '' })
    router.refresh()
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px' }}>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
        <StatCard label="Leads enviados" value={initialStats.total} color="#111827" />
        <StatCard label="En proceso" value={initialStats.enProceso} color="#a16207" />
        <StatCard label="Convertidos" value={initialStats.convertidos} color="#15803d" />
      </div>

      {/* Formulario */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24, marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 18px' }}>Enviar nuevo lead</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Nombre del dueño *</label>
              <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="María García" style={inputStyle} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Teléfono *</label>
              <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="341 000-0000" style={inputStyle} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>DNI *</label>
              <input name="dni" value={form.dni} onChange={handleChange} placeholder="12.345.678" style={inputStyle} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Email (opcional)</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="cliente@email.com" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Nombre de la mascota</label>
              <input name="mascotaNombre" value={form.mascotaNombre} onChange={handleChange} placeholder="Firulais" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Especie</label>
              <select name="mascotaEspecie" value={form.mascotaEspecie} onChange={handleChange} style={inputStyle}>
                <option value="">—</option>
                <option value="perro">Perro</option>
                <option value="gato">Gato</option>
                <option value="conejo">Conejo</option>
                <option value="ave">Ave</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Servicio de interés</label>
            <select name="servicioInteres" value={form.servicioInteres} onChange={handleChange} style={inputStyle}>
              {serviciosDisponibles.length > 1 && <option value="">Por definir</option>}
              {serviciosDisponibles.map(s => (
                <option key={s.id} value={s.nombre}>{s.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Notas adicionales</label>
            <textarea name="notas" value={form.notas} onChange={handleChange} rows={2} placeholder="Cualquier información relevante para el equipo de Huellas de Paz..." style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
          </div>

          {error && <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>}
          {success && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px' }}>
              <p style={{ fontSize: 13, color: '#15803d', margin: 0, fontWeight: 500 }}>
                ¡Lead enviado! El equipo de Huellas de Paz se va a poner en contacto pronto.
              </p>
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            padding: '11px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600,
            border: 'none', background: '#2d8a54', color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Enviando...' : 'Enviar lead'}
          </button>
        </form>
      </div>

      {/* Lista de leads */}
      {initialLeads.length > 0 && (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>Leads enviados</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {initialLeads.map((l, i) => {
              const badge = estadoBadge[l.estado] ?? estadoBadge.nuevo
              return (
                <div key={l.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
                  borderTop: i > 0 ? '1px solid #f3f4f6' : undefined,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#111827', margin: '0 0 2px' }}>{l.nombre}</p>
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{l.telefono}</p>
                    {l.mensaje && (
                      <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.mensaje}</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <span style={{ background: badge.bg, color: badge.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                      {badge.label}
                    </span>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>
                      {new Date(l.creadoEn).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e5e7eb', padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 6px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 700, color, margin: 0 }}>{value}</p>
    </div>
  )
}
