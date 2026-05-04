'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function VerificarMfaPage() {
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [reenvioEn, setReenvioEn] = useState(0)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/otp/enviar', { method: 'POST' })
      .then(r => { if (!r.ok) router.replace('/auth/login') })
      .catch(() => router.replace('/auth/login'))
    setReenvioEn(60)
  }, [router])

  useEffect(() => {
    if (reenvioEn <= 0) return
    const id = setInterval(() => setReenvioEn(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [reenvioEn])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading || codigo.length !== 6) return
    setLoading(true)
    setError(null)

    const res = await fetch('/api/auth/otp/verificar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo, proposito: 'login' }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Código incorrecto.')
      setLoading(false)
      return
    }

    router.replace('/dashboard')
  }

  async function reenviar() {
    if (reenvioEn > 0) return
    setError(null)
    await fetch('/api/auth/otp/enviar', { method: 'POST' })
    setReenvioEn(60)
  }

  function formatear(s: number) {
    const m = Math.floor(s / 60), seg = s % 60
    return m > 0 ? `${m}:${seg.toString().padStart(2, '0')} min` : `${s} seg`
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f2ee', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2d8a54" strokeWidth="1.8">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Verificación en dos pasos</h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
            Enviamos un código de 6 dígitos a tu email. Ingresalo para continuar.
          </p>
        </div>

        <div style={{ background: 'white', borderRadius: 20, padding: '32px 28px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label htmlFor="mfa-codigo" style={{ fontSize: 13, fontWeight: 500, color: '#374151', textAlign: 'center' }}>
                Código de verificación
              </label>
              <input
                id="mfa-codigo"
                type="text"
                inputMode="numeric"
                value={codigo}
                onChange={e => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                autoFocus
                autoComplete="one-time-code"
                placeholder="000000"
                style={{
                  width: '100%', padding: '16px 12px',
                  fontSize: 28, fontWeight: 700, letterSpacing: 14,
                  textAlign: 'center', border: '1.5px solid #e5e7eb',
                  borderRadius: 10, outline: 'none', boxSizing: 'border-box',
                  fontVariantNumeric: 'tabular-nums',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = '#2d8a54'; e.target.style.boxShadow = '0 0 0 3px rgba(45,138,84,0.1)' }}
                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || codigo.length !== 6}
              style={{
                width: '100%', background: loading || codigo.length !== 6 ? '#9ca3af' : '#2d8a54',
                color: 'white', padding: '12px 0', borderRadius: 10,
                fontSize: 14, fontWeight: 600, border: 'none',
                cursor: loading || codigo.length !== 6 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 0.2s',
              }}
            >
              {loading ? 'Verificando...' : 'Verificar y continuar'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={reenviar}
                disabled={reenvioEn > 0}
                style={{
                  background: 'none', border: 'none', cursor: reenvioEn > 0 ? 'default' : 'pointer',
                  fontSize: 13, color: reenvioEn > 0 ? '#9ca3af' : '#2d8a54',
                  padding: '4px 8px', fontFamily: 'inherit',
                }}
              >
                {reenvioEn > 0 ? `Reenviar en ${formatear(reenvioEn)}` : 'Reenviar código'}
              </button>
            </div>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#9ca3af', marginTop: 20 }}>
          <a href="/auth/login" style={{ color: '#6b7280', textDecoration: 'none' }}>← Volver al login</a>
        </p>
      </div>
    </div>
  )
}
