'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Vista = 'login' | 'recuperar' | 'recuperarOk'

const PAWS = [
  { top: '5%',  left: '4%',   size: 56, opacity: 0.07, rotate: -22, delay: '0s',   dur: '9s'  },
  { top: '10%', left: '80%',  size: 32, opacity: 0.09, rotate: 38,  delay: '1.8s', dur: '11s' },
  { top: '38%', left: '2%',   size: 22, opacity: 0.06, rotate: 12,  delay: '3.2s', dur: '8s'  },
  { top: '50%', left: '90%',  size: 46, opacity: 0.06, rotate: -35, delay: '0.6s', dur: '12s' },
  { top: '65%', left: '11%',  size: 28, opacity: 0.08, rotate: 55,  delay: '2.4s', dur: '10s' },
  { top: '76%', left: '84%',  size: 18, opacity: 0.09, rotate: -8,  delay: '1.1s', dur: '7s'  },
  { top: '86%', left: '40%',  size: 38, opacity: 0.06, rotate: 28,  delay: '2.9s', dur: '13s' },
  { top: '22%', left: '54%',  size: 16, opacity: 0.05, rotate: -48, delay: '0.4s', dur: '9s'  },
  { top: '92%', left: '66%',  size: 24, opacity: 0.07, rotate: 18,  delay: '3.6s', dur: '11s' },
]

function LoginForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [vista, setVista] = useState<Vista>('login')
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
      setError('Email o contraseña incorrectos. Revisá los datos e intentá de nuevo.')
      setLoading(false)
      return
    }
    if (token) {
      router.push(`/portal/${token}`)
      return
    }
    // Sin token en la URL — buscamos el token del cliente por su auth_user_id
    const res = await fetch('/api/portal/mi-token')
    if (res.ok) {
      const data = await res.json()
      router.push(`/portal/${data.token}`)
    } else {
      setError('No encontramos tu portal. Contactá a Huellas de Paz.')
      setLoading(false)
    }
  }

  async function handleRecuperar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const redirectTo = `${window.location.origin}/portal/activar${token ? `?token=${token}` : ''}`
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    setLoading(false)
    if (error) {
      setError('No encontramos una cuenta con ese email.')
      return
    }
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
    background: loading ? '#e5e7eb' : '#111827',
    color: loading ? '#9ca3af' : 'white',
    transition: 'background 0.15s',
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f0faf5',
      position: 'relative', overflow: 'hidden',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
    }}>

      {/* Glows */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 600, background: 'radial-gradient(ellipse, rgba(45,138,84,0.1) 0%, transparent 65%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-5%', left: '10%', width: 500, height: 500, background: 'radial-gradient(ellipse, rgba(45,138,84,0.07) 0%, transparent 60%)', borderRadius: '50%' }} />
      </div>

      {/* Patas flotantes */}
      {PAWS.map((p, i) => (
        <svg key={i} width={p.size} height={p.size} viewBox="0 0 24 24" fill="#2d8a54" aria-hidden="true"
          style={{ position: 'fixed', top: p.top, left: p.left, opacity: p.opacity, transform: `rotate(${p.rotate}deg)`, animation: `lp-float ${p.dur} ease-in-out ${p.delay} infinite`, pointerEvents: 'none', zIndex: 0 }}
        >
          <path d="M12 2C8 2 4 6 4 10c0 5 8 12 8 12s8-7 8-12c0-4-4-8-8-8z"/>
          <circle cx="9"  cy="7"  r="1.5"/>
          <circle cx="15" cy="7"  r="1.5"/>
          <circle cx="7"  cy="11" r="1.2"/>
          <circle cx="17" cy="11" r="1.2"/>
        </svg>
      ))}

      {/* Card */}
      <div style={{
        background: 'white', borderRadius: 28, padding: '48px 44px 40px',
        width: '100%', maxWidth: 420, position: 'relative', zIndex: 1,
        boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 20px 60px rgba(45,138,84,0.1), 0 0 0 1px rgba(45,138,84,0.08)',
      }}>

        <div style={{ position: 'absolute', top: 0, left: 48, right: 48, height: 3, background: 'linear-gradient(90deg, transparent, #2d8a54, transparent)', borderRadius: '0 0 4px 4px' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #e8f5ed 0%, #d1ead9 100%)', border: '1px solid rgba(45,138,84,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8 2 4 6 4 10c0 5 8 12 8 12s8-7 8-12c0-4-4-8-8-8z" fill="#2d8a54"/>
              <circle cx="9"  cy="7"  r="1.5" fill="#aadfc2"/>
              <circle cx="15" cy="7"  r="1.5" fill="#aadfc2"/>
              <circle cx="7"  cy="11" r="1.2" fill="#aadfc2"/>
              <circle cx="17" cy="11" r="1.2" fill="#aadfc2"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0, letterSpacing: '-0.01em' }}>Huellas de Paz</p>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Portal de clientes</p>
          </div>
        </div>

        {/* Vista: login */}
        {vista === 'login' && (
          <>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Ingresá a tu portal
              </h1>
              <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
                Accedé a tus servicios, planes y memorial.
              </p>
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

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading} style={{ ...btnStyle, marginTop: 4 }}>
                {loading ? 'Ingresando…' : 'Ingresar'}
              </button>
            </form>

            <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 20, lineHeight: 1.5 }}>
              ¿Primera vez? Revisá tu email — te enviamos<br />un link para crear tu contraseña.
            </p>
          </>
        )}

        {/* Vista: recuperar */}
        {vista === 'recuperar' && (
          <>
            <button onClick={() => { setVista('login'); setError(null) }} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 20 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Volver
            </button>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Recuperar acceso</h1>
              <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Te enviamos un link para crear una nueva contraseña.</p>
            </div>
            <form onSubmit={handleRecuperar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" placeholder="tu@email.com" style={inputStyle} />
              </div>
              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
                </div>
              )}
              <button type="submit" disabled={loading} style={btnStyle}>
                {loading ? 'Enviando…' : 'Enviar link de recupero'}
              </button>
            </form>
          </>
        )}

        {/* Vista: email enviado */}
        {vista === 'recuperarOk' && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
            <h2 style={{ fontSize: 19, fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>Revisá tu correo</h2>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 24px', lineHeight: 1.6 }}>
              Te enviamos un link para crear tu nueva contraseña. Mirá también la carpeta de spam.
            </p>
            <button onClick={() => { setVista('login'); setError(null) }} style={{ padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 500, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', cursor: 'pointer' }}>
              Volver al login
            </button>
          </div>
        )}

        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: '#d1d5db', margin: 0, letterSpacing: '0.04em' }}>
            © 2025 Huellas de Paz · Rosario, Argentina
          </p>
        </div>
      </div>

      <style>{`
        @keyframes lp-float {
          0%, 100% { transform: translateY(0px) rotate(var(--r, 0deg)); }
          50%       { transform: translateY(-14px) rotate(var(--r, 0deg)); }
        }
      `}</style>
    </main>
  )
}

export default function PortalLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
