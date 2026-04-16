'use client'

import { useState } from 'react'

export function ExportarReporteButton() {
  const [loading, setLoading] = useState(false)

  async function exportarPDF() {
    setLoading(true)
    const res = await fetch('/api/reportes/pdf')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte-huellas-de-paz-${new Date().toISOString().split('T')[0]}.pdf`
    a.click()
    URL.revokeObjectURL(url)
    setLoading(false)
  }

  return (
    <button
      onClick={exportarPDF}
      disabled={loading}
      style={{
        padding: '10px 20px',
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 500,
        border: '1px solid #e5e7eb',
        background: 'white',
        color: '#374151',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {loading ? 'Generando PDF...' : '↓ Exportar PDF'}
    </button>
  )
}