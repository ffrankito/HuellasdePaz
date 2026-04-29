'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function ActivarForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [listo, setListo] = useState(false)
  const [nombre, setNombre] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.user_metadata?.nombre) setNombre(data.user.user_metadata.nombre)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmar) { setError('Las contraseñas no coinciden.'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError('El link de activación expiró. Pedile al equipo de Huellas de Paz que te reenvíe la invitación.')
      setLoading(false)
      return
    }
    setListo(true)
    const destino = await (async () => {
      if (token) return `/portal/convenio/${token}`
      const res = await fetch('/api/portal/convenio/mi-token')
      if (res.ok) { const data = await res.json(); return `/portal/convenio/${data.token}` }
      return '/portal/convenio/login'
    })()
    setTimeout(() => router.push(destino), 2200)
  }

  const inputStyle: React.CSSProperties = {
    display: 'block', width: '100%', padding: '13px 16px', fontSize: 15,
    color: '#111827', background: '#f9fafb', border: '1.5px solid #e5e7eb',
    borderRadius: 12, outline: 'none', boxSizing: 'border-box',
    WebkitAppearance: 'none', transition: 'border-color 0.15s',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>
      <div style={{ background: 'linear-gradient(160deg, #1a2e1f 0%, #111827 60%)', padding: '48px 24px 56px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.4, background: 'radial-gradient(ellipse at 50% 0%, rgba(45,138,84,0.35) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 42, marginBottom: 14, lineHeight: 1 }}>🐾</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white', margin: '0 0 6px' }}>Huellas de Paz</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Portal de socios</p>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '0 20px 40px' }}>
        <div style={{ width: '100%', maxWidth: 400, background: 'white', borderRadius: 24, padding: '32px 28px', marginTop: -24, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>

          {listo ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: 52, marginBottom: 16, lineHeight: 1 }}>🎉</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>¡Todo listo{nombre ? `, ${nombre}` : ''}!</h2>
              <p style={{ fontSize: 14, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>Tu acceso está activo. En un momento te llevamos al portal.</p>
              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: 36, height: 4, background: '#f3f4f6', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#2d8a54', borderRadius: 2, animation: 'progress 2.2s linear forwards' }} />
                </div>
              </div>
              <style>{`@keyframes progress { from { width: 0 } to { width: 100% } }`}</style>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>
                  {nombre ? `Bienvenido/a, ${nombre}` : 'Activá tu acceso'}
                </h2>
                <p style={{ fontSize: 14, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
                  Creá tu contraseña para acceder al portal siempre que quieras.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Contraseña</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" placeholder="Mínimo 6 caracteres" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Confirmá la contraseña</label>
                  <input type="password" value={confirmar} onChange={e => setConfirmar(e.target.value)} required autoComplete="new-password" placeholder="Repetí la contraseña" style={inputStyle} />
                </div>

                {password.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                      {[1, 2, 3].map(n => (
                        <div key={n} style={{ flex: 1, height: 3, borderRadius: 2, background: password.length >= n * 3 ? n === 1 ? '#ef4444' : n === 2 ? '#f59e0b' : '#2d8a54' : '#f3f4f6', transition: 'background 0.2s' }} />
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>
                      {password.length < 3 ? 'Muy corta' : password.length < 6 ? 'Casi…' : password.length < 10 ? 'Buena' : 'Excelente'}
                    </p>
                  </div>
                )}

                {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px' }}><p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p></div>}

                <button type="submit" disabled={loading} style={{ marginTop: 4, padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 600, border: 'none', background: loading ? '#e5e7eb' : 'linear-gradient(135deg, #2d8a54 0%, #1a5233 100%)', color: loading ? '#9ca3af' : 'white', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 14px rgba(45,138,84,0.3)', transition: 'all 0.15s' }}>
                  {loading ? 'Activando…' : 'Crear contraseña y entrar'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ConvenioActivarPage() {
  return <Suspense><ActivarForm /></Suspense>
}
