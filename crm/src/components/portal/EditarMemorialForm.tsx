'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { type Mascota } from '@/db/schema'

export function EditarMemorialForm({ mascota, token }: { mascota: Mascota; token: string }) {
  const router = useRouter()
  const [dedicatoria, setDedicatoria] = useState(mascota.dedicatoria ?? '')
  const [foto, setFoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(mascota.foto ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFoto(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('token', token)
    formData.append('dedicatoria', dedicatoria)
    if (foto) formData.append('foto', foto)

    const res = await fetch(`/api/portal/mascotas/${mascota.id}`, {
      method: 'PATCH',
      body: formData,
    })

    if (!res.ok) {
      setError('Error al guardar los cambios')
      setLoading(false)
      return
    }

    router.push(`/portal/${token}/memorial/${mascota.id}`)
    router.refresh()
  }

  const inputStyle = {
    display: 'block', width: '100%', padding: '12px 16px', fontSize: 14,
    color: '#111827', background: 'white', border: '1px solid #e5e7eb',
    borderRadius: 12, outline: 'none', boxSizing: 'border-box' as const,
  }

  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Foto */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <label style={{ ...labelStyle, marginBottom: 12 }}>Foto de {mascota.nombre}</label>
        {preview ? (
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <img src={preview} alt={mascota.nombre} style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 12 }} />
            <button
              type="button"
              onClick={() => { setFoto(null); setPreview(null) }}
              style={{ position: 'absolute', top: 8, right: 8, background: '#dc2626', color: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 14 }}
            >
              ✕
            </button>
          </div>
        ) : null}
        <div style={{ display: 'flex', gap: 10 }}>
          <label style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', border: '1px dashed #e5e7eb', borderRadius: 10, cursor: 'pointer', background: '#f9fafb' }}>
            <span style={{ fontSize: 20, marginBottom: 4 }}>📷</span>
            <span style={{ fontSize: 12, color: '#6b7280' }}>Tomar foto</span>
            <input type="file" accept="image/*" capture="environment" onChange={handleFoto} style={{ display: 'none' }} />
          </label>
          <label style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', border: '1px dashed #e5e7eb', borderRadius: 10, cursor: 'pointer', background: '#f9fafb' }}>
            <span style={{ fontSize: 20, marginBottom: 4 }}>🖼️</span>
            <span style={{ fontSize: 12, color: '#6b7280' }}>Subir foto</span>
            <input type="file" accept="image/*" onChange={handleFoto} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* Dedicatoria */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <label style={labelStyle}>Dedicatoria</label>
        <textarea
          value={dedicatoria}
          onChange={e => setDedicatoria(e.target.value)}
          rows={4}
          placeholder={`Escribí unas palabras en memoria de ${mascota.nombre}...`}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
        <p style={{ fontSize: 12, color: '#9ca3af', margin: '6px 0 0' }}>Esta frase aparecerá en el memorial.</p>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px' }}>
          <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{ padding: '14px', borderRadius: 12, fontSize: 14, fontWeight: 500, border: 'none', background: '#111827', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
      >
        {loading ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}