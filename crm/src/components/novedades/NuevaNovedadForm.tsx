'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export function NuevaNovedadForm() {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [publicarAhora, setPublicarAhora] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  const setFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    setPreview(URL.createObjectURL(file))
    // Sync the file to the hidden input via DataTransfer
    const dt = new DataTransfer()
    dt.items.add(file)
    if (inputRef.current) inputRef.current.files = dt.files
  }, [])

  function handleImagen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) setFile(file)
  }

  function cerrar() {
    setAbierto(false)
    setPreview(null)
    setError(null)
    setPublicarAhora(true)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = e.currentTarget
    const formData = new FormData()
    formData.set('titulo', (form.elements.namedItem('titulo') as HTMLInputElement).value)
    formData.set('contenido', (form.elements.namedItem('contenido') as HTMLTextAreaElement).value)
    const imagenFile = inputRef.current?.files?.[0]
    if (imagenFile) formData.set('imagen', imagenFile)
    formData.set('publicada', String(publicarAhora))

    const res = await fetch('/api/noticias', { method: 'POST', body: formData })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Error al publicar')
      setLoading(false)
      return
    }

    form.reset()
    cerrar()
    setLoading(false)
    router.refresh()
  }

  const field = {
    width: '100%', padding: '11px 14px', fontSize: 14, color: '#111827',
    background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 10,
    outline: 'none', boxSizing: 'border-box' as const, transition: 'border-color 0.15s',
    fontFamily: 'inherit',
  }

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 20px', background: '#111827', color: 'white',
          border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600,
          cursor: 'pointer', letterSpacing: '-0.01em',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Nueva novedad
      </button>

      {/* Modal overlay */}
      {abierto && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(2px)' }}
          onClick={e => { if (e.target === e.currentTarget) cerrar() }}
        >
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
            {/* Modal header */}
            <div style={{ padding: '24px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 2px', letterSpacing: '-0.02em' }}>
                  Nueva novedad
                </h2>
                <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Se publicará en el portal de todos los clientes</p>
              </div>
              <button
                type="button"
                onClick={cerrar}
                style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', flexShrink: 0 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '20px 28px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Drop zone / preview */}
              {preview ? (
                <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden' }}>
                  <img src={preview} alt="Preview" style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)' }} />
                  <button
                    type="button"
                    onClick={() => { setPreview(null); if (inputRef.current) inputRef.current.value = '' }}
                    style={{ position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                  <span style={{ position: 'absolute', bottom: 10, left: 12, fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                    Imagen seleccionada · clic en ✕ para cambiar
                  </span>
                </div>
              ) : (
                <label
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 10, height: 160, borderRadius: 12, cursor: 'pointer',
                    border: `2px dashed ${dragging ? '#111827' : '#d1d5db'}`,
                    background: dragging ? '#f9fafb' : 'white',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="3"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#374151', margin: '0 0 2px' }}>
                      {dragging ? 'Soltá la imagen acá' : 'Subir imagen'}
                    </p>
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Arrastrá o hacé clic · JPG, PNG, WebP</p>
                  </div>
                  <input ref={inputRef} type="file" accept="image/*" onChange={handleImagen} style={{ display: 'none' }} />
                </label>
              )}

              {/* Título */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7, letterSpacing: '-0.01em' }}>
                  Título
                </label>
                <input
                  name="titulo"
                  required
                  placeholder="Ej: Ampliamos nuestras instalaciones"
                  style={field}
                  onFocus={e => (e.currentTarget.style.borderColor = '#111827')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
                />
              </div>

              {/* Descripción */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7, letterSpacing: '-0.01em' }}>
                  Descripción
                </label>
                <textarea
                  name="contenido"
                  required
                  rows={5}
                  placeholder="Contá los detalles de la novedad para los clientes..."
                  style={{ ...field, resize: 'vertical', lineHeight: 1.6 }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#111827')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
                />
              </div>

              {error && (
                <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10 }}>
                  <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
                </div>
              )}

              {/* Borrador toggle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 14px', background: '#f9fafb', borderRadius: 10, border: '1.5px solid #e5e7eb' }}>
                <div
                  style={{
                    width: 36, height: 20, borderRadius: 10, position: 'relative', flexShrink: 0,
                    background: publicarAhora ? '#2d8a54' : '#d1d5db',
                    transition: 'background 0.15s', cursor: 'pointer',
                  }}
                  onClick={() => setPublicarAhora(v => !v)}
                >
                  <div style={{
                    position: 'absolute', top: 3, left: publicarAhora ? 18 : 3, width: 14, height: 14,
                    borderRadius: '50%', background: 'white', transition: 'left 0.15s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </div>
                <div onClick={() => setPublicarAhora(v => !v)}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: 0 }}>
                    {publicarAhora ? 'Publicar ahora' : 'Guardar como borrador'}
                  </p>
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>
                    {publicarAhora ? 'Visible en el portal de clientes' : 'Solo vos podés verlo, los clientes no'}
                  </p>
                </div>
              </label>

              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button
                  type="button"
                  onClick={cerrar}
                  style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ flex: 2, padding: '11px', borderRadius: 10, border: 'none', background: loading ? '#6b7280' : '#111827', color: 'white', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '-0.01em', transition: 'background 0.15s' }}
                >
                  {loading ? (publicarAhora ? 'Publicando...' : 'Guardando...') : (publicarAhora ? 'Publicar novedad' : 'Guardar borrador')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
