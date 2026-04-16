'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function AgregarNotaForm({ leadId }: { leadId: string }) {
  const router = useRouter()
  const [nota, setNota] = useState('')
  const [loading, setLoading] = useState(false)
  const [exito, setExito] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nota.trim()) return

    setLoading(true)

    await fetch(`/api/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nota: nota.trim() }),
    })

    setNota('')
    setExito(true)
    setTimeout(() => setExito(false), 2000)
    router.refresh()
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <textarea
        value={nota}
        onChange={e => setNota(e.target.value)}
        rows={3}
        placeholder="Escribí una nota sobre este lead..."
        style={{
          width: '100%',
          padding: '10px 14px',
          fontSize: 14,
          color: '#111827',
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: 10,
          outline: 'none',
          resize: 'vertical',
          boxSizing: 'border-box',
          fontFamily: 'inherit',
        }}
      />
      <button
        type="submit"
        disabled={loading || !nota.trim()}
        style={{
          padding: '9px 16px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 500,
          border: 'none',
          background: exito ? '#15803d' : '#111827',
          color: 'white',
          cursor: loading || !nota.trim() ? 'not-allowed' : 'pointer',
          opacity: loading || !nota.trim() ? 0.5 : 1,
          transition: 'background 0.2s',
          alignSelf: 'flex-end',
        }}
      >
        {exito ? '✓ Nota guardada' : loading ? 'Guardando...' : 'Guardar nota'}
      </button>
    </form>
  )
}