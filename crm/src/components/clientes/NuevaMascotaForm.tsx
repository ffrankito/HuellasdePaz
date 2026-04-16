// crm/src/components/clientes/NuevaMascotaForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: '1px solid #e5e7eb', fontSize: 14, color: '#111827',
  outline: 'none', boxSizing: 'border-box' as const,
}
const labelStyle = { fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }

export default function NuevaMascotaForm({ clienteId }: { clienteId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = e.currentTarget
    const data = {
      clienteId,
      nombre: (form.elements.namedItem('nombre') as HTMLInputElement).value,
      especie: (form.elements.namedItem('especie') as HTMLSelectElement).value,
      raza: (form.elements.namedItem('raza') as HTMLInputElement).value || null,
      fechaFallecimiento: (form.elements.namedItem('fechaFallecimiento') as HTMLInputElement).value || null,
    }

    const res = await fetch('/api/mascotas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      router.push(`/dashboard/clientes/${clienteId}`)
      router.refresh()
    } else {
      setError('Hubo un error al guardar la mascota. Intentá de nuevo.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <label style={labelStyle}>Nombre *</label>
        <input name="nombre" required style={inputStyle} placeholder="Ej: Firulais" />
      </div>

      <div>
        <label style={labelStyle}>Especie *</label>
        <select name="especie" required style={inputStyle}>
          <option value="">Seleccioná una especie</option>
          <option value="perro">Perro</option>
          <option value="gato">Gato</option>
          <option value="conejo">Conejo</option>
          <option value="ave">Ave</option>
          <option value="reptil">Reptil</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <div>
        <label style={labelStyle}>Raza</label>
        <input name="raza" style={inputStyle} placeholder="Opcional" />
      </div>

      <div>
        <label style={labelStyle}>Fecha de fallecimiento</label>
        <input name="fechaFallecimiento" type="date" style={inputStyle} />
      </div>

      {error && (
        <p style={{ fontSize: 14, color: '#dc2626', background: '#fef2f2', padding: '10px 14px', borderRadius: 8 }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #e5e7eb', background: 'white', fontSize: 14, color: '#374151', cursor: 'pointer' }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '10px 24px', borderRadius: 10, background: '#111827', color: 'white', fontSize: 14, fontWeight: 500, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Guardando...' : 'Guardar mascota'}
        </button>
      </div>
    </form>
  )
}