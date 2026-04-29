'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { type PlanConfig } from '@/db/schema'

export function EditarPlanConfigInline({ plan }: { plan: PlanConfig }) {
  const router = useRouter()
  const [editando, setEditando] = useState(false)
  const [loading, setLoading] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleEliminar() {
    if (!confirm(`¿Eliminar "${plan.nombre}"? Esta acción no se puede deshacer.`)) return
    setEliminando(true)
    await fetch(`/api/configuracion/planes/${plan.id}`, { method: 'DELETE' })
    router.refresh()
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = e.currentTarget
    const data = {
      nombre: (form.elements.namedItem('nombre') as HTMLInputElement).value,
      descripcion: (form.elements.namedItem('descripcion') as HTMLInputElement).value || null,
      cuotaMensual: (form.elements.namedItem('cuotaMensual') as HTMLInputElement).value,
    }

    const res = await fetch(`/api/configuracion/planes/${plan.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      setError('Error al guardar.')
      setLoading(false)
      return
    }

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>{plan.nombre}</p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, background: plan.activo ? '#f0fdf4' : '#fef2f2', color: plan.activo ? '#15803d' : '#dc2626', padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>
              {plan.activo ? 'Activo' : 'Inactivo'}
            </span>
            <button
              onClick={() => setEditando(true)}
              style={{ fontSize: 11, color: '#1d4ed8', background: '#eff6ff', border: 'none', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontWeight: 600 }}
            >
              Editar
            </button>
            <button
              onClick={handleEliminar}
              disabled={eliminando}
              style={{ fontSize: 11, color: '#dc2626', background: '#fef2f2', border: 'none', borderRadius: 6, padding: '3px 10px', cursor: eliminando ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: eliminando ? 0.6 : 1 }}
            >
              {eliminando ? '...' : 'Eliminar'}
            </button>
          </div>
        </div>
        {plan.descripcion && <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 12px' }}>{plan.descripcion}</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: '#9ca3af' }}>Cuota mensual</span>
            <span style={{ fontWeight: 600, color: '#111827' }}>${Number(plan.cuotaMensual).toLocaleString('es-AR')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: '#9ca3af' }}>Vigencia</span>
            <span style={{ fontWeight: 600, color: '#111827' }}>Indefinida</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: '#eff6ff', borderRadius: 12, padding: '18px 20px', border: '1px solid #bfdbfe', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#1d4ed8', margin: 0 }}>Editando plan</p>

      <div>
        <label style={{ display: 'block', fontSize: 12, color: '#374151', marginBottom: 4 }}>Nombre</label>
        <input name="nombre" required style={inputStyle} defaultValue={plan.nombre} />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 12, color: '#374151', marginBottom: 4 }}>Descripción</label>
        <input name="descripcion" style={inputStyle} defaultValue={plan.descripcion ?? ''} />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 12, color: '#374151', marginBottom: 4 }}>Cuota mensual (ARS)</label>
        <input name="cuotaMensual" type="number" min="0" required style={inputStyle} defaultValue={Number(plan.cuotaMensual).toString()} />
      </div>

      {error && <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" onClick={() => setEditando(false)}
          style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb', background: 'white', color: '#374151', cursor: 'pointer' }}>
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, border: 'none', background: '#1d4ed8', color: 'white', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}