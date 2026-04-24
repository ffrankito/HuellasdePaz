'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function NuevaNoticiaForm() {
  const router = useRouter()
  const [titulo, setTitulo] = useState('')
  const [contenido, setContenido] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inputStyle = {
    display: 'block', width: '100%', padding: '10px 14px', fontSize: 14,
    color: '#111827', background: 'white', border: '1px solid #e5e7eb',
    borderRadius: 10, outline: 'none', boxSizing: 'border-box' as const,
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim() || !contenido.trim()) return
    setLoading(true)
    setError(null)

    const res = await fetch('/api/noticias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, contenido }),
    })

    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Error al publicar la noticia.')
      return
    }
    setTitulo('')
    setContenido('')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
          Título
        </label>
        <input
          type="text"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          placeholder="Novedades de febrero..."
          required
          style={inputStyle}
        />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
          Contenido
        </label>
        <textarea
          value={contenido}
          onChange={e => setContenido(e.target.value)}
          placeholder="Mensaje para los clientes..."
          rows={4}
          required
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>
      {error && <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>}
      <button
        type="submit"
        disabled={loading || !titulo.trim() || !contenido.trim()}
        style={{
          alignSelf: 'flex-start', padding: '10px 20px', borderRadius: 10,
          fontSize: 14, fontWeight: 500, border: 'none',
          background: '#111827', color: 'white',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading || !titulo.trim() || !contenido.trim() ? 0.5 : 1,
        }}
      >
        {loading ? 'Publicando...' : 'Publicar noticia'}
      </button>
    </form>
  )
}
