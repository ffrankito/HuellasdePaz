'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function NuevoLeadForm({ origenes }: { origenes: string[] }) {
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
      telefono: (form.elements.namedItem('telefono') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value || null,
      origen: (form.elements.namedItem('origen') as HTMLSelectElement).value || origenes[0],
      mensaje: (form.elements.namedItem('mensaje') as HTMLTextAreaElement).value || null,
    }

    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      setError('Error al guardar el lead. Intentá de nuevo.')
      setLoading(false)
      return
    }

    router.push('/dashboard/leads')
    router.refresh()
  }

  const inputStyle = {
    display: 'block', width: '100%', padding: '10px 14px', fontSize: 14,
    color: '#111827', background: 'white', border: '1px solid #e5e7eb',
    borderRadius: 10, outline: 'none', boxSizing: 'border-box' as const,
  }

  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }
  const fieldStyle = { display: 'flex', flexDirection: 'column' as const }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Nombre *</label>
          <input name="nombre" type="text" required style={inputStyle} placeholder="Juan García" />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Teléfono *</label>
          <input name="telefono" type="tel" required style={inputStyle} placeholder="3413000000" />
        </div>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Email</label>
        <input name="email" type="email" style={inputStyle} placeholder="juan@email.com" />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Origen</label>
        <select name="origen" style={inputStyle}>
          {origenes.map(o => (
            <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Mensaje</label>
        <textarea name="mensaje" rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Mensaje o consulta del lead..." />
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 10, padding: '12px 16px' }}>
          <p style={{ fontSize: 14, color: '#dc2626', margin: 0 }}>{error}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 }}>
        <button type="button" onClick={() => router.back()}
          style={{ padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500, border: '1px solid #e5e7eb', background: 'white', color: '#374151', cursor: 'pointer' }}>
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          style={{ padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500, border: 'none', background: '#111827', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Guardando...' : 'Guardar lead'}
        </button>
      </div>
    </form>
  )
}