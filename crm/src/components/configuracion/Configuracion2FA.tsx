'use client'

import { useState, useEffect } from 'react'

type Paso = 'idle' | 'otp-activar' | 'otp-desactivar'

export function Configuracion2FA() {
  const [activo, setActivo] = useState<boolean | null>(null)
  const [paso, setPaso] = useState<Paso>('idle')
  const [codigo, setCodigo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reenvioEn, setReenvioEn] = useState(0)
  const [exito, setExito] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/me')
      .then(r => r.json())
      .then(d => setActivo(d.mfaEmailActivo ?? false))
  }, [])

  useEffect(() => {
    if (reenvioEn <= 0) return
    const id = setInterval(() => setReenvioEn(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [reenvioEn])

  async function iniciarCambio(tipo: 'activar' | 'desactivar') {
    setError(null)
    setExito(null)
    setCodigo('')
    await fetch('/api/auth/otp/enviar', { method: 'POST' })
    setPaso(tipo === 'activar' ? 'otp-activar' : 'otp-desactivar')
    setReenvioEn(60)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading || codigo.length !== 6) return
    setLoading(true)
    setError(null)

    const proposito = paso === 'otp-activar' ? 'activar' : 'desactivar'
    const res = await fetch('/api/auth/otp/verificar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo, proposito }),
    })

    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? 'Código incorrecto.')
      setLoading(false)
      return
    }

    const nuevoEstado = proposito === 'activar'
    setActivo(nuevoEstado)
    setPaso('idle')
    setCodigo('')
    setLoading(false)
    setExito(nuevoEstado ? '2FA activado correctamente.' : '2FA desactivado.')
    setTimeout(() => setExito(null), 4000)
  }

  async function reenviar() {
    if (reenvioEn > 0) return
    setError(null)
    await fetch('/api/auth/otp/enviar', { method: 'POST' })
    setReenvioEn(60)
  }

  function cancelar() {
    setPaso('idle')
    setCodigo('')
    setError(null)
  }

  function formatear(s: number) {
    const m = Math.floor(s / 60), seg = s % 60
    return m > 0 ? `${m}:${seg.toString().padStart(2, '0')} min` : `${s} seg`
  }

  const input: React.CSSProperties = {
    width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb',
    borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box',
  }

  if (activo === null) return null

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 500, color: '#111827', margin: '0 0 3px' }}>
            Verificación en dos pasos (2FA)
          </p>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
            {activo
              ? 'Cada vez que inicies sesión se enviará un código a tu email.'
              : 'Agregá una capa extra de seguridad a tu cuenta.'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{
            fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
            background: activo ? '#f0fdf4' : '#f9fafb',
            color: activo ? '#15803d' : '#6b7280',
            border: `1px solid ${activo ? '#bbf7d0' : '#e5e7eb'}`,
          }}>
            {activo ? 'Activo' : 'Inactivo'}
          </span>
          {paso === 'idle' && (
            <button
              onClick={() => iniciarCambio(activo ? 'desactivar' : 'activar')}
              style={{
                padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer',
                color: '#374151', transition: 'border-color 0.15s',
              }}
            >
              {activo ? 'Desactivar' : 'Activar'}
            </button>
          )}
        </div>
      </div>

      {exito && (
        <div style={{ marginTop: 14, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#15803d' }}>
          {exito}
        </div>
      )}

      {paso !== 'idle' && (
        <div style={{ marginTop: 20, padding: '20px', background: '#f9fafb', borderRadius: 12, border: '1px solid #f3f4f6' }}>
          <p style={{ fontSize: 13, color: '#374151', margin: '0 0 14px', lineHeight: 1.5 }}>
            {paso === 'otp-activar'
              ? 'Ingresá el código que enviamos a tu email para confirmar la activación.'
              : 'Por seguridad, confirmá la desactivación con el código que enviamos a tu email.'}
          </p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="text"
              inputMode="numeric"
              value={codigo}
              onChange={e => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              autoFocus
              autoComplete="one-time-code"
              placeholder="Código de 6 dígitos"
              style={input}
            />

            {error && (
              <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="submit"
                disabled={loading || codigo.length !== 6}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  border: 'none', cursor: loading || codigo.length !== 6 ? 'not-allowed' : 'pointer',
                  background: loading || codigo.length !== 6 ? '#d1d5db' : paso === 'otp-desactivar' ? '#dc2626' : '#2d8a54',
                  color: 'white',
                }}
              >
                {loading ? 'Verificando...' : paso === 'otp-activar' ? 'Confirmar activación' : 'Confirmar desactivación'}
              </button>
              <button
                type="button"
                onClick={cancelar}
                style={{
                  padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                  border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', color: '#374151',
                }}
              >
                Cancelar
              </button>
            </div>

            <div>
              <button
                type="button"
                onClick={reenviar}
                disabled={reenvioEn > 0}
                style={{
                  background: 'none', border: 'none', cursor: reenvioEn > 0 ? 'default' : 'pointer',
                  fontSize: 12, color: reenvioEn > 0 ? '#9ca3af' : '#6b7280', padding: 0, fontFamily: 'inherit',
                }}
              >
                {reenvioEn > 0 ? `Reenviar en ${formatear(reenvioEn)}` : 'Reenviar código'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
