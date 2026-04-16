'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { type Cliente, type Mascota } from '@/db/schema'

const tipoLabel: Record<string, string> = {
  cremacion_individual: 'Cremación individual',
  cremacion_comunitaria: 'Cremación comunitaria',
  entierro: 'Entierro',
}

export function NuevoServicioForm({ clientes, mascotas, tiposServicio }: {
  clientes: Cliente[]
  mascotas: Mascota[]
  tiposServicio: string[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clienteId, setClienteId] = useState('')

  const mascotasFiltradas = mascotas.filter(m => m.clienteId === clienteId)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = e.currentTarget
    const data = {
      clienteId,
      mascotaId: (form.elements.namedItem('mascotaId') as HTMLSelectElement).value,
      tipo: (form.elements.namedItem('tipo') as HTMLSelectElement).value,
      fechaRetiro: (form.elements.namedItem('fechaRetiro') as HTMLInputElement).value || null,
      notas: (form.elements.namedItem('notas') as HTMLTextAreaElement).value || null,
    }

    const res = await fetch('/api/servicios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      setError('Error al guardar el servicio. Intentá de nuevo.')
      setLoading(false)
      return
    }

    router.push('/dashboard/servicios')
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
      <div style={fieldStyle}>
        <label style={labelStyle}>Cliente *</label>
        <select required value={clienteId} onChange={e => setClienteId(e.target.value)} style={inputStyle}>
          <option value="">Seleccioná un cliente</option>
          {clientes.map(c => (
            <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>
          ))}
        </select>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Mascota *</label>
        <select name="mascotaId" required style={inputStyle} disabled={!clienteId}>
          <option value="">{clienteId ? 'Seleccioná una mascota' : 'Primero seleccioná un cliente'}</option>
          {mascotasFiltradas.map(m => (
            <option key={m.id} value={m.id}>{m.nombre} · {m.especie}</option>
          ))}
        </select>
        {clienteId && mascotasFiltradas.length === 0 && (
          <p style={{ fontSize: 12, color: '#f59e0b', marginTop: 4 }}>Este cliente no tiene mascotas registradas.</p>
        )}
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Tipo de servicio *</label>
        <select name="tipo" required style={inputStyle}>
          <option value="">Seleccioná el tipo</option>
          {tiposServicio.map(tipo => (
            <option key={tipo} value={tipo}>{tipoLabel[tipo] ?? tipo.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Fecha de retiro</label>
        <input name="fechaRetiro" type="datetime-local" style={inputStyle} />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Notas</label>
        <textarea name="notas" rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Información adicional..." />
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
          {loading ? 'Guardando...' : 'Guardar servicio'}
        </button>
      </div>
    </form>
  )
}