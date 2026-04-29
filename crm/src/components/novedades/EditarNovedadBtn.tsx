'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  id: string
  titulo: string
  contenido: string
  imagen: string | null
}

export function EditarNovedadBtn({ id, titulo, contenido, imagen }: Props) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(imagen)
  const [imagenNueva, setImagenNueva] = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const setFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    setPreview(URL.createObjectURL(file))
    setImagenNueva(true)
    const dt = new DataTransfer()
    dt.items.add(file)
    if (inputRef.current) inputRef.current.files = dt.files
  }, [])

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) setFile(file)
  }

  function cerrar() {
    setAbierto(false)
    setPreview(imagen)
    setImagenNueva(false)
    setError(null)
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
    if (!preview) formData.set('quitarImagen', 'true')
    const imagenFile = imagenNueva ? inputRef.current?.files?.[0] : null
    if (imagenFile) formData.set('imagen', imagenFile)

    const res = await fetch(`/api/noticias/${id}`, { method: 'PATCH', body: formData })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Error al guardar')
      setLoading(false)
      return
    }

    cerrar()
    setLoading(false)
    router.refresh()
  }

  const field = {
    width: '100%', padding: '11px 14px', fontSize: 14, color: '#111827',
    background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 10,
    outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit',
  }

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        title="Editar novedad"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 30, height: 30, borderRadius: 8,
          border: '1px solid #e5e7eb', background: 'white',
          cursor: 'pointer', color: '#6b7280',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>

      {abierto && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(2px)' }}
          onClick={e => { if (e.target === e.currentTarget) cerrar() }}
        >
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '24px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 2px', letterSpacing: '-0.02em' }}>
                  Editar novedad
                </h2>
                <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Los cambios se reflejan en el portal de clientes</p>
              </div>
              <button onClick={cerrar} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '20px 28px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

              {preview ? (
                <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden' }}>
                  <img src={preview} alt="Preview" style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)' }} />
                  <button
                    type="button"
                    onClick={() => { setPreview(null); setImagenNueva(false); if (inputRef.current) inputRef.current.value = '' }}
                    style={{ position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                  <span style={{ position: 'absolute', bottom: 10, left: 12, fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                    Clic en ✕ para quitar imagen
                  </span>
                </div>
              ) : (
                <label
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 10, height: 140, borderRadius: 12, cursor: 'pointer',
                    border: `2px dashed ${dragging ? '#111827' : '#d1d5db'}`,
                    background: dragging ? '#f9fafb' : 'white', transition: 'all 0.15s',
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="3"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
                    {dragging ? 'Soltá acá' : 'Subir nueva imagen · Arrastrá o hacé clic'}
                  </p>
                  <input ref={inputRef} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f) }} style={{ display: 'none' }} />
                </label>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>Título</label>
                <input name="titulo" required defaultValue={titulo} style={field}
                  onFocus={e => (e.currentTarget.style.borderColor = '#111827')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>Descripción</label>
                <textarea name="contenido" required rows={5} defaultValue={contenido}
                  style={{ ...field, resize: 'vertical', lineHeight: 1.6 }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#111827')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')} />
              </div>

              {error && (
                <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10 }}>
                  <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button type="button" onClick={cerrar} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={loading} style={{ flex: 2, padding: '11px', borderRadius: 10, border: 'none', background: loading ? '#6b7280' : '#111827', color: 'white', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s' }}>
                  {loading ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
