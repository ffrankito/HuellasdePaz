'use client'

import { useState } from 'react'

export function GuardarLinkCard({ portalUrl, dark = false }: { portalUrl: string; dark?: boolean }) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    await navigator.clipboard.writeText(portalUrl)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const waText = encodeURIComponent(`Mi portal de Huellas de Paz: ${portalUrl}`)

  const bg = dark ? 'rgba(255,255,255,0.05)' : 'white'
  const border = dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #f3f4f6'
  const titleColor = dark ? 'rgba(255,255,255,0.8)' : '#111827'
  const textColor = dark ? 'rgba(255,255,255,0.4)' : '#6b7280'
  const btnBg = dark ? 'rgba(255,255,255,0.07)' : 'white'
  const btnBorder = dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb'
  const btnColor = dark ? 'rgba(255,255,255,0.6)' : '#374151'
  const copiadoBg = dark ? 'rgba(45,138,84,0.2)' : '#f0fdf4'
  const copiadoColor = dark ? '#4ade80' : '#15803d'

  return (
    <div style={{
      background: bg, borderRadius: 18,
      border,
      padding: '18px',
      marginBottom: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 18, lineHeight: 1, marginTop: 1 }}>🔗</div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: titleColor, margin: '0 0 3px' }}>
            Guardá el link de tu portal
          </p>
          <p style={{ fontSize: 12, color: textColor, margin: 0, lineHeight: 1.5 }}>
            Este link es tu acceso personal. Guardalo en favoritos o enviátelo por WhatsApp.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={copiar}
          style={{
            flex: 1, padding: '10px 12px', borderRadius: 10, fontSize: 12, fontWeight: 500,
            border: copiado ? (dark ? '1px solid rgba(74,222,128,0.3)' : '1px solid #bbf7d0') : btnBorder,
            background: copiado ? copiadoBg : btnBg,
            color: copiado ? copiadoColor : btnColor,
            cursor: 'pointer', transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          {copiado ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              ¡Copiado!
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              Copiar link
            </>
          )}
        </button>

        <a
          href={`https://wa.me/?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1, padding: '10px 12px', borderRadius: 10, fontSize: 12, fontWeight: 500,
            border: '1px solid rgba(37,211,102,0.3)',
            background: dark ? 'rgba(37,211,102,0.1)' : '#f0fdf4',
            color: dark ? '#4ade80' : '#15803d',
            textDecoration: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Enviarme
        </a>
      </div>
    </div>
  )
}
