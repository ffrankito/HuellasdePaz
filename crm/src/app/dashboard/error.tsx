'use client'

import { useEffect } from 'react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  const isTimeout = error.message?.includes('statement timeout') || error.message?.includes('timeout')

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 40 }}>
      <div style={{ maxWidth: 420, textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <h2 style={{ fontSize: 17, fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>
          {isTimeout ? 'La base de datos tardó demasiado' : 'Algo salió mal'}
        </h2>
        <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 24px', lineHeight: 1.6 }}>
          {isTimeout
            ? 'La conexión a la base de datos superó el tiempo de espera. Reintentá en unos segundos.'
            : 'Ocurrió un error inesperado. Podés intentar recargar la página.'}
        </p>
        <button
          onClick={reset}
          style={{ padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, background: '#2d8a54', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}
