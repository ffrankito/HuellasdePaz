'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Alerta = {
  id: string
  titulo: string
  descripcion: string
  href: string
}

export function NotificacionesBell({ alertas }: { alertas: Alerta[] }) {
  const [abierto, setAbierto] = useState(false)
  const router = useRouter()

  const cerrarSesion = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

      {/* Campanita */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setAbierto(!abierto)}
          style={{
            position: 'relative',
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '1px solid #f3f4f6',
            background: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
          }}
        >
          🔔
          {alertas.length > 0 && (
            <span style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: '#dc2626',
              color: 'white',
              fontSize: 9,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {alertas.length}
            </span>
          )}
        </button>

        {abierto && (
          <>
            <div
              onClick={() => setAbierto(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 40 }}
            />
            <div style={{
              position: 'absolute',
              top: 44,
              right: 0,
              zIndex: 50,
              background: 'white',
              border: '1px solid #f3f4f6',
              borderRadius: 14,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              width: 320,
              overflow: 'hidden',
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>Notificaciones</p>
              </div>

              {alertas.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Sin alertas pendientes</p>
                </div>
              ) : (
                <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                  {alertas.map(a => (
                    <Link
                      key={a.id}
                      href={a.href}
                      onClick={() => setAbierto(false)}
                      style={{ textDecoration: 'none' }}
                    >
                      <div style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #f9fafb',
                        display: 'flex',
                        gap: 12,
                        alignItems: 'flex-start',
                        cursor: 'pointer',
                      }}>
                        <div style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#dc2626',
                          marginTop: 4,
                          flexShrink: 0,
                        }} />
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 500, color: '#111827', margin: '0 0 2px' }}>{a.titulo}</p>
                          <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{a.descripcion}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

{/* Botón cerrar sesión — ícono SVG rojo */}
<button
  onClick={cerrarSesion}
  title="Cerrar sesión"
  style={{
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#dc2626',
    transition: 'background 0.15s',
  }}
  onMouseEnter={e => (e.currentTarget.style.background = '#fee2e2')}
  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
</button>
    </div>
  )
}