'use client'

import { useState, useEffect, useRef } from 'react'
import { EmailLeadForm } from '@/components/leads/EmailLeadForm'
import { SelectorProducto } from '@/components/servicios/SelectorProducto'

type Lead = {
  id: string
  nombre: string
  telefono: string
  email: string | null
  dni: string | null
  origen: string | null
  estado: string
  mensaje: string | null
  pickupMethod: string | null
  asignadoAId: string | null
  agenteNombre: string | null
  seguimientoEn: string | null
  creadoEn: string
  actualizadoEn: string
}

type Me = { id: string; nombre: string; rol: string }
type Agente = { id: string; nombre: string; rol: string }

type PlanConfig = { id: string; nombre: string; cuotaMensual: string; activo: boolean }
type ServicioConfig = { id: string; nombre: string; tipo: string; precio: string | null; activo: boolean }
type ConvenioActivo = { id: string; nombre: string; descuentoPorcentaje: string | null; serviciosCubiertos: string[] | null }
type ItemInventario = { id: string; nombre: string; descripcion: string | null; categoria: string; stockActual: number; precioUnitario: string | null; foto: string | null }

type ModalConversion = {
  abierto: boolean; tipo: 'servicio' | 'plan' | ''; apellido: string; dni: string; email: string
  localidad: string; mascotaNombre: string; mascotaEspecie: string; servicioConfigId: string
  tipoPlan: string; fechaRetiro: string; modalidadRetiro: string; notas: string
  convenioId: string; inventarioItemId: string | null
}

type ModalTraspaso = { leadId: string; leadNombre: string } | null

const ESTADOS_GESTION = [
  { id: 'nuevo', label: 'Nuevo', color: '#1d4ed8' },
  { id: 'contactado', label: 'Contactado', color: '#15803d' },
  { id: 'interesado', label: 'Interesado', color: '#a16207' },
  { id: 'cotizado', label: 'Cotizado', color: '#7e22ce' },
  { id: 'convertido', label: '✓ Convirtió — crear cliente', color: '#15803d' },
  { id: 'perdido', label: 'Perdido', color: '#dc2626' },
]

function convenioAplica(c: ConvenioActivo, configId: string | undefined): boolean {
  if (!configId) return true
  if (!c.serviciosCubiertos || c.serviciosCubiertos.length === 0) return true
  return c.serviciosCubiertos.includes(configId)
}

function parsearMensaje(mensaje: string): { label: string; value: string }[] | null {
  if (!mensaje || !mensaje.includes(' · ')) return null
  return mensaje.split(' · ').map(parte => {
    if (parte.startsWith('Zona:')) return { label: 'Zona', value: parte.replace('Zona: ', '') }
    if (parte.startsWith('Mascota:')) return { label: 'Mascota', value: parte.replace('Mascota: ', '') }
    if (['HUELLITA', 'COMPAÑERO', 'SIEMPRE JUNTO', 'JARDÍN', 'CREMACIÓN', 'INHUMACIÓN'].some(s => parte.toUpperCase().includes(s))) return { label: 'Servicio', value: parte }
    if (['PEQUEÑO', 'MEDIANO', 'GRANDE', 'EXTRA GRANDE'].some(s => parte.toUpperCase().includes(s))) return { label: 'Tamaño', value: parte }
    if (['TRAERLA', 'RETIREN', 'SUCURSAL', 'DOMICILIO'].some(s => parte.toUpperCase().includes(s))) return { label: 'Retiro', value: parte }
    return { label: 'Detalle', value: parte }
  })
}

function badgeSeguimiento(fechaStr: string | null) {
  if (!fechaStr) return null
  const diff = (new Date(fechaStr).getTime() - Date.now()) / 60000
  if (diff < -60) return null
  if (diff <= 5) return { texto: '¡Ahora!', color: '#dc2626', bg: '#fef2f2' }
  if (diff <= 60) return { texto: `en ${Math.round(diff)}m`, color: '#d97706', bg: '#fffbeb' }
  const hora = new Date(fechaStr).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  return { texto: `${hora}`, color: '#6b7280', bg: '#f3f4f6' }
}

function agregarMin(min: number) {
  const d = new Date(); d.setMinutes(d.getMinutes() + min); return d.toISOString()
}
function mañana9am() {
  const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); return d.toISOString()
}

const IcoTraspaso = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
)
const IcoTelefono = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.25h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.37a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
)

function Cronometro({ iniciado }: { iniciado: boolean }) {
  const [seg, setSeg] = useState(0)
  const ref = useRef<NodeJS.Timeout | null>(null)
  useEffect(() => {
    if (iniciado) ref.current = setInterval(() => setSeg(s => s + 1), 1000)
    else if (ref.current) clearInterval(ref.current)
    return () => { if (ref.current) clearInterval(ref.current) }
  }, [iniciado])
  const p = (n: number) => Math.floor(n).toString().padStart(2, '0')
  return (
    <div style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 700, color: iniciado ? '#111827' : '#9ca3af', letterSpacing: 2 }}>
      {p(seg/3600)}:{p((seg%3600)/60)}:{p(seg%60)}
    </div>
  )
}

const modalInicial: ModalConversion = {
  abierto: false, tipo: '', apellido: '', dni: '', email: '', localidad: '',
  mascotaNombre: '', mascotaEspecie: '', servicioConfigId: '', tipoPlan: '',
  fechaRetiro: '', modalidadRetiro: '', notas: '', convenioId: '', inventarioItemId: null,
}

const TIEMPOS_RAPIDOS = [
  { label: '+30 min', fn: () => agregarMin(30) },
  { label: '+1 hora', fn: () => agregarMin(60) },
  { label: '+2 horas', fn: () => agregarMin(120) },
  { label: '+4 horas', fn: () => agregarMin(240) },
  { label: 'Mañana 9am', fn: mañana9am },
]

export default function MisLeadsPage() {
  const [me, setMe] = useState<Me | null>(null)
  const [agentes, setAgentes] = useState<Agente[]>([])

  // Modal traspaso
  const [modalTraspaso, setModalTraspaso] = useState<ModalTraspaso>(null)
  const [traspasoAgenteId, setTraspasoAgenteId] = useState('')
  const [motivoTraspaso, setMotivoTraspaso] = useState('')

  // Gestión
  const [leads, setLeads] = useState<Lead[]>([])
  const [planesConfig, setPlanesConfig] = useState<PlanConfig[]>([])
  const [serviciosConfig, setServiciosConfig] = useState<ServicioConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [indiceActual, setIndiceActual] = useState(0)
  const [leadAbierto, setLeadAbierto] = useState(false)
  const [cronometroActivo, setCronometroActivo] = useState(false)
  const [reporte, setReporte] = useState('')
  const [nuevoEstado, setNuevoEstado] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [modal, setModal] = useState<ModalConversion>(modalInicial)
  const [guardandoConversion, setGuardandoConversion] = useState(false)
  const [conveniosActivos, setConveniosActivos] = useState<ConvenioActivo[]>([])
  const [inventarioItems, setInventarioItems] = useState<ItemInventario[]>([])
  const [segGestionActual, setSegGestionActual] = useState<string | null>(null)
  const [segPersonalizado, setSegPersonalizado] = useState('')
  const [mostrarTraspasoGestion, setMostrarTraspasoGestion] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/me').then(r => r.json()),
      fetch('/api/agentes').then(r => r.json()),
    ]).then(([meData, agentesData]) => {
      setMe(meData)
      setAgentes(agentesData)
    })

    const cargar = () =>
      fetch('/api/leads?misLeads=true')
        .then(r => r.json())
        .then((data: Lead[]) => {
          const ahora = new Date()
          const activos = data.filter(l => {
            if (l.estado === 'convertido' || l.estado === 'perdido') return false
            if (l.seguimientoEn && new Date(l.seguimientoEn) > ahora) return false
            return true
          })
          setLeads(prev => {
            if (prev.length === 0) { setLoading(false); return activos }
            const ids = new Set(prev.map(l => l.id))
            const nuevos = activos.filter(l => !ids.has(l.id))
            return nuevos.length > 0 ? [...prev, ...nuevos] : prev
          })
          setLoading(false)
        })

    cargar()
    const poll = setInterval(cargar, 30_000)

    fetch('/api/configuracion/planes').then(r => r.json()).then(d => setPlanesConfig(d.filter((p: PlanConfig) => p.activo)))
    fetch('/api/configuracion/servicios').then(r => r.json()).then(d => setServiciosConfig(d.filter((s: ServicioConfig) => s.activo))).catch(() => {})
    fetch('/api/convenios?activos=true').then(r => r.json()).then(setConveniosActivos).catch(() => {})
    fetch('/api/inventario?selector=true').then(r => r.ok ? r.json() : []).then(setInventarioItems).catch(() => {})

    return () => clearInterval(poll)
  }, [])

  const leadActual = leads[indiceActual]

  useEffect(() => {
    setSegGestionActual(leadActual?.seguimientoEn ?? null)
    setMostrarTraspasoGestion(false)
  }, [leadActual?.id])

  const guardarSegGestion = (isoStr: string | null) => {
    if (!leadActual) return
    const esFuturo = isoStr && new Date(isoStr) > new Date()
    if (esFuturo) {
      setCronometroActivo(false)
      setLeadAbierto(false)
      setReporte('')
      setNuevoEstado('')
      setError('')
      setLeads(prev => prev.filter(l => l.id !== leadActual.id))
      setIndiceActual(i => Math.max(0, Math.min(i, leads.length - 2)))
    } else {
      setSegGestionActual(isoStr)
      setLeads(prev => prev.map(l => l.id === leadActual.id ? { ...l, seguimientoEn: isoStr } : l))
    }
    fetch(`/api/leads/${leadActual.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seguimientoEn: isoStr }),
    })
  }

  const confirmarTraspaso = () => {
    if (!modalTraspaso || !traspasoAgenteId || !motivoTraspaso.trim()) return
    const leadId = modalTraspaso.leadId
    const motivo = motivoTraspaso.trim()
    setLeads(prev => prev.filter(l => l.id !== leadId))
    setModalTraspaso(null)
    setTraspasoAgenteId('')
    setMotivoTraspaso('')
    setMostrarTraspasoGestion(false)
    fetch(`/api/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ traspasoAId: traspasoAgenteId, motivoTraspaso: motivo }),
    })
  }

  const abrirLead = () => {
    setLeadAbierto(true); setCronometroActivo(true)
    setReporte(''); setNuevoEstado(leadActual?.estado ?? ''); setError('')
  }

  const avanzarSiguiente = () => {
    setCronometroActivo(false); setLeadAbierto(false)
    setReporte(''); setNuevoEstado(''); setError('')
    setLeads(prev => prev.filter((_, i) => i !== indiceActual))
    setIndiceActual(i => Math.max(0, Math.min(i, leads.length - 2)))
  }

  const cerrarYPasar = async () => {
    if (!reporte.trim()) { setError('Tenés que completar el reporte antes de pasar al siguiente lead.'); return }
    if (nuevoEstado === 'convertido') {
      const sels = leadActual.mensaje ? parsearMensaje(leadActual.mensaje) : null
      const mascotaItem = sels?.find(s => s.label === 'Mascota')
      const especie = leadActual.mensaje
        ? (['perro', 'gato', 'conejo', 'hurón', 'ave', 'reptil'] as const).find(e => leadActual.mensaje!.toLowerCase().includes(e)) ?? ''
        : ''
      setModal(prev => ({ ...prev, abierto: true, dni: leadActual.dni ?? '', email: leadActual.email ?? '', mascotaNombre: mascotaItem?.value ?? '', mascotaEspecie: especie, modalidadRetiro: leadActual.pickupMethod ?? '' }))
      return
    }
    setEnviando(true)
    await fetch(`/api/leads/${leadActual.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado || leadActual.estado, nota: reporte }),
    })
    setEnviando(false)
    avanzarSiguiente()
  }

  const confirmarConversion = async () => {
    if (!modal.tipo) return
    setGuardandoConversion(true)
    await fetch(`/api/leads/${leadActual.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'convertido', nota: reporte }),
    })
    await fetch('/api/leads/convertir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leadId: leadActual.id, nombre: leadActual.nombre, apellido: modal.apellido,
        telefono: leadActual.telefono, dni: modal.dni || null, email: modal.email,
        localidad: modal.localidad, mascotaNombre: modal.mascotaNombre.trim() || null,
        mascotaEspecie: modal.mascotaNombre.trim() ? (modal.mascotaEspecie || 'perro') : null,
        tipo: modal.tipo,
        servicioConfigId: modal.tipo === 'servicio' ? modal.servicioConfigId || null : null,
        tipoPlan: modal.tipoPlan, notas: modal.notas,
        convenioId: modal.tipo === 'servicio' ? modal.convenioId || null : null,
        inventarioItemId: modal.tipo === 'servicio' ? modal.inventarioItemId || null : null,
        fechaRetiro: modal.tipo === 'servicio' ? modal.fechaRetiro || null : null,
        modalidadRetiro: modal.tipo === 'servicio' ? modal.modalidadRetiro || null : null,
      }),
    })
    setGuardandoConversion(false)
    setModal(modalInicial)
    avanzarSiguiente()
  }

  const seleccionesActual = leadActual?.mensaje ? parsearMensaje(leadActual.mensaje) : null

  return (
    <div className="page-container">

      {/* ── Modal Traspaso ── */}
      {modalTraspaso && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 28, maxWidth: 400, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Traspasar lead</h2>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 20px' }}>{modalTraspaso.leadNombre}</p>

            <p style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pasar a</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto', marginBottom: 20 }}>
              {agentes.filter(a => a.id !== me?.id).map(agente => (
                <button
                  key={agente.id}
                  onClick={() => setTraspasoAgenteId(agente.id)}
                  style={{
                    padding: '12px 16px', borderRadius: 12, border: '2px solid',
                    borderColor: traspasoAgenteId === agente.id ? '#2d8a54' : '#e5e7eb',
                    background: traspasoAgenteId === agente.id ? '#f0faf5' : 'white',
                    display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#374151', flexShrink: 0 }}>
                    {agente.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>{agente.nombre}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>{agente.rol}</p>
                  </div>
                  {traspasoAgenteId === agente.id && <span style={{ marginLeft: 'auto', color: '#2d8a54', fontSize: 16 }}>✓</span>}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Motivo del traspaso <span style={{ color: '#ef4444' }}>*</span></p>
              <textarea
                value={motivoTraspaso}
                onChange={e => setMotivoTraspaso(e.target.value)}
                placeholder="¿Por qué traspasás este lead? Ej: Me voy a almorzar, tiene acento del interior..."
                rows={3}
                style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                onClick={() => { setModalTraspaso(null); setTraspasoAgenteId(''); setMotivoTraspaso('') }}
                style={{ padding: '12px', borderRadius: 10, border: '1px solid #e5e7eb', background: 'white', color: '#374151', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarTraspaso}
                disabled={!traspasoAgenteId || !motivoTraspaso.trim()}
                style={{ padding: '12px', borderRadius: 10, border: 'none', background: traspasoAgenteId && motivoTraspaso.trim() ? '#2d8a54' : '#9ca3af', color: 'white', fontWeight: 600, fontSize: 14, cursor: traspasoAgenteId && motivoTraspaso.trim() ? 'pointer' : 'not-allowed' }}
              >
                Confirmar →
              </button>
            </div>
            <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 12, marginBottom: 0 }}>
              El traspaso queda registrado en el historial del lead.
            </p>
          </div>
        </div>
      )}

      {/* ── Modal Conversión ── */}
      {modal.abierto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, maxWidth: 520, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>🎉 ¡Convirtió! Crear cliente</h2>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 24px' }}>Completá los datos para crear el cliente y su servicio/plan.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Apellido</label>
                  <input type="text" placeholder="Apellido" value={modal.apellido} onChange={e => setModal(p => ({ ...p, apellido: e.target.value }))} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>DNI</label>
                  <input type="text" placeholder="12.345.678" value={modal.dni} onChange={e => setModal(p => ({ ...p, dni: e.target.value }))} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Email</label>
                  <input type="email" placeholder="Email" value={modal.email} onChange={e => setModal(p => ({ ...p, email: e.target.value }))} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Localidad</label>
                  <input type="text" placeholder="Ciudad" value={modal.localidad} onChange={e => setModal(p => ({ ...p, localidad: e.target.value }))} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Mascota <span style={{ fontWeight: 400, color: '#9ca3af' }}>(opcional)</span></label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10 }}>
                  <input type="text" placeholder="Nombre de la mascota" value={modal.mascotaNombre} onChange={e => setModal(p => ({ ...p, mascotaNombre: e.target.value }))} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' as const }} />
                  <select value={modal.mascotaEspecie} onChange={e => setModal(p => ({ ...p, mascotaEspecie: e.target.value }))} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', fontSize: 14, outline: 'none', background: 'white', minWidth: 110 }}>
                    <option value="">Especie...</option>
                    <option value="perro">🐕 Perro</option><option value="gato">🐈 Gato</option>
                    <option value="conejo">🐇 Conejo</option><option value="ave">🐦 Ave</option>
                    <option value="reptil">🦎 Reptil</option><option value="otro">Otro</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>¿Qué compró?</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button onClick={() => setModal(p => ({ ...p, tipo: 'servicio', tipoPlan: '' }))} style={{ padding: '12px', borderRadius: 10, border: '2px solid', borderColor: modal.tipo === 'servicio' ? '#111827' : '#e5e7eb', background: modal.tipo === 'servicio' ? '#111827' : 'white', color: modal.tipo === 'servicio' ? 'white' : '#374151', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Servicio</button>
                  <button onClick={() => setModal(p => ({ ...p, tipo: 'plan', servicioConfigId: '' }))} style={{ padding: '12px', borderRadius: 10, border: '2px solid', borderColor: modal.tipo === 'plan' ? '#111827' : '#e5e7eb', background: modal.tipo === 'plan' ? '#111827' : 'white', color: modal.tipo === 'plan' ? 'white' : '#374151', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Plan</button>
                </div>
              </div>
              {modal.tipo === 'servicio' && (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Servicio</label>
                  <select value={modal.servicioConfigId} onChange={e => { const v = e.target.value; const sig = !modal.convenioId || convenioAplica(conveniosActivos.find(c => c.id === modal.convenioId)!, v); setModal(p => ({ ...p, servicioConfigId: v, convenioId: sig ? p.convenioId : '' })) }} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', fontSize: 14, outline: 'none', background: 'white' }}>
                    <option value="">Seleccioná...</option>
                    {serviciosConfig.map(s => <option key={s.id} value={s.id}>{s.nombre}{s.precio ? ` — $${Number(s.precio).toLocaleString('es-AR')}` : ' — Consultar'}</option>)}
                  </select>
                </div>
              )}
              {modal.tipo === 'plan' && (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Plan</label>
                  <select value={modal.tipoPlan} onChange={e => setModal(p => ({ ...p, tipoPlan: e.target.value }))} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', fontSize: 14, outline: 'none', background: 'white' }}>
                    <option value="">Seleccioná...</option>
                    {planesConfig.map(p => <option key={p.id} value={p.id}>{p.nombre} — ${Number(p.cuotaMensual).toLocaleString('es-AR')}/mes</option>)}
                  </select>
                </div>
              )}
              {modal.tipo === 'servicio' && (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Producto / Urna <span style={{ fontWeight: 400, color: '#9ca3af' }}>(opcional)</span></label>
                  <SelectorProducto value={modal.inventarioItemId} onChange={v => setModal(p => ({ ...p, inventarioItemId: v }))} items={inventarioItems} />
                </div>
              )}
              {modal.tipo === 'servicio' && (
                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 14 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 10 }}>Retiro</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <button type="button" onClick={() => setModal(p => ({ ...p, modalidadRetiro: 'sucursal' }))} style={{ padding: '10px', borderRadius: 10, border: '2px solid', borderColor: modal.modalidadRetiro === 'sucursal' ? '#2d8a54' : '#e5e7eb', background: modal.modalidadRetiro === 'sucursal' ? '#f0faf5' : 'white', color: modal.modalidadRetiro === 'sucursal' ? '#2d8a54' : '#374151', fontWeight: modal.modalidadRetiro === 'sucursal' ? 700 : 400, fontSize: 13, cursor: 'pointer' }}>🏠 El cliente trae la mascota</button>
                    <button type="button" onClick={() => setModal(p => ({ ...p, modalidadRetiro: 'domicilio' }))} style={{ padding: '10px', borderRadius: 10, border: '2px solid', borderColor: modal.modalidadRetiro === 'domicilio' ? '#2d8a54' : '#e5e7eb', background: modal.modalidadRetiro === 'domicilio' ? '#f0faf5' : 'white', color: modal.modalidadRetiro === 'domicilio' ? '#2d8a54' : '#374151', fontWeight: modal.modalidadRetiro === 'domicilio' ? 700 : 400, fontSize: 13, cursor: 'pointer' }}>🚗 Retiro a domicilio</button>
                  </div>
                  <input type="datetime-local" value={modal.fechaRetiro} onChange={e => setModal(p => ({ ...p, fechaRetiro: e.target.value }))} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const }} />
                </div>
              )}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Notas adicionales</label>
                <textarea placeholder="Detalles de la venta..." value={modal.notas} onChange={e => setModal(p => ({ ...p, notas: e.target.value }))} rows={3} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              {modal.tipo === 'servicio' && (() => {
                const aplicables = conveniosActivos.filter(c => convenioAplica(c, modal.servicioConfigId))
                if (aplicables.length === 0) return null
                return (
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>¿Vino por convenio? <span style={{ fontWeight: 400, color: '#9ca3af' }}>(opcional)</span></label>
                    <select value={modal.convenioId} onChange={e => setModal(p => ({ ...p, convenioId: e.target.value }))} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', fontSize: 14, outline: 'none', background: 'white' }}>
                      <option value="">Sin convenio</option>
                      {aplicables.map(c => <option key={c.id} value={c.id}>{c.nombre}{c.descuentoPorcentaje && Number(c.descuentoPorcentaje) > 0 ? ` (${c.descuentoPorcentaje}% com.)` : ''}</option>)}
                    </select>
                  </div>
                )
              })()}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                <button onClick={() => setModal(modalInicial)} style={{ padding: '12px', borderRadius: 10, border: '1px solid #e5e7eb', background: 'white', color: '#374151', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Cancelar</button>
                <button onClick={confirmarConversion} disabled={!modal.tipo || guardandoConversion} style={{ padding: '12px', borderRadius: 10, border: 'none', background: !modal.tipo ? '#9ca3af' : '#15803d', color: 'white', fontWeight: 600, fontSize: 14, cursor: !modal.tipo ? 'not-allowed' : 'pointer' }}>
                  {guardandoConversion ? 'Guardando...' : 'Crear cliente ✓'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>Gestión</h1>
          {me && <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Hola, {me.nombre}</p>}
        </div>
        {leads.length > 0 && (
          <span style={{ background: '#f3f4f6', color: '#374151', borderRadius: 999, padding: '4px 14px', fontSize: 13, fontWeight: 600 }}>
            {leads.length} pendiente{leads.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading ? (
        <p style={{ color: '#9ca3af' }}>Cargando leads...</p>
      ) : leads.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>¡Sin leads pendientes!</p>
          <p style={{ fontSize: 14 }}>Todos tus leads están gestionados.</p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Lead {indiceActual + 1} de {leads.length} pendientes</p>
          </div>

          <div style={{ background: '#f3f4f6', borderRadius: 999, height: 6, marginBottom: 28 }}>
            <div style={{ background: '#111827', height: 6, borderRadius: 999, width: `${(indiceActual / leads.length) * 100}%`, transition: 'width 0.3s' }} />
          </div>

          {!leadAbierto ? (
            <div style={{ maxWidth: 520, margin: '0 auto' }}>
              <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f3f4f6', padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>👤</div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>{leadActual?.nombre}</h2>
                <p style={{ fontSize: 15, color: '#6b7280', margin: '0 0 4px' }}>{leadActual?.telefono}</p>
                {leadActual?.email && <p style={{ fontSize: 14, color: '#9ca3af', margin: '0 0 16px' }}>{leadActual.email}</p>}
                {leadActual?.origen && <span style={{ fontSize: 12, background: '#f3f4f6', color: '#6b7280', padding: '4px 12px', borderRadius: 20 }}>{leadActual.origen}</span>}
                {leadActual?.seguimientoEn && (() => {
                  const seg = badgeSeguimiento(leadActual.seguimientoEn)
                  return seg ? (
                    <div style={{ marginTop: 12 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 999, color: seg.color, background: seg.bg }}>
                        <IcoTelefono size={11} />Seguimiento {seg.texto}
                      </span>
                    </div>
                  ) : null
                })()}
                {seleccionesActual && (
                  <div style={{ marginTop: 20, textAlign: 'left' }}>
                    <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Seleccionó en el cotizador</p>
                    {seleccionesActual.map((s, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f0f9ff', borderRadius: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: '#6b7280' }}>{s.label}</span>
                        <span style={{ fontSize: 13, color: '#0369a1', fontWeight: 600 }}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={abrirLead} style={{ marginTop: 28, width: '100%', background: '#111827', color: 'white', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                  Iniciar gestión →
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 900, margin: '0 auto' }}>

              {/* ── Columna izquierda ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: 24, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Tiempo en este lead</p>
                  <Cronometro iniciado={cronometroActivo} />
                </div>

                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 14px' }}>Datos de contacto</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}><span style={{ color: '#9ca3af' }}>Nombre</span><span style={{ fontWeight: 600 }}>{leadActual.nombre}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}><span style={{ color: '#9ca3af' }}>Teléfono</span><span style={{ fontWeight: 600 }}>{leadActual.telefono}</span></div>
                    {leadActual.dni && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}><span style={{ color: '#9ca3af' }}>DNI</span><span style={{ fontWeight: 600 }}>{leadActual.dni}</span></div>}
                    {leadActual.email && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}><span style={{ color: '#9ca3af' }}>Email</span><span style={{ fontWeight: 600 }}>{leadActual.email}</span></div>}
                  </div>
                  <button
                    onClick={() => window.open(`https://wa.me/549${leadActual.telefono.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(leadActual.nombre)}%2C%20te%20contactamos%20de%20Huellas%20de%20Paz`, 'whatsapp', 'width=480,height=700,top=100,left=100')}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, background: '#25D366', color: 'white', borderRadius: 10, padding: '10px', fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none', width: '100%' }}
                  >
                    💬 Contactar por WhatsApp
                  </button>
                  {leadActual.email && <EmailLeadForm leadId={leadActual.id} emailDestinatario={leadActual.email} nombreDestinatario={leadActual.nombre} />}
                </div>

                {seleccionesActual && (
                  <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e0f2fe', padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 14px' }}>🐾 Lo que seleccionó</h3>
                    {seleccionesActual.map((s, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f0f9ff', borderRadius: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: '#6b7280' }}>{s.label}</span>
                        <span style={{ fontSize: 13, color: '#0369a1', fontWeight: 600 }}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 6 }}><IcoTelefono size={14} />Programar devolución</h3>
                  <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 14px' }}>¿Te dijo que te llame más tarde?</p>

                  {segGestionActual && (
                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '8px 12px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#92400e' }}>
                        Llamar a las {new Date(segGestionActual).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button onClick={() => guardarSegGestion(null)} style={{ fontSize: 11, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        Cancelar
                      </button>
                    </div>
                  )}

                  {/* Input libre — opción principal */}
                  <div style={{ display: 'flex', gap: 7, marginBottom: 12 }}>
                    <input
                      type="datetime-local"
                      value={segPersonalizado}
                      onChange={e => setSegPersonalizado(e.target.value)}
                      style={{ flex: 1, border: '1.5px solid #e5e7eb', borderRadius: 9, padding: '8px 11px', fontSize: 13, outline: 'none', minWidth: 0 }}
                    />
                    <button
                      onClick={() => { if (segPersonalizado) { guardarSegGestion(new Date(segPersonalizado).toISOString()); setSegPersonalizado('') } }}
                      disabled={!segPersonalizado}
                      style={{ padding: '8px 14px', borderRadius: 9, border: 'none', background: segPersonalizado ? '#111827' : '#e5e7eb', color: segPersonalizado ? 'white' : '#9ca3af', fontSize: 12, fontWeight: 600, cursor: segPersonalizado ? 'pointer' : 'not-allowed', flexShrink: 0 }}
                    >
                      OK
                    </button>
                  </div>

                  {/* Atajos rápidos */}
                  <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 7px' }}>Atajos rápidos</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                    {TIEMPOS_RAPIDOS.map(t => (
                      <button
                        key={t.label}
                        onClick={() => guardarSegGestion(t.fn())}
                        style={{ padding: '8px 10px', borderRadius: 9, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* ── Columna derecha ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 14px' }}>Resultado de la gestión</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {ESTADOS_GESTION.map(e => (
                      <button key={e.id} onClick={() => setNuevoEstado(e.id)} style={{ padding: '10px 16px', borderRadius: 10, border: '2px solid', borderColor: nuevoEstado === e.id ? e.color : '#f3f4f6', background: nuevoEstado === e.id ? e.color + '15' : 'white', color: nuevoEstado === e.id ? e.color : '#6b7280', fontWeight: nuevoEstado === e.id ? 700 : 400, fontSize: 14, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                        {e.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ background: 'white', borderRadius: 16, border: error ? '1px solid #fca5a5' : '1px solid #f3f4f6', padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>Reporte de la gestión <span style={{ color: '#ef4444' }}>*</span></h3>
                  <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 12px' }}>Obligatorio para pasar al siguiente lead</p>
                  <textarea value={reporte} onChange={e => { setReporte(e.target.value); setError('') }} placeholder="¿Qué pasó? ¿Atendió? ¿Qué dijo? ¿Quedó algo pendiente?" rows={5} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px', fontSize: 14, resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                  {error && <p style={{ fontSize: 13, color: '#ef4444', margin: '8px 0 0' }}>{error}</p>}
                </div>

                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 6 }}><IcoTraspaso size={14} />Traspasar lead</h3>
                  <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 12px' }}>¿Tenés que irte? Pasale el lead a una compañera.</p>
                  {!mostrarTraspasoGestion ? (
                    <button
                      onClick={() => setMostrarTraspasoGestion(true)}
                      style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                    >
                      Seleccionar agente →
                    </button>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {agentes.filter(a => a.id !== me?.id).map(ag => (
                        <button
                          key={ag.id}
                          onClick={() => { setModalTraspaso({ leadId: leadActual.id, leadNombre: leadActual.nombre }); setTraspasoAgenteId(ag.id) }}
                          style={{ padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10 }}
                        >
                          <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#f3f4f6', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                            {ag.nombre.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </span>
                          {ag.nombre}
                        </button>
                      ))}
                      <button onClick={() => setMostrarTraspasoGestion(false)} style={{ fontSize: 12, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>Cancelar</button>
                    </div>
                  )}
                </div>

                <button onClick={cerrarYPasar} disabled={enviando} style={{ background: enviando ? '#9ca3af' : '#111827', color: 'white', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 600, cursor: enviando ? 'not-allowed' : 'pointer', width: '100%' }}>
                  {enviando ? 'Guardando...' : nuevoEstado === 'convertido' ? 'Siguiente: crear cliente →' : indiceActual < leads.length - 1 ? 'Guardar y pasar al siguiente →' : 'Guardar y finalizar ✓'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
