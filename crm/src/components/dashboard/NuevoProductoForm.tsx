'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function NuevoProductoForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [foto, setFoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFoto(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = e.currentTarget
    let fotoUrl: string | null = null

    if (foto) {
      const formData = new FormData()
      formData.append('file', foto)
      const res = await fetch('/api/storage/inventario', {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        const data = await res.json()
        fotoUrl = data.url
      }
    }

    const data = {
      nombre: (form.elements.namedItem('nombre') as HTMLInputElement).value,
      descripcion: (form.elements.namedItem('descripcion') as HTMLInputElement).value || null,
      categoria: (form.elements.namedItem('categoria') as HTMLSelectElement).value,
      stockActual: parseInt((form.elements.namedItem('stockActual') as HTMLInputElement).value),
      stockMinimo: parseInt((form.elements.namedItem('stockMinimo') as HTMLInputElement).value),
      proveedor: (form.elements.namedItem('proveedor') as HTMLInputElement).value || null,
      notas: (form.elements.namedItem('notas') as HTMLTextAreaElement).value || null,
      foto: fotoUrl,
    }

    const res = await fetch('/api/inventario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      setError('Error al guardar el producto. Intentá de nuevo.')
      setLoading(false)
      return
    }

    router.push('/dashboard/inventario')
    router.refresh()
  }

  const inputStyle = {
    display: 'block', width: '100%', padding: '10px 14px', fontSize: 14,
    color: '#111827', background: 'white', border: '1px solid #e5e7eb',
    borderRadius: 10, outline: 'none', boxSizing: 'border-box' as const,
  }

  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }
  const fieldStyle = { display: 'flex', flexDirection: 'column' as const }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Foto */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Foto del producto</label>
        {preview ? (
          <div style={{ position: 'relative' }}>
            <img src={preview} alt="preview" style={{ width: '100%', maxHeight: 200, borderRadius: 12, objectFit: 'cover', border: '1px solid #f3f4f6' }} />
            <button
              type="button"
              onClick={() => { setFoto(null); setPreview(null) }}
              style={{ position: 'absolute', top: 8, right: 8, background: '#dc2626', color: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 14 }}
            >
              ✕
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <label style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              border: '1px dashed #e5e7eb', borderRadius: 12, padding: '20px', cursor: 'pointer', background: '#f9fafb',
            }}>
              <span style={{ fontSize: 24, marginBottom: 6 }}>📷</span>
              <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Tomar foto</span>
              <span style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Cámara</span>
              <input type="file" accept="image/*" capture="environment" onChange={handleFoto} style={{ display: 'none' }} />
            </label>
            <label style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              border: '1px dashed #e5e7eb', borderRadius: 12, padding: '20px', cursor: 'pointer', background: '#f9fafb',
            }}>
              <span style={{ fontSize: 24, marginBottom: 6 }}>🖼️</span>
              <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Subir imagen</span>
              <span style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>JPG, PNG, WEBP</span>
              <input type="file" accept="image/*" onChange={handleFoto} style={{ display: 'none' }} />
            </label>
          </div>
        )}
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Nombre *</label>
        <input name="nombre" required style={inputStyle} placeholder="Urna estándar" />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Descripción</label>
        <input name="descripcion" style={inputStyle} placeholder="Descripción breve del producto" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Categoría *</label>
          <select name="categoria" required style={inputStyle}>
            <option value="">Seleccioná</option>
            <option value="urna">Urna</option>
            <option value="bolsa">Bolsa</option>
            <option value="caja">Caja</option>
            <option value="accesorio">Accesorio</option>
            <option value="insumo">Insumo</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Proveedor</label>
          <input name="proveedor" style={inputStyle} placeholder="Nombre del proveedor" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Stock actual *</label>
          <input name="stockActual" type="number" min="0" required style={inputStyle} placeholder="0" />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Stock mínimo *</label>
          <input name="stockMinimo" type="number" min="0" required style={inputStyle} placeholder="5" />
        </div>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Notas</label>
        <textarea name="notas" rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Información adicional..." />
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 10, padding: '12px 16px' }}>
          <p style={{ fontSize: 14, color: '#dc2626', margin: 0 }}>{error}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 }}>
        <button type="button" onClick={() => router.back()}
          style={{ padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500, border: '1px solid #e5e7eb', background: 'white', color: '#374151', cursor: 'pointer' }}>
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          style={{ padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500, border: 'none', background: '#111827', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Guardando...' : 'Guardar producto'}
        </button>
      </div>
    </form>
  )
}