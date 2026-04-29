'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'

type Mensaje = { role: 'user' | 'assistant'; content: string }

function getScreenContext(pathname: string): string {
  if (pathname.includes('/leads')) return 'leads'
  if (pathname.includes('/clientes')) return 'clientes'
  if (pathname.includes('/servicios')) return 'servicios'
  if (pathname.includes('/planes')) return 'planes'
  if (pathname.includes('/reportes')) return 'reportes'
  if (pathname.includes('/agenda')) return 'agenda'
  if (pathname.includes('/inventario')) return 'inventario'
  if (pathname.includes('/convenios')) return 'convenios'
  if (pathname.includes('/novedades')) return 'novedades'
  if (pathname.includes('/configuracion')) return 'configuracion'
  if (pathname === '/dashboard') return 'dashboard'
  return 'desconocido'
}

const SUGERENCIAS = [
  '¿Cómo creo un lead?',
  '¿Cómo convierto un lead a cliente?',
  '¿Cómo registro un pago de plan?',
]

export function AsistenteWidget() {
  const [abierto, setAbierto] = useState(false)
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [input, setInput] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pathname = usePathname()
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, cargando])

  useEffect(() => {
    if (abierto) setTimeout(() => inputRef.current?.focus(), 100)
  }, [abierto])

  async function enviar(texto: string) {
    if (!texto.trim() || cargando) return
    setError(null)
    setInput('')

    const nuevosMensajes: Mensaje[] = [...mensajes, { role: 'user', content: texto }]
    setMensajes(nuevosMensajes)
    setCargando(true)

    // Agregar mensaje vacío del asistente que se va llenando con el stream
    setMensajes(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/asistente/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: texto,
          history: mensajes.slice(-10),
          screenContext: getScreenContext(pathname),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setMensajes(prev => prev.slice(0, -1)) // quitar el mensaje vacío
        setError(data.error ?? 'Algo salió mal.')
        setCargando(false)
        return
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let respuesta = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data)
            if (parsed.text) {
              respuesta += parsed.text
              setMensajes(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', content: respuesta }
                return updated
              })
            }
            if (parsed.error) {
              setMensajes(prev => prev.slice(0, -1))
              setError(parsed.error)
            }
          } catch { /* ignorar líneas mal formadas */ }
        }
      }
    } catch {
      setMensajes(prev => prev.slice(0, -1))
      setError('No se pudo conectar. Intentá de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    enviar(input)
  }

  return (
    <>
      {/* Botón flotante */}
      <div
        onClick={() => setAbierto(v => !v)}
        title="Asistente CRM"
        style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 1000, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div style={{
          position: 'absolute',
          width: 52, height: 52, borderRadius: '50%',
          backgroundImage: 'linear-gradient(#2d8a54 35%, #86efac)',
          animation: 'asistenteSpinning 1.7s linear infinite',
          filter: 'blur(1px)',
          boxShadow: '0px -5px 20px 0px #2d8a54, 0px 5px 20px 0px #86efac',
        }} />
        <div style={{
          position: 'absolute',
          width: 52, height: 52, borderRadius: '50%',
          background: '#f5f2ee',
          filter: 'blur(6px)',
        }} />
        <div style={{
          position: 'relative',
          width: 36, height: 36, borderRadius: '50%',
          background: abierto ? '#2d8a54' : '#f5f2ee',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s',
        }}>
          {abierto ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2d8a54" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          )}
        </div>
      </div>

      {/* Panel */}
      {abierto && (
        <div style={{
          position: 'fixed', bottom: 96, right: 28,
          width: 360, height: 480,
          background: 'white', borderRadius: 20,
          boxShadow: '0 8px 40px rgba(0,0,0,0.14)',
          border: '1px solid #e5e7eb',
          display: 'flex', flexDirection: 'column',
          zIndex: 999, overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{
            padding: '14px 18px',
            background: '#f0faf5', borderBottom: '1px solid #d1ead9',
            display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              backgroundImage: 'linear-gradient(#2d8a54 35%, #86efac)',
              animation: 'asistenteSpinning 1.7s linear infinite',
              filter: 'blur(0.5px)',
            }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>Asistente CRM</p>
              <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>Huellas de Paz · Solo uso del sistema</p>
            </div>
          </div>

          {/* Mensajes */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>

            {mensajes.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px 8px' }}>
                <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6, margin: '0 0 14px' }}>
                  Hola 👋 Preguntame cualquier duda sobre cómo usar el CRM.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                  {SUGERENCIAS.map(s => (
                    <button key={s} onClick={() => enviar(s)} style={{
                      fontSize: 11, padding: '5px 10px', borderRadius: 20,
                      border: '1px solid #d1ead9', background: '#f0faf5',
                      color: '#2d8a54', cursor: 'pointer', fontWeight: 500,
                    }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mensajes.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '84%',
                  padding: '9px 13px',
                  borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: m.role === 'user' ? '#2d8a54' : '#f3f4f6',
                  color: m.role === 'user' ? 'white' : '#111827',
                  fontSize: 13, lineHeight: 1.55, whiteSpace: 'pre-wrap',
                }}>
                  {m.content || (m.role === 'assistant' && cargando ? (
                    <span style={{ color: '#9ca3af' }}>...</span>
                  ) : m.content)}
                </div>
              </div>
            ))}

            {cargando && mensajes[mensajes.length - 1]?.role === 'user' && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '10px 14px', borderRadius: '16px 16px 16px 4px',
                  background: '#f3f4f6', display: 'flex', gap: 5, alignItems: 'center',
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 6, height: 6, borderRadius: '50%', background: '#2d8a54',
                      animation: `asistenteDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div style={{
                padding: '8px 12px', borderRadius: 10,
                background: '#fef2f2', border: '1px solid #fecaca',
                fontSize: 12, color: '#dc2626',
              }}>
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} style={{
            padding: '10px 12px', borderTop: '1px solid #f3f4f6',
            display: 'flex', gap: 8, flexShrink: 0, background: 'white',
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Escribí tu consulta..."
              disabled={cargando}
              style={{
                flex: 1, padding: '9px 13px', fontSize: 13,
                border: '1px solid #e5e7eb', borderRadius: 12,
                outline: 'none', background: '#f9fafb', color: '#111827',
              }}
            />
            <button
              type="submit"
              disabled={cargando || !input.trim()}
              style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: cargando || !input.trim() ? '#e5e7eb' : '#2d8a54',
                border: 'none', cursor: cargando || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </form>
        </div>
      )}

      <style>{`
        @keyframes asistenteSpinning { to { transform: rotate(360deg); } }
        @keyframes asistenteDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  )
}
