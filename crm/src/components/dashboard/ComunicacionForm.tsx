'use client'

import { useState } from 'react'
import { type Cliente, type TemplateMsg } from '@/db/schema'

export function ComunicacionForm({ clientes, templates }: {
  clientes: Cliente[]
  templates: TemplateMsg[]
}) {
  const [clienteId, setClienteId] = useState('')
  const [templateId, setTemplateId] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [enviado, setEnviado] = useState(false)

  const clienteSeleccionado = clientes.find(c => c.id === clienteId)
  const templateSeleccionado = templates.find(t => t.id === templateId)

  function aplicarTemplate(t: TemplateMsg) {
    let contenido = t.contenido
    if (clienteSeleccionado) {
      contenido = contenido.replace(/{nombre}/g, clienteSeleccionado.nombre)
    }
    setMensaje(contenido)
    setTemplateId(t.id)
  }

  function abrirWhatsApp() {
    if (!clienteSeleccionado || !mensaje) return
    const telefono = clienteSeleccionado.telefono.replace(/\D/g, '')
    const url = `https://wa.me/54${telefono}?text=${encodeURIComponent(mensaje)}`
    window.open(url, '_blank')
    setEnviado(true)
    setTimeout(() => setEnviado(false), 3000)
  }

  const inputStyle = {
    display: 'block', width: '100%', padding: '10px 14px', fontSize: 14,
    color: '#111827', background: 'white', border: '1px solid #e5e7eb',
    borderRadius: 10, outline: 'none', boxSizing: 'border-box' as const,
  }

  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <label style={labelStyle}>Cliente</label>
        <select value={clienteId} onChange={e => setClienteId(e.target.value)} style={inputStyle}>
          <option value="">Seleccioná un cliente</option>
          {clientes.map(c => (
            <option key={c.id} value={c.id}>{c.nombre} {c.apellido} · {c.telefono}</option>
          ))}
        </select>
      </div>

      {templates.length > 0 && (
        <div>
          <label style={labelStyle}>Template</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {templates.map(t => (
              <button
                key={t.id}
                onClick={() => aplicarTemplate(t)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', borderRadius: 10, border: '1px solid',
                  borderColor: templateId === t.id ? '#111827' : '#e5e7eb',
                  background: templateId === t.id ? '#f9fafb' : 'white',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{t.nombre}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ fontSize: 11, background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: 20 }}>{t.canal}</span>
                  <span style={{ fontSize: 11, background: '#f3f4f6', color: '#6b7280', padding: '2px 8px', borderRadius: 20 }}>{t.evento}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label style={labelStyle}>Mensaje</label>
        <textarea
          value={mensaje}
          onChange={e => setMensaje(e.target.value)}
          rows={5}
          placeholder="Escribí o seleccioná un template..."
          style={{ ...inputStyle, resize: 'vertical' }}
        />
        <p style={{ fontSize: 12, color: '#9ca3af', margin: '6px 0 0' }}>
          Variables: {'{nombre}'}, {'{mascota}'}, {'{fecha}'}, {'{monto}'}
        </p>
      </div>

      <button
        onClick={abrirWhatsApp}
        disabled={!clienteSeleccionado || !mensaje}
        style={{
          padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500,
          border: 'none', background: enviado ? '#15803d' : '#25D366',
          color: 'white', cursor: !clienteSeleccionado || !mensaje ? 'not-allowed' : 'pointer',
          opacity: !clienteSeleccionado || !mensaje ? 0.5 : 1,
        }}
      >
        {enviado ? '✓ Abierto en WhatsApp' : '↗ Abrir en WhatsApp'}
      </button>
    </div>
  )
}