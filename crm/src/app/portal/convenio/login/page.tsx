'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const [vista, setVista] = useState<'login' | 'recuperar' | 'recuperarOk'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email o contraseña incorrectos.')
      setLoading(false)
      return
    }
    const res = await fetch('/api/portal/convenio/mi-token')
    if (res.ok) {
      const data = await res.json()
      router.push(`/portal/convenio/${data.token}`)
    } else {
      setError('No encontramos tu portal. Contactá a Huellas de Paz.')
      setLoading(false)
    }
  }

  async function handleRecuperar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const redirectTo = `${window.location.origin}/portal/convenio/activar`
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    setLoading(false)
    if (error) { setError('No encontramos una cuenta con ese email.'); return }
    setVista('recuperarOk')
  }

  const inputStyle: React.CSSProperties = {
    display: 'block', width: '100%', padding: '13px 16px', fontSize: 15,
    color: '#111827', background: '#f9fafb', border: '1.5px solid #e5e7eb',
    borderRadius: 12, outline: 'none', boxSizing: 'border-box',
    WebkitAppearance: 'none', transition: 'border-color 0.15s', fontFamily: 'inherit',
  }

  const btnStyle: React.CSSProperties = {
    width: '100%', padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 600,
    border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
    background: loading ? '#e5e7eb' : '#2d8a54',
    color: loading ? '#9ca3af' : 'white',
    transition: 'background 0.15s',
  }

  return (
    <main style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f0faf5', padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
    }}>
      <div style={{
        background: 'white', borderRadius: 28, padding: '48px 44px 40px',
        width: '100%', maxWidth: 420, position: 'relative',
        boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 20px 60px rgba(45,138,84,0.1), 0 0 0 1px rgba(45,138,84,0.08)',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 48, right: 48, height: 3, background: 'linear-gradient(90deg, transparent, #2d8a54, transparent)', borderRadius: '0 0 4px 4px' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #e8f5ed 0%, #d1ead9 100%)', border: '1px solid rgba(45,138,84,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8 2 4 6 4 10c0 5 8 12 8 12s8-7 8-12c0-4-4-8-8-8z" fill="#2d8a54"/>
              <circle cx="9" cy="7" r="1.5" fill="#aadfc2"/><circle cx="15" cy="7" r="1.5" fill="#aadfc2"/>
              <circle cx="7" cy="11" r="1.2" fill="#aadfc2"/><circle cx="17" cy="11" r="1.2" fill="#aadfc2"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Huellas de Paz</p>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Portal de socios</p>
          </div>
        </div>

        {vista === 'login' && (
          <>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Ingresá al portal</h1>
              <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Accedé para derivar clientes y ver el estado de tus leads.</p>
            </div>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" placeholder="tu@email.com" style={inputStyle} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Contraseña</label>
                  <button type="button" onClick={() => { setVista('recuperar'); setError(null) }} style={{ fontSize: 12, color: '#2d8a54', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" placeholder="••••••••" style={inputStyle} />
              </div>
              {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px' }}><p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p></div>}
              <button type="submit" disabled={loading} style={{ ...btnStyle, marginTop: 4 }}>{loading ? 'Ingresando…' : 'Ingresar'}</button>
            </form>
            <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 20, lineHeight: 1.5 }}>
              ¿Primera vez? Revisá tu email — te enviamos<br />un link para crear tu contraseña.
            </p>
          </>
        )}

        {vista === 'recuperar' && (
          <>
            <button onClick={() => { setVista('login'); setError(null) }} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 20 }}>
              ← Volver
            </button>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Recuperar acceso</h1>
              <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Te enviamos un link para crear una nueva contraseña.</p>
            </div>
            <form onSubmit={handleRecuperar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" placeholder="tu@email.com" style={inputStyle} />
              </div>
              {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px' }}><p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p></div>}
              <button type="submit" disabled={loading} style={btnStyle}>{loading ? 'Enviando…' : 'Enviar link de recupero'}</button>
            </form>
          </>
        )}

        {vista === 'recuperarOk' && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
            <h2 style={{ fontSize: 19, fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>Revisá tu correo</h2>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 24px', lineHeight: 1.6 }}>Te enviamos un link para crear tu nueva contraseña.</p>
            <button onClick={() => { setVista('login'); setError(null) }} style={{ padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 500, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', cursor: 'pointer' }}>
              Volver al login
            </button>
          </div>
        )}

        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: '#d1d5db', margin: 0 }}>© 2025 Huellas de Paz · Rosario, Argentina</p>
        </div>
      </div>
    </main>
  )
}

export default function ConvenioLoginPage() {
  return <Suspense><LoginForm /></Suspense>
}
