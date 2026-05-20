'use client'

import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import Link from 'next/link'

type EstadoLead = 'nuevo' | 'contactado' | 'interesado' | 'cotizado' | 'convertido' | 'perdido'

type Lead = {
  id: string
  nombre: string
  telefono: string
  email: string | null
  origen: string | null
  estado: EstadoLead
  asignadoAId: string | null
  agenteNombre: string | null
  seguimientoEn: string | null
  ultimaNotaDesc: string | null
  creadoEn: string
}

type Me = { id: string; nombre: string; rol: string }
type Agente = { id: string; nombre: string; rol: string }
type ModalSeguimiento = { leadId: string; leadNombre: string; actual: string | null } | null
type ModalTraspaso = { leadId: string; leadNombre: string } | null
type FiltroAgente = 'todos' | 'mios' | string
type FiltroOrigen = 'todos' | string

// ── Constantes estáticas fuera del componente ──────────────────────────────

const TZ = 'America/Argentina/Buenos_Aires'

const PALETA = ['#1d4ed8', '#dc2626', '#7e22ce', '#c2410c', '#0891b2', '#be185d', '#065f46', '#92400e']

const ORIGEN_LABEL: Record<string, string> = {
  cotizador:   'Cotizador',
  landing:     'Landing',
  whatsapp:    'WhatsApp',
  instagram:   'Instagram',
  directo:     'Directo',
  veterinaria: 'Convenio',
}

const ORIGEN_BADGE: Record<string, { bg: string; color: string }> = {
  cotizador:   { bg: '#eff6ff', color: '#1d4ed8' },
  landing:     { bg: '#f0fdf4', color: '#15803d' },
  whatsapp:    { bg: '#dcfce7', color: '#16a34a' },
  instagram:   { bg: '#fdf4ff', color: '#9333ea' },
  directo:     { bg: '#fff7ed', color: '#c2410c' },
  veterinaria: { bg: '#fef9c3', color: '#a16207' },
}

const PRIORIDAD_ORIGEN: Record<string, number> = {
  cotizador: 0, landing: 1, whatsapp: 2, instagram: 3, directo: 4, veterinaria: 5,
}

const COLUMNAS: { id: EstadoLead; label: string; color: string }[] = [
  { id: 'nuevo',      label: 'Nuevo',      color: '#1d4ed8' },
  { id: 'contactado', label: 'Contactado', color: '#15803d' },
  { id: 'interesado', label: 'Interesado', color: '#a16207' },
  { id: 'cotizado',   label: 'Cotizado',   color: '#7e22ce' },
  { id: 'convertido', label: 'Convertido', color: '#15803d' },
  { id: 'perdido',    label: 'Perdido',    color: '#dc2626' },
]

const TIEMPOS = [
  { label: '+30 min',    fn: () => agregarMin(30) },
  { label: '+1 hora',    fn: () => agregarMin(60) },
  { label: '+2 horas',   fn: () => agregarMin(120) },
  { label: '+4 horas',   fn: () => agregarMin(240) },
  { label: 'Mañana 9am', fn: mañana9am },
]

function iniciales(nombre: string) {
  return nombre.split(' ').filter(Boolean).map(p => p[0]).join('').toUpperCase().slice(0, 2)
}

function badgeSeg(fechaStr: string | null) {
  if (!fechaStr) return null
  const diff = (new Date(fechaStr).getTime() - Date.now()) / 60000
  if (diff < -60) return null
  if (diff <= 5)  return { texto: '¡Ahora!', color: '#dc2626', bg: '#fef2f2' }
  if (diff <= 60) return { texto: `en ${Math.round(diff)}m`, color: '#d97706', bg: '#fffbeb' }
  const hora = new Date(fechaStr).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  return { texto: hora, color: '#6b7280', bg: '#f3f4f6' }
}

function agregarMin(min: number) {
  const d = new Date(); d.setMinutes(d.getMinutes() + min); return d.toISOString()
}
function mañana9am() {
  const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); return d.toISOString()
}

function btnFiltro(activo: boolean): React.CSSProperties {
  return {
    padding: '6px 14px', borderRadius: 999, border: '1.5px solid',
    borderColor: activo ? '#111827' : '#e5e7eb',
    background: activo ? '#111827' : 'white',
    color: activo ? 'white' : '#6b7280',
    fontWeight: activo ? 600 : 400, fontSize: 12, cursor: 'pointer',
  }
}

// ── Íconos SVG (estáticos, fuera del componente) ───────────────────────────

const IcoReloj = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IcoTraspaso = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
)
const IcoTelefono = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.25h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.37a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
)

// ── LeadCard (memoizado) ───────────────────────────────────────────────────

type LeadCardProps = {
  lead: Lead
  index: number
  puedeCambiar: boolean
  agenteColor: string
  onSeguimiento: (leadId: string, leadNombre: string, actual: string | null) => void
  onTraspaso: (leadId: string, leadNombre: string) => void
}

const LeadCard = memo(function LeadCard({ lead, index, puedeCambiar, agenteColor, onSeguimiento, onTraspaso }: LeadCardProps) {
  const [, tick] = useState(0)
  useEffect(() => {
    if (!lead.seguimientoEn) return
    const t = setInterval(() => tick(n => n + 1), 60_000)
    return () => clearInterval(t)
  }, [lead.seguimientoEn])

  const seg = badgeSeg(lead.seguimientoEn)
  const now = Date.now()
  const haySegVencido = !!lead.seguimientoEn && new Date(lead.seguimientoEn).getTime() <= now
  const haySegFuturo  = !!lead.seguimientoEn && new Date(lead.seguimientoEn).getTime() > now

  return (
    <Draggable draggableId={lead.id} index={index} isDragDisabled={!puedeCambiar}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            background: haySegVencido ? '#fff5f5' : haySegFuturo ? '#fffbeb' : 'white',
            borderRadius: 12, padding: '13px 14px',
            border: haySegVencido ? '1.5px solid #fca5a5' : haySegFuturo ? '1.5px solid #fde68a' : '1px solid #f3f4f6',
            boxShadow: snapshot.isDragging ? '0 8px 24px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
            cursor: 'grab', ...provided.draggableProps.style,
          }}
        >
          {/* Nombre + avatar agente */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0, flex: 1, lineHeight: 1.3 }}>{lead.nombre}</p>
            {lead.agenteNombre && (
              <span title={lead.agenteNombre} style={{ flexShrink: 0, marginLeft: 6, width: 24, height: 24, borderRadius: '50%', background: agenteColor, color: 'white', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {iniciales(lead.agenteNombre)}
              </span>
            )}
          </div>

          {/* Teléfono */}
          <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 5px' }}>{lead.telefono}</p>

          {/* Última interacción */}
          {lead.ultimaNotaDesc && (
            <p style={{
              fontSize: 11, color: '#6b7280', margin: '0 0 7px', lineHeight: 1.35,
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
            }}>
              💬 {lead.ultimaNotaDesc}
            </p>
          )}

          {/* Origen */}
          {lead.origen && (() => {
            const badge = ORIGEN_BADGE[lead.origen] ?? { bg: '#f9fafb', color: '#6b7280' }
            return (
              <span style={{ fontSize: 10, fontWeight: 600, color: badge.color, background: badge.bg, padding: '2px 7px', borderRadius: 20, border: `1px solid ${badge.color}33` }}>
                {ORIGEN_LABEL[lead.origen] ?? lead.origen}
              </span>
            )
          })()}

          {/* Badge seguimiento */}
          {seg && (
            <div style={{ marginTop: 6 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, color: seg.color, background: seg.bg }}>
                <IcoTelefono />{seg.texto}
              </span>
            </div>
          )}

          {/* Acciones */}
          <div style={{ display: 'flex', gap: 5, marginTop: 9 }}>
            <Link
              href={`/dashboard/leads/${lead.id}`}
              style={{ flex: 1, display: 'block', fontSize: 11, fontWeight: 600, color: '#1d4ed8', textDecoration: 'none', textAlign: 'center', background: '#eff6ff', padding: '5px 6px', borderRadius: 7 }}
              onClick={e => e.stopPropagation()}
            >
              Ver →
            </Link>
            {puedeCambiar && (
              <>
                <button
                  title="Programar seguimiento"
                  onClick={e => { e.stopPropagation(); onSeguimiento(lead.id, lead.nombre, lead.seguimientoEn) }}
                  style={{ width: 26, height: 26, borderRadius: 7, border: '1px solid #e5e7eb', background: lead.seguimientoEn ? '#fffbeb' : 'white', color: lead.seguimientoEn ? '#d97706' : '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                  <IcoReloj />
                </button>
                <button
                  title="Traspasar a otro agente"
                  onClick={e => { e.stopPropagation(); onTraspaso(lead.id, lead.nombre) }}
                  style={{ width: 26, height: 26, borderRadius: 7, border: '1px solid #e5e7eb', background: 'white', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                  <IcoTraspaso />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
})

// ── Página principal ───────────────────────────────────────────────────────

export default function LeadsPage() {
  const [leads, setLeads]             = useState<Lead[]>([])
  const [loading, setLoading]         = useState(true)
  const [nuevosCount, setNuevosCount] = useState(0)
  const [me, setMe]                   = useState<Me | null>(null)
  const [agentes, setAgentes]         = useState<Agente[]>([])
  const [filtro, setFiltro]           = useState<FiltroAgente>('todos')
  const [filtroOrigen, setFiltroOrigen] = useState<FiltroOrigen>('todos')
  const [filtroHoy, setFiltroHoy]     = useState(false)
  const [descargando, setDescargando] = useState(false)
  const [busqueda, setBusqueda]       = useState('')

  const [modalSeg, setModalSeg]               = useState<ModalSeguimiento>(null)
  const [segPersonalizado, setSegPersonalizado] = useState('')
  const [modalTraspaso, setModalTraspaso]     = useState<ModalTraspaso>(null)
  const [traspasoAgenteId, setTraspasoAgenteId] = useState('')
  const [motivoTraspaso, setMotivoTraspaso]   = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/me').then(r => r.json()),
      fetch('/api/agentes').then(r => r.json()),
    ]).then(([meData, agentesData]) => {
      setMe(meData)
      setAgentes(agentesData)
    })

    const cargar = (esPolling = false) =>
      fetch('/api/leads')
        .then(r => r.json())
        .then((data: Lead[]) => {
          if (!esPolling) { setLeads(data); setLoading(false); return }
          setLeads(prev => {
            const ids = new Set(prev.map(l => l.id))
            const nuevos = data.filter(l => !ids.has(l.id))
            if (nuevos.length === 0) return prev
            setNuevosCount(n => n + nuevos.length)
            return [...prev, ...nuevos]
          })
        })

    cargar()
    const poll = setInterval(() => cargar(true), 10_000)
    return () => clearInterval(poll)
  }, [])

  // ── Valores derivados memoizados ─────────────────────────────────────────

  const colorPorId = useMemo(() => {
    const todos = [...agentes, ...(me && !agentes.find(a => a.id === me.id) ? [me] : [])]
    return Object.fromEntries(todos.map((ag, i) => [ag.id, PALETA[i % PALETA.length]]))
  }, [agentes, me])

  const colorDeAgente = useCallback(
    (id: string | null) => (id ? (colorPorId[id] ?? '#6b7280') : '#6b7280'),
    [colorPorId]
  )

  const origenesPresentes = useMemo(
    () => [...new Set(leads.map(l => l.origen).filter(Boolean))] as string[],
    [leads]
  )

  const esHoyART = useCallback((fechaISO: string) => {
    const fmt = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d)
    return fmt(new Date(fechaISO)) === fmt(new Date())
  }, [])

  const leadsFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim()
    return leads
      .filter(l => {
        const passAgente   = filtro === 'todos' || (filtro === 'mios' ? l.asignadoAId === me?.id : l.asignadoAId === filtro)
        const passOrigen   = filtroOrigen === 'todos' || l.origen === filtroOrigen
        const passHoy      = !filtroHoy || esHoyART(l.creadoEn)
        const passBusqueda = !q || l.nombre.toLowerCase().includes(q) || l.telefono.includes(q)
        return passAgente && passOrigen && passHoy && passBusqueda
      })
      .sort((a, b) => (PRIORIDAD_ORIGEN[a.origen ?? ''] ?? 99) - (PRIORIDAD_ORIGEN[b.origen ?? ''] ?? 99))
  }, [leads, filtro, filtroOrigen, filtroHoy, busqueda, me, esHoyART])

  const totalHoy = useMemo(
    () => leads.filter(l => esHoyART(l.creadoEn)).length,
    [leads, esHoyART]
  )

  const puedeAccionar = useCallback(
    (lead: Lead) => me?.rol === 'admin' || me?.rol === 'manager' || lead.asignadoAId === me?.id,
    [me]
  )

  // ── Handlers estables (useCallback para que LeadCard no re-renderice) ────

  const handleSeguimiento = useCallback((leadId: string, leadNombre: string, actual: string | null) => {
    setModalSeg({ leadId, leadNombre, actual })
  }, [])

  const handleTraspaso = useCallback((leadId: string, leadNombre: string) => {
    setModalTraspaso({ leadId, leadNombre })
  }, [])

  const guardarSeg = useCallback((isoStr: string | null) => {
    if (!modalSeg) return
    const leadId = modalSeg.leadId
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, seguimientoEn: isoStr } : l))
    setModalSeg(null)
    setSegPersonalizado('')
    fetch(`/api/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seguimientoEn: isoStr }),
    })
  }, [modalSeg])

  const confirmarTraspaso = useCallback(() => {
    if (!modalTraspaso || !traspasoAgenteId || !motivoTraspaso.trim()) return
    const dest   = agentes.find(a => a.id === traspasoAgenteId)
    const leadId = modalTraspaso.leadId
    const motivo = motivoTraspaso.trim()
    setLeads(prev => prev.map(l =>
      l.id === leadId ? { ...l, asignadoAId: traspasoAgenteId, agenteNombre: dest?.nombre ?? null } : l
    ))
    setModalTraspaso(null)
    setTraspasoAgenteId('')
    setMotivoTraspaso('')
    fetch(`/api/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ traspasoAId: traspasoAgenteId, motivoTraspaso: motivo }),
    })
  }, [modalTraspaso, traspasoAgenteId, motivoTraspaso, agentes])

  async function descargarExcel() {
    setDescargando(true)
    try {
      const res = await fetch('/api/leads/exportar')
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err.error ?? 'Error al generar el Excel. Intentá de nuevo.')
        return
      }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      const hoy  = new Date().toLocaleDateString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        day: '2-digit', month: '2-digit', year: 'numeric',
      }).replace(/\//g, '-')
      a.href     = url
      a.download = `leads-${hoy}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setDescargando(false)
    }
  }

  async function onDragEnd(result: DropResult) {
    if (!result.destination) return
    const leadId = result.draggableId
    const lead   = leads.find(l => l.id === leadId)
    if (!lead || !puedeAccionar(lead)) return
    const nuevoEstado = result.destination.droppableId as EstadoLead
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, estado: nuevoEstado } : l))
    await fetch(`/api/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado }),
    })
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column' }}>

      {/* ── Modal Seguimiento ── */}
      {modalSeg && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 28, maxWidth: 400, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Programar seguimiento</h2>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 18px' }}>{modalSeg.leadNombre}</p>

            {modalSeg.actual && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '9px 13px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#92400e' }}>
                  Programado: {new Date(modalSeg.actual).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
                <button onClick={() => guardarSeg(null)} style={{ fontSize: 11, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Cancelar ×
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: 7, marginBottom: 16 }}>
              <input type="datetime-local" value={segPersonalizado} onChange={e => setSegPersonalizado(e.target.value)}
                style={{ flex: 1, border: '1.5px solid #e5e7eb', borderRadius: 9, padding: '9px 12px', fontSize: 13, outline: 'none', minWidth: 0 }} />
              <button onClick={() => { if (segPersonalizado) guardarSeg(new Date(segPersonalizado).toISOString()) }}
                disabled={!segPersonalizado}
                style={{ padding: '9px 16px', borderRadius: 9, border: 'none', background: segPersonalizado ? '#111827' : '#e5e7eb', color: segPersonalizado ? 'white' : '#9ca3af', fontSize: 13, fontWeight: 600, cursor: segPersonalizado ? 'pointer' : 'not-allowed', flexShrink: 0 }}>
                OK
              </button>
            </div>

            <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Atajos rápidos</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 16 }}>
              {TIEMPOS.map(t => (
                <button key={t.label} onClick={() => guardarSeg(t.fn())}
                  style={{ padding: '9px', borderRadius: 9, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                  {t.label}
                </button>
              ))}
            </div>

            <button onClick={() => { setModalSeg(null); setSegPersonalizado('') }}
              style={{ width: '100%', padding: '9px', borderRadius: 9, border: '1px solid #e5e7eb', background: 'white', color: '#6b7280', fontSize: 13, cursor: 'pointer' }}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* ── Modal Traspaso ── */}
      {modalTraspaso && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 28, maxWidth: 380, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Traspasar lead</h2>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 18px' }}>{modalTraspaso.leadNombre}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, maxHeight: 260, overflowY: 'auto', marginBottom: 18 }}>
              {agentes.filter(a => a.id !== me?.id).map(ag => (
                <button key={ag.id} onClick={() => setTraspasoAgenteId(ag.id)}
                  style={{ padding: '11px 14px', borderRadius: 11, border: '2px solid', borderColor: traspasoAgenteId === ag.id ? '#2d8a54' : '#e5e7eb', background: traspasoAgenteId === ag.id ? '#f0faf5' : 'white', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#374151', flexShrink: 0 }}>
                    {iniciales(ag.nombre)}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111827', flex: 1 }}>{ag.nombre}</span>
                  {traspasoAgenteId === ag.id && <span style={{ color: '#2d8a54', fontSize: 15 }}>✓</span>}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Motivo del traspaso <span style={{ color: '#ef4444' }}>*</span></p>
              <textarea
                value={motivoTraspaso}
                onChange={e => setMotivoTraspaso(e.target.value)}
                placeholder="¿Por qué traspasás este lead? Ej: Me voy a almorzar, tiene acento del interior..."
                rows={3}
                style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 9, padding: '9px 12px', fontSize: 12, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
              <button onClick={() => { setModalTraspaso(null); setTraspasoAgenteId(''); setMotivoTraspaso('') }}
                style={{ padding: '11px', borderRadius: 10, border: '1px solid #e5e7eb', background: 'white', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={confirmarTraspaso} disabled={!traspasoAgenteId || !motivoTraspaso.trim()}
                style={{ padding: '11px', borderRadius: 10, border: 'none', background: traspasoAgenteId && motivoTraspaso.trim() ? '#2d8a54' : '#9ca3af', color: 'white', fontWeight: 600, fontSize: 13, cursor: traspasoAgenteId && motivoTraspaso.trim() ? 'pointer' : 'not-allowed' }}>
                Confirmar →
              </button>
            </div>
            <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 10, marginBottom: 0 }}>
              Queda registrado en el historial del lead.
            </p>
          </div>
        </div>
      )}

      {/* ── Banner nuevos leads ── */}
      {nuevosCount > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 16px', marginBottom: 16 }}>
          <span style={{ fontSize: 14, color: '#15803d', fontWeight: 500 }}>
            {nuevosCount === 1 ? '1 nuevo lead' : `${nuevosCount} nuevos leads`} en la cola
          </span>
          <button onClick={() => setNuevosCount(0)} style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#15803d', lineHeight: 1 }}>×</button>
        </div>
      )}

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: 0 }}>Leads</h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>
            {leadsFiltrados.length} leads
            {filtroHoy && totalHoy > 0 && (
              <span style={{ marginLeft: 8, fontSize: 12, color: '#2d8a54', fontWeight: 600 }}>
                — {totalHoy} ingresaron hoy
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 13, outline: 'none', width: 240, color: '#111827' }}
          />
          {filtroHoy && (me?.rol === 'admin' || me?.rol === 'manager') && (
            <button
              onClick={descargarExcel}
              disabled={descargando}
              title="Descargar leads de hoy con actividad en Excel"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 16px', borderRadius: 10, border: '1.5px solid #e5e7eb',
                background: descargando ? '#f3f4f6' : 'white', color: descargando ? '#9ca3af' : '#374151',
                fontSize: 13, fontWeight: 500, cursor: descargando ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {descargando ? '⏳ Generando...' : '⬇ Excel de hoy'}
            </button>
          )}
          <Link href="/dashboard/leads/nuevo" style={{ background: '#111827', color: 'white', padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            + Nuevo lead
          </Link>
        </div>
      </div>

      {/* ── Filtro Hoy ── */}
      <div style={{ display: 'flex', gap: 7, marginBottom: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Período:</span>
        <button
          onClick={() => setFiltroHoy(false)}
          style={btnFiltro(!filtroHoy)}
        >
          Todos
        </button>
        <button
          onClick={() => setFiltroHoy(true)}
          style={{
            ...btnFiltro(filtroHoy),
            ...(filtroHoy ? { background: '#2d8a54', borderColor: '#2d8a54', color: 'white' } : {}),
          }}
        >
          Hoy {totalHoy > 0 && `(${totalHoy})`}
        </button>
      </div>

      {/* ── Filtros por agente ── */}
      <div style={{ display: 'flex', gap: 7, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Agente:</span>
        <button onClick={() => setFiltro('todos')} style={btnFiltro(filtro === 'todos')}>
          Todos ({leads.length})
        </button>
        <button onClick={() => setFiltro('mios')} style={btnFiltro(filtro === 'mios')}>
          Mis leads
        </button>
        {agentes.filter(a => a.id !== me?.id).map(ag => (
          <button key={ag.id} onClick={() => setFiltro(ag.id)}
            style={{ ...btnFiltro(filtro === ag.id), borderColor: filtro === ag.id ? colorDeAgente(ag.id) : '#e5e7eb', background: filtro === ag.id ? colorDeAgente(ag.id) : 'white', color: filtro === ag.id ? 'white' : '#6b7280' }}>
            {ag.nombre.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* ── Filtros por origen ── */}
      {origenesPresentes.length > 0 && (
        <div style={{ display: 'flex', gap: 7, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Origen:</span>
          <button onClick={() => setFiltroOrigen('todos')} style={btnFiltro(filtroOrigen === 'todos')}>
            Todos
          </button>
          {origenesPresentes.map(origen => (
            <button key={origen} onClick={() => setFiltroOrigen(origen)} style={btnFiltro(filtroOrigen === origen)}>
              {ORIGEN_LABEL[origen] ?? origen} ({leads.filter(l => l.origen === origen).length})
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p style={{ fontSize: 14, color: '#9ca3af' }}>Cargando...</p>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16, flex: 1, alignItems: 'start' }}>
            {COLUMNAS.map(col => {
              const leadsColumna = leadsFiltrados.filter(l => l.estado === col.id)
              return (
                <div key={col.id} style={{ minWidth: 200, flex: '0 0 200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '0 4px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{col.label}</span>
                    <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 'auto', background: '#f3f4f6', padding: '1px 7px', borderRadius: 20 }}>{leadsColumna.length}</span>
                  </div>
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{ minHeight: 200, background: snapshot.isDraggingOver ? '#f0f9ff' : '#f3f4f6', borderRadius: 14, padding: 8, transition: 'background 0.15s', display: 'flex', flexDirection: 'column', gap: 8 }}
                      >
                        {leadsColumna.map((lead, index) => (
                          <LeadCard
                            key={lead.id}
                            lead={lead}
                            index={index}
                            puedeCambiar={puedeAccionar(lead)}
                            agenteColor={colorDeAgente(lead.asignadoAId)}
                            onSeguimiento={handleSeguimiento}
                            onTraspaso={handleTraspaso}
                          />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              )
            })}
          </div>
        </DragDropContext>
      )}
    </div>
  )
}