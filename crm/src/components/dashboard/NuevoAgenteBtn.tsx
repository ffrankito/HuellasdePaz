'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const ROLES = [
  { value: 'televenta', label: 'Televenta' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'cremacion', label: 'Cremación' },
  { value: 'entrega', label: 'Entrega' },
  { value: 'contadora', label: 'Contadora' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
]

export default function NuevoAgenteBtn() {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ nombre: '', email: '', rol: 'televenta', password: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCargando(true)
    setError('')
    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al crear el agente')
        return
      }
      setAbierto(false)
      setForm({ nombre: '', email: '', rol: 'televenta', password: '' })
      router.refresh()
    } catch {
      setError('Error de conexión')
    } finally {
      setCargando(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        style={{
          background: '#111827', color: 'white', border: 'none', borderRadius: 10,
          padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}
      >
        + Nuevo agente
      </button>

      {abierto && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: 'white', borderRadius: 16, padding: 32, width: '100%', maxWidth: 440,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
              Nuevo agente
            </h2>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 24px' }}>
              El agente recibirá un email para configurar su contraseña.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  placeholder="Ej: Franco Zancocchia"
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '10px 12px',
                    border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="agente@email.com"
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '10px 12px',
                    border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Mínimo 8 caracteres"
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '10px 12px',
                    border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>
                  Rol
                </label>
                <select
                  value={form.rol}
                  onChange={e => setForm(f => ({ ...f, rol: e.target.value }))}
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '10px 12px',
                    border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none',
                    background: 'white',
                  }}
                >
                  {ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              {error && (
                <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => { setAbierto(false); setError('') }}
                  style={{
                    flex: 1, padding: '10px 0', border: '1px solid #e5e7eb', borderRadius: 8,
                    fontSize: 14, fontWeight: 500, color: '#374151', background: 'white', cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cargando}
                  style={{
                    flex: 1, padding: '10px 0', border: 'none', borderRadius: 8,
                    fontSize: 14, fontWeight: 600, color: 'white',
                    background: cargando ? '#9ca3af' : '#111827', cursor: cargando ? 'not-allowed' : 'pointer',
                  }}
                >
                  {cargando ? 'Creando...' : 'Crear agente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
