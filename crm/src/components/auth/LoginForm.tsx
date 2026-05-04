'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const MAX_INTENTOS = 5
const LOCKOUT_MS = 5 * 60 * 1000 // 5 minutos
const STORAGE_KEY = 'hdp_lf'

type Destino = {
  esEmpleado: boolean
  esCliente: boolean
  tokenPortal: string | null
  nombreCliente: string | null
  mfaEmailActivo?: boolean
}

type LockState = { count: number; lockedUntil: number | null }

function leerLock(): LockState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return { count: 0, lockedUntil: null }
    return JSON.parse(raw) as LockState
  } catch {
    return { count: 0, lockedUntil: null }
  }
}

function guardarLock(s: LockState) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch { /* */ }
}

function limpiarLock() {
  try { sessionStorage.removeItem(STORAGE_KEY) } catch { /* */ }
}

export function LoginForm({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [eleccion, setEleccion] = useState<Destino | null>(null)
  const [segundosRestantes, setSegundosRestantes] = useState(0)
  const [intentos, setIntentos] = useState(0)
  // OTP step
  const [paso, setPaso] = useState<'credenciales' | 'otp'>('credenciales')
  const [destinoPendiente, setDestinoPendiente] = useState<Destino | null>(null)
  const [codigoOtp, setCodigoOtp] = useState('')
  const [loadingOtp, setLoadingOtp] = useState(false)
  const [reenvioEn, setReenvioEn] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  // Inicializar estado de lockout desde sessionStorage
  useEffect(() => {
    const lock = leerLock()
    if (lock.lockedUntil && lock.lockedUntil > Date.now()) {
      setSegundosRestantes(Math.ceil((lock.lockedUntil - Date.now()) / 1000))
      setIntentos(lock.count)
    } else if (lock.lockedUntil && lock.lockedUntil <= Date.now()) {
      // Lockout expiró — resetear
      limpiarLock()
    } else {
      setIntentos(lock.count)
    }
  }, [])

  // Countdown timer
  useEffect(() => {
    if (segundosRestantes <= 0) return
    const id = setInterval(() => {
      setSegundosRestantes(prev => {
        if (prev <= 1) {
          clearInterval(id)
          limpiarLock()
          setIntentos(0)
          setError(null)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [segundosRestantes])

  const registrarFallo = useCallback(() => {
    const lock = leerLock()
    const nuevoCount = lock.count + 1
    if (nuevoCount >= MAX_INTENTOS) {
      const lockedUntil = Date.now() + LOCKOUT_MS
      guardarLock({ count: nuevoCount, lockedUntil })
      setSegundosRestantes(Math.ceil(LOCKOUT_MS / 1000))
      setIntentos(nuevoCount)
    } else {
      guardarLock({ count: nuevoCount, lockedUntil: null })
      setIntentos(nuevoCount)
    }
  }, [])

  const bloqueado = segundosRestantes > 0

  // Countdown reenvío OTP
  useEffect(() => {
    if (reenvioEn <= 0) return
    const id = setInterval(() => setReenvioEn(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [reenvioEn])

  function formatearTiempo(seg: number) {
    const m = Math.floor(seg / 60)
    const s = seg % 60
    return m > 0 ? `${m}:${s.toString().padStart(2, '0')} min` : `${s} seg`
  }

  function redirigir(destino: Destino) {
    if (destino.esEmpleado && destino.esCliente) {
      setEleccion(destino)
      return
    }
    if (destino.esCliente && destino.tokenPortal) {
      router.push(`/portal/${destino.tokenPortal}`)
    } else {
      router.push('/dashboard')
    }
    router.refresh()
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (bloqueado || loading) return

    setLoading(true)
    setError(null)

    const delays = [0, 500, 1000, 2000, 3000]
    const delay = delays[Math.min(intentos, delays.length - 1)]
    if (delay > 0) await new Promise(r => setTimeout(r, delay))

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      registrarFallo()
      setError('Email o contraseña incorrectos.')
      setLoading(false)
      return
    }

    limpiarLock()

    const res = await fetch('/api/auth/destino')
    if (!res.ok) {
      setError('No pudimos verificar tu acceso. Intentá de nuevo.')
      setLoading(false)
      return
    }
    const destino: Destino = await res.json()

    // Si el empleado tiene 2FA activo, ir al paso OTP
    if (destino.esEmpleado && destino.mfaEmailActivo) {
      await fetch('/api/auth/otp/enviar', { method: 'POST' })
      setDestinoPendiente(destino)
      setPaso('otp')
      setReenvioEn(60)
      setLoading(false)
      return
    }

    setLoading(false)
    redirigir(destino)
  }

  async function handleOtpSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (loadingOtp || codigoOtp.length !== 6) return

    setLoadingOtp(true)
    setError(null)

    const res = await fetch('/api/auth/otp/verificar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo: codigoOtp, proposito: 'login' }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Código incorrecto.')
      setLoadingOtp(false)
      return
    }

    setLoadingOtp(false)
    if (destinoPendiente) redirigir(destinoPendiente)
  }

  async function reenviarOtp() {
    if (reenvioEn > 0) return
    setError(null)
    await fetch('/api/auth/otp/enviar', { method: 'POST' })
    setReenvioEn(60)
  }

  function irA(destino: 'dashboard' | 'portal') {
    if (destino === 'portal' && eleccion?.tokenPortal) {
      router.push(`/portal/${eleccion.tokenPortal}`)
    } else {
      router.push('/dashboard')
    }
    router.refresh()
  }

  const t = dark ? {
    label:       'rgba(255,255,255,0.55)',
    inputBg:     'rgba(255,255,255,0.06)',
    inputBorder: 'rgba(255,255,255,0.1)',
    inputColor:  'white',
    inputPh:     'rgba(255,255,255,0.22)',
    icon:        'rgba(255,255,255,0.28)',
    focusBorder: '#2d8a54',
    focusShadow: 'rgba(45,138,84,0.18)',
    eyeColor:    'rgba(255,255,255,0.3)',
    errBg:       'rgba(220,38,38,0.12)',
    errBorder:   'rgba(220,38,38,0.3)',
    errColor:    '#f87171',
  } : {
    label:       '#44403c',
    inputBg:     'white',
    inputBorder: '#e7e5e4',
    inputColor:  '#1c1917',
    inputPh:     '#c4bfbb',
    icon:        '#a8a29e',
    focusBorder: '#2d8a54',
    focusShadow: 'rgba(45,138,84,0.1)',
    eyeColor:    '#a8a29e',
    errBg:       '#fef2f2',
    errBorder:   '#fecaca',
    errColor:    '#dc2626',
  }

  // Pantalla de elección (empleado + cliente)
  if (eleccion) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 4px', textAlign: 'center' }}>
          ¿A dónde querés ingresar?
        </p>
        <button onClick={() => irA('dashboard')} className="lf-dest-btn">
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0faf5', border: '1px solid #d1ead9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2d8a54" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>Sistema CRM</p>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Panel de gestión interno</p>
          </div>
          <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
        <button onClick={() => irA('portal')} className="lf-dest-btn">
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0faf5', border: '1px solid #d1ead9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2d8a54" strokeWidth="2">
              <path d="M12 2C8 2 4 6 4 10c0 5 8 12 8 12s8-7 8-12c0-4-4-8-8-8z"/>
            </svg>
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>Mi portal</p>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
              {eleccion.nombreCliente ? `Hola, ${eleccion.nombreCliente}` : 'Portal de clientes'}
            </p>
          </div>
          <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
        <style>{`
          .lf-dest-btn {
            display: flex; align-items: center; gap: 12px;
            padding: 12px 14px; border-radius: 12px;
            border: 1.5px solid #e5e7eb; background: white;
            cursor: pointer; transition: border-color 0.15s, box-shadow 0.15s;
            font-family: inherit;
          }
          .lf-dest-btn:hover { border-color: #2d8a54; box-shadow: 0 0 0 3px rgba(45,138,84,0.08); }
        `}</style>
      </div>
    )
  }

  if (paso === 'otp') {
    return (
      <>
        <form onSubmit={handleOtpSubmit} className="lf-form">
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: '#f0faf5', border: '1px solid #d1ead9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2d8a54" strokeWidth="1.8">
                <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </div>
            <p style={{ fontSize: 16, fontWeight: 600, color: t.inputColor, margin: '0 0 8px' }}>Verificación en dos pasos</p>
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
              Ingresá el código de 6 dígitos que enviamos a tu email.
            </p>
          </div>

          <div className="lf-field">
            <label htmlFor="lf-otp" className="lf-label" style={{ color: t.label, textAlign: 'center' }}>
              Código de verificación
            </label>
            <input
              id="lf-otp"
              type="text"
              inputMode="numeric"
              value={codigoOtp}
              onChange={e => setCodigoOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              autoFocus
              autoComplete="one-time-code"
              placeholder="000000"
              className="lf-otp-input"
              style={{
                background: t.inputBg,
                borderColor: t.inputBorder,
                color: t.inputColor,
                '--ph': t.inputPh,
                '--focus-border': t.focusBorder,
                '--focus-shadow': t.focusShadow,
              } as React.CSSProperties}
            />
          </div>

          {error && (
            <div className="lf-error" style={{ background: t.errBg, borderColor: t.errBorder, color: t.errColor }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <button type="submit" disabled={loadingOtp || codigoOtp.length !== 6} className="lf-btn">
            {loadingOtp ? (
              <>
                <svg className="lf-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="40 60"/>
                </svg>
                Verificando...
              </>
            ) : 'Verificar código'}
          </button>

          <div style={{ textAlign: 'center' }}>
            <button type="button" onClick={reenviarOtp} disabled={reenvioEn > 0} className="lf-reenvio-btn">
              {reenvioEn > 0 ? `Reenviar en ${formatearTiempo(reenvioEn)}` : 'Reenviar código'}
            </button>
          </div>
        </form>

        <style>{`
          .lf-form { display: flex; flex-direction: column; gap: 18px; }
          .lf-field { display: flex; flex-direction: column; gap: 7px; }
          .lf-label { font-size: 13px; font-weight: 500; }

          .lf-otp-input {
            width: 100%;
            padding: 16px 12px;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: 14px;
            text-align: center;
            border: 1.5px solid;
            border-radius: 10px;
            outline: none;
            box-sizing: border-box;
            transition: border-color 0.2s, box-shadow 0.2s;
            font-variant-numeric: tabular-nums;
          }
          .lf-otp-input::placeholder { color: var(--ph); letter-spacing: 8px; }
          .lf-otp-input:focus {
            border-color: var(--focus-border) !important;
            box-shadow: 0 0 0 3px var(--focus-shadow);
          }

          .lf-error {
            display: flex; align-items: center; gap: 8px;
            border: 1px solid; border-radius: 10px;
            padding: 10px 14px; font-size: 13px;
          }

          .lf-btn {
            width: 100%; background: #2d8a54; color: white;
            padding: 12px 0; border-radius: 10px; font-size: 14px; font-weight: 600;
            border: none; cursor: pointer;
            transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
            display: flex; align-items: center; justify-content: center; gap: 8px;
            font-family: inherit; margin-top: 4px; letter-spacing: 0.01em;
          }
          .lf-btn:hover:not(:disabled) { background: #1a5233; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(45,138,84,0.3); }
          .lf-btn:disabled { opacity: 0.65; cursor: not-allowed; }

          .lf-reenvio-btn {
            background: none; border: none; cursor: pointer;
            font-size: 13px; color: #2d8a54; padding: 4px 8px;
            font-family: inherit; transition: opacity 0.15s;
          }
          .lf-reenvio-btn:disabled { color: #9ca3af; cursor: default; }
          .lf-reenvio-btn:not(:disabled):hover { text-decoration: underline; }

          .lf-spinner { animation: lf-spin 0.8s linear infinite; }
          @keyframes lf-spin { to { transform: rotate(360deg) } }
        `}</style>
      </>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="lf-form">

        <div className="lf-field">
          <label htmlFor="lf-email" className="lf-label" style={{ color: t.label }}>Email</label>
          <div className="lf-input-wrap">
            <svg className="lf-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.icon} strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            <input
              id="lf-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={bloqueado}
              autoComplete="email"
              placeholder="tu@email.com"
              className="lf-input"
              style={{
                background: t.inputBg,
                borderColor: t.inputBorder,
                color: t.inputColor,
                '--ph': t.inputPh,
                '--focus-border': t.focusBorder,
                '--focus-shadow': t.focusShadow,
              } as React.CSSProperties}
            />
          </div>
        </div>

        <div className="lf-field">
          <label htmlFor="lf-password" className="lf-label" style={{ color: t.label }}>Contraseña</label>
          <div className="lf-input-wrap">
            <svg className="lf-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.icon} strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input
              id="lf-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={bloqueado}
              autoComplete="current-password"
              placeholder="••••••••"
              className="lf-input"
              style={{
                background: t.inputBg,
                borderColor: t.inputBorder,
                color: t.inputColor,
                '--ph': t.inputPh,
                '--focus-border': t.focusBorder,
                '--focus-shadow': t.focusShadow,
              } as React.CSSProperties}
            />
            <button
              type="button"
              className="lf-eye"
              onClick={() => setShowPassword(v => !v)}
              tabIndex={-1}
              style={{ color: t.eyeColor }}
            >
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

        {/* Advertencia de intentos restantes */}
        {intentos > 0 && intentos < MAX_INTENTOS && !bloqueado && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '9px 13px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" style={{ flexShrink: 0 }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span style={{ fontSize: 12, color: '#92400e' }}>
              {MAX_INTENTOS - intentos} intento{MAX_INTENTOS - intentos !== 1 ? 's' : ''} restante{MAX_INTENTOS - intentos !== 1 ? 's' : ''} antes del bloqueo
            </span>
          </div>
        )}

        {/* Lockout activo */}
        {bloqueado && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#dc2626', margin: '0 0 4px' }}>Acceso bloqueado temporalmente</p>
            <p style={{ fontSize: 12, color: '#ef4444', margin: '0 0 8px' }}>Demasiados intentos fallidos.</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#dc2626', margin: 0, fontVariantNumeric: 'tabular-nums' }}>
              {formatearTiempo(segundosRestantes)}
            </p>
          </div>
        )}

        {/* Error genérico */}
        {error && !bloqueado && (
          <div className="lf-error" style={{ background: t.errBg, borderColor: t.errBorder, color: t.errColor }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading || bloqueado} className="lf-btn">
          {loading ? (
            <>
              <svg className="lf-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="40 60"/>
              </svg>
              Ingresando...
            </>
          ) : bloqueado ? 'Bloqueado' : 'Ingresar'}
        </button>

      </form>

      <style>{`
        .lf-form { display: flex; flex-direction: column; gap: 18px; }

        .lf-field { display: flex; flex-direction: column; gap: 7px; }
        .lf-label { font-size: 13px; font-weight: 500; }

        .lf-input-wrap { position: relative; display: flex; align-items: center; }
        .lf-icon { position: absolute; left: 13px; pointer-events: none; flex-shrink: 0; }

        .lf-input {
          width: 100%;
          padding: 11px 42px 11px 38px;
          font-size: 14px;
          border: 1.5px solid;
          border-radius: 10px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: inherit;
        }
        .lf-input::placeholder { color: var(--ph); }
        .lf-input:focus {
          border-color: var(--focus-border) !important;
          box-shadow: 0 0 0 3px var(--focus-shadow);
        }
        .lf-input:disabled { opacity: 0.5; cursor: not-allowed; }

        .lf-eye {
          position: absolute; right: 12px;
          background: none; border: none; cursor: pointer;
          padding: 2px; display: flex; align-items: center;
          transition: color 0.15s;
        }
        .lf-eye:hover { opacity: 0.8; }

        .lf-error {
          display: flex; align-items: center; gap: 8px;
          border: 1px solid; border-radius: 10px;
          padding: 10px 14px; font-size: 13px;
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
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          font-family: inherit;
          margin-top: 4px;
          letter-spacing: 0.01em;
        }
        .lf-btn:hover:not(:disabled) {
          background: #1a5233;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(45,138,84,0.3);
        }
        .lf-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .lf-spinner { animation: lf-spin 0.8s linear infinite; }
        @keyframes lf-spin { to { transform: rotate(360deg) } }
      `}</style>
    </>
  )
}
