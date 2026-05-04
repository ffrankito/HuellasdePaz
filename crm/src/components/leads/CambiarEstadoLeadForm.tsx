'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const estados = [
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'contactado', label: 'Contactado' },
  { value: 'interesado', label: 'Interesado' },
  { value: 'cotizado', label: 'Cotizado' },
  { value: 'convertido', label: 'Convertido' },
  { value: 'perdido', label: 'Perdido' },
]

export function CambiarEstadoLeadForm({
  leadId,
  estadoActual,
  canEdit = false,
}: {
  leadId: string
  estadoActual: string
  canEdit?: boolean
}) {
  const router = useRouter()
  const [estado, setEstado] = useState(estadoActual)
  const [loading, setLoading] = useState(false)

  async function handleChange(nuevoEstado: string) {
    if (!canEdit || nuevoEstado === estado) return
    setLoading(true)
    setEstado(nuevoEstado)

    await fetch(`/api/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado }),
    })

    router.refresh()
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
      <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
        {canEdit ? 'Cambiar estado' : 'Estado (solo lectura)'}
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {estados.map(e => (
          <button
            key={e.value}
            onClick={() => handleChange(e.value)}
            disabled={loading || !canEdit}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 500,
              border: '1px solid',
              cursor: !canEdit ? 'default' : loading ? 'not-allowed' : 'pointer',
              opacity: !canEdit ? 0.4 : loading ? 0.6 : 1,
              borderColor: estado === e.value ? '#111827' : '#e5e7eb',
              background: estado === e.value ? '#111827' : 'white',
              color: estado === e.value ? 'white' : '#374151',
              transition: 'all 0.15s',
            }}
          >
            {e.label}
          </button>
        ))}
      </div>
    </div>
  )
}