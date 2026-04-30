'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [estado, setEstado] = useState<'idle' | 'cargando' | 'ok' | 'error'>('idle')
  const [mensaje, setMensaje] = useState('')
  const [sesionLista, setSesionLista] = useState(false)

  useEffect(() => {
    // Supabase pasa el token en el hash o como query param según la config
    const supabase = createClient()
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSesionLista(true)
      }
    })
    // Si viene con code en query params (PKCE flow)
    const code = searchParams.get('code')
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (!error) setSesionLista(true)
      })
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmacion) {
      setMensaje('Las contraseñas no coinciden')
      setEstado('error')
      return
    }
    if (password.length < 8) {
      setMensaje('La contraseña debe tener al menos 8 caracteres')
      setEstado('error')
      return
    }
    setEstado('cargando')
    setMensaje('')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setMensaje(error.message)
      setEstado('error')
      return
    }
    setEstado('ok')
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f5f2ee',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{ background: 'white', borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: '#f0fdf4', border: '1px solid #d1ead9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2d8a54" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>Nueva contraseña</h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Ingresá tu nueva contraseña para continuar</p>
        </div>

        {estado === 'ok' ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#15803d', margin: '0 0 6px' }}>¡Contraseña actualizada!</p>
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Redirigiendo al dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none' }}
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
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none' }}
              />
            </div>

            {estado === 'error' && (
              <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{mensaje}</p>
            )}

            <button
              type="submit"
              disabled={estado === 'cargando' || !sesionLista}
              style={{
                padding: '11px 0', border: 'none', borderRadius: 8,
                fontSize: 14, fontWeight: 600, color: 'white',
                background: estado === 'cargando' || !sesionLista ? '#9ca3af' : '#111827',
                cursor: estado === 'cargando' || !sesionLista ? 'not-allowed' : 'pointer',
                marginTop: 4,
              }}
            >
              {estado === 'cargando' ? 'Guardando...' : !sesionLista ? 'Verificando enlace...' : 'Guardar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
