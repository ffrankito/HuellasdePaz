'use client'

import { useState } from 'react'
import { EditarMemorialForm } from './EditarMemorialForm'
import { type Mascota } from '@/db/schema'

export function EditarMemorialInline({ mascota, token }: { mascota: Mascota; token: string }) {
  const [abierto, setAbierto] = useState(false)

  return (
    <div style={{ marginTop: 10 }}>
      <button
        onClick={() => setAbierto(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', padding: '13px', borderRadius: 12, fontSize: 13,
          fontWeight: 500, border: `1px solid ${abierto ? '#d1ead9' : '#e8e4de'}`,
          background: abierto ? '#f0faf5' : 'white',
          color: abierto ? '#2d8a54' : '#374151',
          cursor: 'pointer', boxSizing: 'border-box' as const,
          transition: 'all 0.2s',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Personalizar memorial
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          style={{ marginLeft: 'auto', transition: 'transform 0.2s', transform: abierto ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {abierto && (
        <div style={{
          marginTop: 16,
          padding: '0 2px',
          animation: 'slideDown 0.22s ease',
        }}>
          <EditarMemorialForm
            mascota={mascota}
            token={token}
            onSuccess={() => setAbierto(false)}
          />
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
