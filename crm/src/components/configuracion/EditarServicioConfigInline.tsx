'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { type ServicioConfig } from '@/db/schema'

const tipoLabel: Record<string, string> = {
  cremacion_individual: 'Cremación individual',
  cremacion_comunitaria: 'Cremación comunitaria',
  entierro: 'Entierro',
}

export function EditarServicioConfigInline({ config }: { config: ServicioConfig }) {
  const router = useRouter()
  const [editando, setEditando] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      activo: (form.elements.namedItem('activo') as HTMLInputElement).checked,
    }
    const res = await fetch(`/api/configuracion/servicios/${config.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) { setError('Error al guardar.'); setLoading(false); return }
    setEditando(false)
    setLoading(false)
    router.refresh()
  }

  const inputStyle = {
    display: 'block', width: '100%', padding: '8px 12px', fontSize: 13,
    color: '#111827', background: 'white', border: '1px solid #e5e7eb',
    borderRadius: 8, outline: 'none', boxSizing: 'border-box' as const,
  }

  if (!editando) {
    return (
      <div style={{ background: '#f9fafb', borderRadius: 12, padding: '18px 20px', border: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>{config.nombre}</p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, background: config.activo ? '#f0fdf4' : '#fef2f2', color: config.activo ? '#15803d' : '#dc2626', padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>
              {config.activo ? 'Activo' : 'Inactivo'}
            </span>
            <button onClick={() => setEditando(true)} style={{ fontSize: 11, color: '#1d4ed8', background: '#eff6ff', border: 'none', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontWeight: 600 }}>
              Editar
            </button>
          </div>
        </div>
        {config.descripcion && <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 10px' }}>{config.descripcion}</p>}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <span style={{ color: '#9ca3af' }}>Precio base</span>
          <span style={{ fontWeight: 700, color: config.precio ? '#111827' : '#9ca3af' }}>
            {config.precio ? `$${Number(config.precio).toLocaleString('es-AR')}` : 'Consultar'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 4 }}>
          <span style={{ color: '#9ca3af' }}>Tipo</span>
          <span style={{ color: '#6b7280' }}>{tipoLabel[config.tipo] ?? config.tipo}</span>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: '#eff6ff', borderRadius: 12, padding: '18px 20px', border: '1px solid #bfdbfe', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#1d4ed8', margin: 0 }}>Editando servicio</p>
      <div>
        <label style={{ display: 'block', fontSize: 12, color: '#374151', marginBottom: 4 }}>Nombre</label>
        <input name="nombre" required style={inputStyle} defaultValue={config.nombre} />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 12, color: '#374151', marginBottom: 4 }}>Tipo</label>
        <select name="tipo" required style={inputStyle} defaultValue={config.tipo}>
          <option value="cremacion_comunitaria">Cremación comunitaria</option>
          <option value="cremacion_individual">Cremación individual</option>
          <option value="entierro">Entierro</option>
        </select>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 12, color: '#374151', marginBottom: 4 }}>Precio (ARS) — vacío = Consultar</label>
        <input name="precio" type="number" min="0" style={inputStyle} defaultValue={config.precio ? Number(config.precio).toString() : ''} placeholder="Dejar vacío para Consultar" />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 12, color: '#374151', marginBottom: 4 }}>Descripción</label>
        <input name="descripcion" style={inputStyle} defaultValue={config.descripcion ?? ''} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input name="activo" type="checkbox" defaultChecked={config.activo} style={{ width: 14, height: 14 }} />
        <label style={{ fontSize: 12, color: '#374151' }}>Activo</label>
      </div>
      {error && <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{error}</p>}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" onClick={() => setEditando(false)} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb', background: 'white', color: '#374151', cursor: 'pointer' }}>Cancelar</button>
        <button type="submit" disabled={loading} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, border: 'none', background: '#1d4ed8', color: 'white', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>{loading ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </form>
  )
}
