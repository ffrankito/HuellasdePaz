'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function PerfilPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [pwEstado, setPwEstado] = useState<'idle' | 'cargando' | 'ok' | 'error'>('idle')
  const [pwMensaje, setPwMensaje] = useState('')

  useEffect(() => {
    setDarkMode(localStorage.getItem('darkMode') === 'true')
  }, [])

  function toggleDarkMode() {
    const nuevo = !darkMode
    setDarkMode(nuevo)
    localStorage.setItem('darkMode', String(nuevo))
    document.body.classList.toggle('dark', nuevo)
  }

  async function handleCambiarPassword(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmacion) {
      setPwMensaje('Las contraseñas no coinciden')
      setPwEstado('error')
      return
    }
    if (password.length < 8) {
      setPwMensaje('Mínimo 8 caracteres')
      setPwEstado('error')
      return
    }
    setPwEstado('cargando')
    setPwMensaje('')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setPwMensaje(error.message)
      setPwEstado('error')
      return
    }
    setPwEstado('ok')
    setPwMensaje('Contraseña actualizada correctamente')
    setPassword('')
    setConfirmacion('')
    setTimeout(() => setPwEstado('idle'), 4000)
  }

  const card: React.CSSProperties = {
    background: 'white', borderRadius: 16, border: '1px solid #f3f4f6',
    padding: '28px 32px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  }

  return (
    <div className="page-container" style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: 0 }}>Mi cuenta</h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>
          Preferencias y seguridad
        </p>
      </div>

      {/* Apariencia */}
      <div style={{ ...card, marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 20px' }}>Apariencia</h2>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 500, color: '#111827', margin: '0 0 3px' }}>Modo oscuro</p>
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Invertir los colores del sistema</p>
          </div>
          <button
            onClick={toggleDarkMode}
            style={{
              width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
              background: darkMode ? '#2d8a54' : '#d1d5db',
              position: 'relative', transition: 'background 0.2s', flexShrink: 0,
            }}
          >
            <span style={{
              position: 'absolute', top: 3, left: darkMode ? 25 : 3,
              width: 20, height: 20, borderRadius: '50%', background: 'white',
              transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </button>
        </div>
      </div>

      {/* Cambiar contraseña */}
      <div style={card}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 20px' }}>Cambiar contraseña</h2>

        <form onSubmit={handleCambiarPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>
              Nueva contraseña
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>
              Repetir contraseña
            </label>
            <input
              type="password"
              required
              value={confirmacion}
              onChange={e => setConfirmacion(e.target.value)}
              placeholder="Repetí la contraseña"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none' }}
            />
          </div>

          {pwEstado !== 'idle' && (
            <p style={{ fontSize: 13, color: pwEstado === 'ok' ? '#15803d' : '#dc2626', margin: 0 }}>
              {pwMensaje}
            </p>
          )}

          <button
            type="submit"
            disabled={pwEstado === 'cargando'}
            style={{
              padding: '10px 0', border: 'none', borderRadius: 8,
              fontSize: 14, fontWeight: 600, color: 'white',
              background: pwEstado === 'cargando' ? '#9ca3af' : '#111827',
              cursor: pwEstado === 'cargando' ? 'not-allowed' : 'pointer',
            }}
          >
            {pwEstado === 'cargando' ? 'Guardando...' : 'Guardar contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}
