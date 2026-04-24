'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="lf-form">

        <div className="lf-field">
          <label htmlFor="lf-email" className="lf-label">Email</label>
          <div className="lf-input-wrap">
            <svg className="lf-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            <input
              id="lf-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="nombre@huellasdepaz.com"
              className="lf-input"
            />
          </div>
        </div>

        <div className="lf-field">
          <label htmlFor="lf-password" className="lf-label">Contraseña</label>
          <div className="lf-input-wrap">
            <svg className="lf-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input
              id="lf-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="lf-input"
            />
            <button type="button" className="lf-eye" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="lf-error">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="lf-btn">
          {loading ? (
            <>
              <svg className="lf-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="40 60"/>
              </svg>
              Ingresando...
            </>
          ) : 'Ingresar'}
        </button>

      </form>

      <style>{`
        .lf-form { display: flex; flex-direction: column; gap: 18px; }

        .lf-field { display: flex; flex-direction: column; gap: 7px; }
        .lf-label { font-size: 13px; font-weight: 500; color: #44403c; }

        .lf-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .lf-icon {
          position: absolute;
          left: 13px;
          color: #a8a29e;
          pointer-events: none;
          flex-shrink: 0;
        }
        .lf-input {
          width: 100%;
          padding: 11px 42px 11px 38px;
          font-size: 14px;
          color: #1c1917;
          background: white;
          border: 1.5px solid #e7e5e4;
          border-radius: 10px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: inherit;
        }
        .lf-input::placeholder { color: #c4bfbb; }
        .lf-input:focus {
          border-color: #2d8a54;
          box-shadow: 0 0 0 3px rgba(45,138,84,0.1);
        }

        .lf-eye {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          cursor: pointer;
          color: #a8a29e;
          padding: 2px;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }
        .lf-eye:hover { color: #57534e; }

        .lf-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          color: #dc2626;
        }

        .lf-btn {
          width: 100%;
          background: #2d8a54;
          color: white;
          padding: 12px 0;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: inherit;
          margin-top: 4px;
          letter-spacing: 0.01em;
        }
        .lf-btn:hover:not(:disabled) { background: #1a5233; transform: translateY(-1px); }
        .lf-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .lf-spinner { animation: lf-spin 0.8s linear infinite; }
        @keyframes lf-spin { to { transform: rotate(360deg) } }
      `}</style>
    </>
  )
}
