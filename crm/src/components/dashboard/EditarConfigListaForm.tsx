'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function EditarConfigListaForm({ clave, titulo, valores }: {
  clave: string
  titulo: string
  valores: string[]
}) {
  const router = useRouter()
  const [lista, setLista] = useState(valores)
  const [nuevo, setNuevo] = useState('')
  const [loading, setLoading] = useState(false)

  async function guardar(nuevaLista: string[]) {
    setLoading(true)
    await fetch('/api/configuracion/general', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clave, valores: nuevaLista }),
    })
    setLoading(false)
    router.refresh()
  }

  function agregar() {
    if (!nuevo.trim()) return
    const valor = nuevo.trim().toLowerCase().replace(/\s+/g, '_')
    if (lista.includes(valor)) return
    const nueva = [...lista, valor]
    setLista(nueva)
    setNuevo('')
    guardar(nueva)
  }

  function eliminar(valor: string) {
    const nueva = lista.filter(v => v !== valor)
    setLista(nueva)
    guardar(nueva)
  }

  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>{titulo}</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {lista.map(valor => (
          <div key={valor} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f9fafb', borderRadius: 8, border: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: 13, color: '#374151', textTransform: 'capitalize' }}>
              {valor.replace(/_/g, ' ')}
            </span>
            <button
              onClick={() => eliminar(valor)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#9ca3af', padding: '0 4px' }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={nuevo}
          onChange={e => setNuevo(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), agregar())}
          placeholder="Agregar nuevo..."
          style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, outline: 'none' }}
        />
        <button
          onClick={agregar}
          disabled={loading || !nuevo.trim()}
          style={{ padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, border: 'none', background: '#111827', color: 'white', cursor: 'pointer', opacity: loading || !nuevo.trim() ? 0.5 : 1 }}
        >
          +
        </button>
      </div>
    </div>
  )
}