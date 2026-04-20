'use client'

import { useState } from 'react'

type Props = {
  leadId: string
  emailDestinatario: string
  nombreDestinatario: string
}

export function EmailLeadForm({ leadId, emailDestinatario, nombreDestinatario }: Props) {
  const [abierto, setAbierto] = useState(false)
  const [asunto, setAsunto] = useState('')
  const [cuerpo, setCuerpo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function enviar() {
    if (!asunto.trim() || !cuerpo.trim()) {
      setError('Completá el asunto y el mensaje.')
      return
    }
    setEnviando(true)
    setError(null)

    const res = await fetch(`/api/leads/${leadId}/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asunto, cuerpo }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Error al enviar el email.')
      setEnviando(false)
      return
    }

    setEnviado(true)
    setEnviando(false)
    setTimeout(() => {
      setAbierto(false)
      setAsunto('')
      setCuerpo('')
      setEnviado(false)
    }, 2000)
  }

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          marginTop: 12, width: '100%', background: '#eff6ff', color: '#1d4ed8',
          border: '1px solid #bfdbfe', borderRadius: 10, padding: '10px',
          fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}
      >
        ✉️ Enviar email
      </button>
    )
  }

  return (
    <div style={{
      marginTop: 12, background: '#eff6ff', borderRadius: 12,
      border: '1px solid #bfdbfe', padding: '16px', display: 'flex',
      flexDirection: 'column', gap: 10,
    }}>
      {/* Para */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
        <span style={{ color: '#6b7280', width: 48, flexShrink: 0 }}>Para:</span>
        <span style={{ color: '#111827', fontWeight: 600 }}>
          {nombreDestinatario} &lt;{emailDestinatario}&gt;
        </span>
      </div>

      <div style={{ height: 1, background: '#bfdbfe' }} />

      {/* Asunto */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13, color: '#6b7280', width: 48, flexShrink: 0 }}>Asunto:</span>
        <input
          value={asunto}
          onChange={e => setAsunto(e.target.value)}
          placeholder="Asunto del email"
          style={{
            flex: 1, border: 'none', outline: 'none', fontSize: 13,
            background: 'transparent', color: '#111827',
          }}
        />
      </div>

      <div style={{ height: 1, background: '#bfdbfe' }} />

      {/* Cuerpo */}
      <textarea
        value={cuerpo}
        onChange={e => setCuerpo(e.target.value)}
        placeholder="Escribí tu mensaje acá..."
        rows={5}
        style={{
          border: 'none', outline: 'none', fontSize: 13, background: 'transparent',
          color: '#111827', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6,
        }}
      />

      {error && <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{error}</p>}

      {enviado && (
        <p style={{ fontSize: 12, color: '#15803d', fontWeight: 600, margin: 0 }}>
          ✓ Email enviado correctamente
        </p>
      )}

      {/* Botones */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button
          onClick={() => { setAbierto(false); setAsunto(''); setCuerpo(''); setError(null) }}
          style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #bfdbfe', background: 'white', color: '#374151', fontSize: 13, cursor: 'pointer' }}
        >
          Cancelar
        </button>
        <button
          onClick={enviar}
          disabled={enviando || enviado}
          style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: enviado ? '#15803d' : '#1d4ed8',
            color: 'white', fontSize: 13, fontWeight: 600,
            cursor: enviando ? 'not-allowed' : 'pointer',
            opacity: enviando ? 0.7 : 1,
          }}
        >
          {enviando ? 'Enviando...' : enviado ? '✓ Enviado' : 'Enviar ✉️'}
        </button>
      </div>
    </div>
  )
}