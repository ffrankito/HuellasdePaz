'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { type Mascota } from '@/db/schema'

export function EditarMemorialForm({ mascota, token }: { mascota: Mascota; token: string }) {
  const router = useRouter()
  const [dedicatoria, setDedicatoria] = useState(mascota.dedicatoria ?? '')
  const [foto, setFoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(mascota.foto ?? null)
  const [galeriaFiles, setGaleriaFiles] = useState<File[]>([])
  const [galeriaPreviews, setGaleriaPreviews] = useState<string[]>((mascota.galeria ?? []) as string[])
  const [galeriaExistente, setGaleriaExistente] = useState<string[]>((mascota.galeria ?? []) as string[])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFoto(file)
    setPreview(URL.createObjectURL(file))
  }

  function handleGaleriaAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const nuevos = files.slice(0, 9 - galeriaPreviews.length)
    const newPreviews = nuevos.map(f => URL.createObjectURL(f))
    setGaleriaFiles(prev => [...prev, ...nuevos])
    setGaleriaPreviews(prev => [...prev, ...newPreviews])
    e.target.value = ''
  }

  function eliminarFotoGaleria(index: number) {
    const esExistente = index < galeriaExistente.length
    if (esExistente) {
      const nuevaExistente = galeriaExistente.filter((_, i) => i !== index)
      setGaleriaExistente(nuevaExistente)
      setGaleriaPreviews(prev => prev.filter((_, i) => i !== index))
    } else {
      const offsetNuevas = index - galeriaExistente.length
      setGaleriaFiles(prev => prev.filter((_, i) => i !== offsetNuevas))
      setGaleriaPreviews(prev => prev.filter((_, i) => i !== index))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('token', token)
    formData.append('dedicatoria', dedicatoria)
    if (foto) formData.append('foto', foto)

    // Enviar fotos eliminadas de la galería existente
    formData.append('galeriaExistente', JSON.stringify(galeriaExistente))

    for (const img of galeriaFiles) {
      formData.append('galeria', img)
    }

    const res = await fetch(`/api/portal/mascotas/${mascota.id}`, {
      method: 'PATCH',
      body: formData,
    })

    if (!res.ok) {
      setError('Error al guardar los cambios. Intentá de nuevo.')
      setLoading(false)
      return
    }

    router.push(`/portal/${token}/memorial/${mascota.id}`)
    router.refresh()
  }

  const inputStyle: React.CSSProperties = {
    display: 'block', width: '100%', padding: '12px 16px', fontSize: 14,
    color: '#111827', background: 'white', border: '1px solid #e5e7eb',
    borderRadius: 12, outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit',
  }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }
  const cardStyle: React.CSSProperties = { background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Foto principal */}
      <div style={cardStyle}>
        <label style={{ ...labelStyle, marginBottom: 14 }}>Foto de {mascota.nombre}</label>
        {preview && (
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <img src={preview} alt={mascota.nombre} style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 12 }} />
            <button
              type="button"
              onClick={() => { setFoto(null); setPreview(null) }}
              style={{ position: 'absolute', top: 8, right: 8, background: '#dc2626', color: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ✕
            </button>
          </div>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <label style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px', border: '1px dashed #e5e7eb', borderRadius: 10, cursor: 'pointer', background: '#f9fafb' }}>
            <span style={{ fontSize: 18, marginBottom: 4 }}>📷</span>
            <span style={{ fontSize: 11, color: '#6b7280' }}>Cámara</span>
            <input type="file" accept="image/*" capture="environment" onChange={handleFoto} style={{ display: 'none' }} />
          </label>
          <label style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px', border: '1px dashed #e5e7eb', borderRadius: 10, cursor: 'pointer', background: '#f9fafb' }}>
            <span style={{ fontSize: 18, marginBottom: 4 }}>🖼️</span>
            <span style={{ fontSize: 11, color: '#6b7280' }}>Galería</span>
            <input type="file" accept="image/*" onChange={handleFoto} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* Galería de recuerdos */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Galería de recuerdos</label>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>{galeriaPreviews.length}/9</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {galeriaPreviews.map((url, i) => (
            <div key={i} style={{ position: 'relative', aspectRatio: '1' }}>
              <img src={url} alt={`Foto ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
              <button
                type="button"
                onClick={() => eliminarFotoGaleria(i)}
                style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>
          ))}

          {galeriaPreviews.length < 9 && (
            <label style={{ aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed #e5e7eb', borderRadius: 10, cursor: 'pointer', background: '#f9fafb', gap: 4 }}>
              <span style={{ fontSize: 20, color: '#9ca3af' }}>+</span>
              <span style={{ fontSize: 10, color: '#9ca3af' }}>Agregar</span>
              <input type="file" accept="image/*" multiple onChange={handleGaleriaAdd} style={{ display: 'none' }} />
            </label>
          )}
        </div>

        <p style={{ fontSize: 11, color: '#9ca3af', margin: '10px 0 0' }}>
          Podés agregar hasta 9 fotos que aparecerán en el memorial.
        </p>
      </div>

      {/* Dedicatoria */}
      <div style={cardStyle}>
        <label style={labelStyle}>Dedicatoria</label>
        <textarea
          value={dedicatoria}
          onChange={e => setDedicatoria(e.target.value)}
          rows={5}
          placeholder={`Escribí unas palabras en memoria de ${mascota.nombre}...`}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }}
          maxLength={500}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 0 0' }}>
          <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Esta frase aparecerá en el memorial.</p>
          <p style={{ fontSize: 11, color: dedicatoria.length > 450 ? '#dc2626' : '#9ca3af', margin: 0 }}>{dedicatoria.length}/500</p>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{ padding: '15px', borderRadius: 14, fontSize: 14, fontWeight: 600, border: 'none', background: '#111827', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
      >
        {loading ? (
          <>
            <svg style={{ animation: 'spin 0.8s linear infinite' }} width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="40 60"/>
            </svg>
            Guardando...
          </>
        ) : 'Guardar cambios'}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </form>
  )
}
