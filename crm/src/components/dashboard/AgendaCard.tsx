'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const estadoConfig: Record<string, { bg: string; color: string; border: string; accent: string }> = {
  pendiente:  { bg: '#fffbeb', color: '#92400e', border: '#fde68a', accent: '#f59e0b' },
  en_proceso: { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe', accent: '#3b82f6' },
  listo:      { bg: '#f0fdf4', color: '#14532d', border: '#bbf7d0', accent: '#22c55e' },
  entregado:  { bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb', accent: '#9ca3af' },
  cancelado:  { bg: '#fef2f2', color: '#991b1b', border: '#fecaca', accent: '#ef4444' },
}

const estadoLabel: Record<string, string> = {
  pendiente:  'Pendiente',
  en_proceso: 'En proceso',
  listo:      'Listo',
  entregado:  'Entregado',
  cancelado:  'Cancelado',
}

const estadoSiguiente: Record<string, string> = {
  pendiente:  'en_proceso',
  en_proceso: 'listo',
  listo:      'entregado',
}

const labelSiguiente: Record<string, string> = {
  en_proceso: 'Iniciar',
  listo:      'Marcar listo',
  entregado:  'Entregado',
}

const tipoLabel: Record<string, string> = {
  cremacion_individual:  'Cremación individual',
  cremacion_comunitaria: 'Cremación comunitaria',
  entierro:              'Entierro',
}

export interface ServicioAgendaProps {
  id: string
  tipo: string
  estado: string
  fechaRetiro: Date | null
  clienteNombre: string | null
  clienteApellido: string | null
  clienteTelefono: string | null
  mascotaNombre: string | null
  mascotaEspecie: string | null
}

export function AgendaCard({ s }: { s: ServicioAgendaProps }) {
  const router = useRouter()
  const [estado, setEstado] = useState(s.estado)
  const [avanzando, setAvanzando] = useState(false)
  const [confirmar, setConfirmar] = useState(false)
  const [eliminando, setEliminando] = useState(false)

  const cfg = estadoConfig[estado] ?? estadoConfig.pendiente
  const siguiente = estadoSiguiente[estado]

  async function avanzar() {
    const nuevoEstado = siguiente
    setEstado(nuevoEstado)
    setAvanzando(true)
    await fetch(`/api/servicios/${s.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado }),
    })
    setAvanzando(false)
    router.refresh()
  }

  async function eliminar() {
    setEliminando(true)
    await fetch(`/api/servicios/${s.id}`, { method: 'DELETE' })
    router.refresh()
  }

  const horaMinuto = s.fechaRetiro
    ? new Date(s.fechaRetiro).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
    : null

  return (
    <div style={{
      background: 'white',
      border: `1px solid ${cfg.border}`,
      borderRadius: 14,
      padding: '0',
      display: 'flex',
      overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      {/* Barra de color izquierda */}
      <div style={{ width: 5, background: cfg.accent, flexShrink: 0 }} />

      {/* Contenido */}
      <div style={{ flex: 1, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 20, minWidth: 0 }}>

        {/* Hora */}
        {horaMinuto && (
          <div style={{ textAlign: 'center', flexShrink: 0, width: 52 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: cfg.color, lineHeight: 1 }}>
              {horaMinuto.split(':')[0]}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: cfg.color, opacity: 0.6, marginTop: 1 }}>
              :{horaMinuto.split(':')[1]}
            </div>
          </div>
        )}

        {/* Divisor */}
        {horaMinuto && (
          <div style={{ width: 1, height: 48, background: cfg.border, flexShrink: 0 }} />
        )}

        {/* Info principal */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7, flexWrap: 'wrap' }}>
            <Link
              href={`/dashboard/servicios/${s.id}`}
              style={{ fontSize: 20, fontWeight: 700, color: '#111827', textDecoration: 'none' }}
            >
              {s.mascotaNombre ?? '—'}
            </Link>
            {s.mascotaEspecie && (
              <span style={{ fontSize: 14, color: '#9ca3af', textTransform: 'capitalize' }}>{s.mascotaEspecie}</span>
            )}
            <span style={{
              fontSize: 11, fontWeight: 700, color: cfg.color,
              background: cfg.bg, padding: '3px 10px', borderRadius: 20,
              border: `1px solid ${cfg.border}`,
              textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>
              {estadoLabel[estado]}
            </span>
          </div>
          <div style={{ fontSize: 14, color: '#6b7280', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, color: '#374151' }}>
              {s.clienteNombre} {s.clienteApellido}
            </span>
            <span>·</span>
            <span>{tipoLabel[s.tipo] ?? s.tipo}</span>
            {s.clienteTelefono && (
              <>
                <span>·</span>
                <span>{s.clienteTelefono}</span>
              </>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {confirmar ? (
            <>
              <button onClick={eliminar} disabled={eliminando} style={btn('danger', eliminando)}>
                {eliminando ? '...' : 'Confirmar'}
              </button>
              <button onClick={() => setConfirmar(false)} style={btn('ghost')}>
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setConfirmar(true)} style={btn('ghost-danger')}>
                Eliminar
              </button>
              {siguiente && (
                <button onClick={avanzar} disabled={avanzando} style={btn('primary', avanzando)}>
                  {avanzando ? '...' : `→ ${labelSiguiente[siguiente]}`}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function btn(variant: 'primary' | 'ghost' | 'ghost-danger' | 'danger', disabled = false): React.CSSProperties {
  const base: React.CSSProperties = {
    padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1,
    whiteSpace: 'nowrap', transition: 'opacity .15s',
  }
  const variants = {
    primary:      { background: '#111827', color: 'white',    border: 'none' },
    ghost:        { background: 'white',   color: '#374151',  border: '1px solid #e5e7eb' },
    'ghost-danger': { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
    danger:       { background: '#dc2626', color: 'white',    border: 'none' },
  }
  return { ...base, ...variants[variant] }
}