'use client'

import { useRef, useState, useEffect } from 'react'

type Props = {
  mascotaId: string
  token: string
  fotoActual: string | null
  nombre: string
  especie: string
  raza: string | null
  esEditor: boolean
}

export function CambiarFotoMascota({ mascotaId, token, fotoActual, nombre, especie, raza, esEditor }: Props) {
  const [foto, setFoto] = useState(fotoActual)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setFoto(fotoActual) }, [fotoActual])

  const emoji = especie === 'perro' ? '🐕' : especie === 'gato' ? '🐈' : '🐾'
  const displayFoto = preview ?? foto

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setErrorMsg(null)
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)
    setUploading(true)

    const fd = new FormData()
    fd.append('token', token)
    fd.append('foto', file)

    try {
      const res = await fetch(`/api/portal/mascotas/${mascotaId}`, { method: 'PATCH', body: fd })
      const data = await res.json()

      if (res.ok && data.foto) {
        setFoto(data.foto)
        setPreview(null)
      } else {
        setPreview(null)
        const detail = data?.detail ?? data?.error ?? 'error desconocido'
        setErrorMsg(`Error al guardar: ${detail}`)
      }
    } catch {
      setPreview(null)
      setErrorMsg('Error de conexión. Intentá de nuevo.')
    }

    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const CameraBtn = ({ style }: { style: React.CSSProperties }) => (
    <button
      onClick={() => inputRef.current?.click()}
      disabled={uploading}
      aria-label="Cambiar foto"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)',
        background: uploading ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(8px)',
        cursor: uploading ? 'default' : 'pointer',
        color: uploading ? 'rgba(255,255,255,0.4)' : 'white',
        transition: 'background 0.2s',
        ...style,
      }}
    >
      {uploading ? (
        <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.25)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite' }} />
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      )}
    </button>
  )

  return (
    <>
      {displayFoto ? (
        <div style={{ borderRadius: 28, overflow: 'hidden', position: 'relative' }}>
          <div style={{ aspectRatio: '4/3', width: '100%', position: 'relative' }}>
            <img
              src={displayFoto}
              alt={nombre}
              onError={() => {
                setErrorMsg('No se pudo cargar la imagen.')
              }}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: uploading ? 'brightness(0.6)' : 'none', transition: 'filter 0.3s' }}
            />
          </div>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,15,0.95) 0%, rgba(8,8,15,0.4) 45%, rgba(8,8,15,0.08) 100%)' }} />
          {esEditor && (
            <CameraBtn style={{ position: 'absolute', top: 16, right: 16, width: 38, height: 38 }} />
          )}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 32px 32px' }}>
            <h1 style={{ fontSize: 44, fontWeight: 700, color: 'white', margin: '0 0 6px', fontFamily: 'Georgia, Times New Roman, serif', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
              {nombre}
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0, textTransform: 'capitalize' }}>
              {especie}{raza ? ` · ${raza}` : ''}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '48px 0 40px', position: 'relative' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
            <span style={{ fontSize: 80, lineHeight: 1, display: 'block' }}>{emoji}</span>
            {esEditor && (
              <CameraBtn style={{ position: 'absolute', top: -4, right: -12, width: 34, height: 34 }} />
            )}
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 700, color: 'white', margin: '0 0 8px', fontFamily: 'Georgia, Times New Roman, serif', letterSpacing: '-0.02em' }}>
            {nombre}
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', margin: 0, textTransform: 'capitalize' }}>
            {especie}{raza ? ` · ${raza}` : ''}
          </p>
        </div>
      )}

      {errorMsg && (
        <p style={{ fontSize: 12, color: '#f87171', textAlign: 'center', marginTop: 10, marginBottom: 0 }}>
          {errorMsg}
        </p>
      )}

      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
