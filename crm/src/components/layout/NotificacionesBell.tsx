'use client'

import { useState } from 'react'
import Link from 'next/link'

type Alerta = {
  id: string
  titulo: string
  descripcion: string
  href: string
}

export function NotificacionesBell({ alertas }: { alertas: Alerta[] }) {
  const [abierto, setAbierto] = useState(false)

  return (
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
  )
}