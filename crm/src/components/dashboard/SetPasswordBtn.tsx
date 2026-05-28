'use client'

import { useState } from 'react'

export function SetPasswordBtn({ usuarioId, nombre }: { usuarioId: string; nombre: string }) {
  const [abierto, setAbierto] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirmar) { setError('Las contraseñas no coinciden'); return }
    if (password.length < 8) { setError('Mínimo 8 caracteres'); return }

    setLoading(true)
    const res = await fetch(`/api/usuarios/${usuarioId}/password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error ?? 'Error al cambiar contraseña'); return }
    setOk(true)
    setTimeout(() => { setAbierto(false); setOk(false); setPassword(''); setConfirmar('') }, 1500)
  }

  return (
    <>
      <button
        onClick={() => { setAbierto(true); setError(null); setOk(false); setPassword(''); setConfirmar('') }}
        style={{ fontSize: 12, padding: '5px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', color: '#374151', cursor: 'pointer', fontWeight: 500 }}
      >
        Cambiar contraseña
      </button>

      {abierto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) setAbierto(false) }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '32px', width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Cambiar contraseña</h3>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 24px' }}>{nombre}</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Nueva contraseña</label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres" autoFocus
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Confirmar contraseña</label>
                <input
                  type="password" value={confirmar} onChange={e => setConfirmar(e.target.value)}
                  placeholder="Repetí la contraseña"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const }}
                />
              </div>

              {error && (
                <p style={{ fontSize: 13, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px', margin: 0 }}>{error}</p>
              )}
              {ok && (
                <p style={{ fontSize: 13, color: '#126070', background: '#f0f8fa', border: '1px solid #c8e6ea', borderRadius: 8, padding: '8px 12px', margin: 0 }}>✓ Contraseña actualizada</p>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button type="button" onClick={() => setAbierto(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', background: 'white', color: '#374151', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
                  Cancelar
                </button>
                <button type="submit" disabled={loading}
                  style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#111827', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600, opacity: loading ? 0.6 : 1 }}>
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
