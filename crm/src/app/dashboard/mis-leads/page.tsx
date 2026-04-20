'use client'

import { useState, useEffect, useRef } from 'react'
import { EmailLeadForm } from '@/components/leads/EmailLeadForm'

type Lead = {
  id: string
  nombre: string
  telefono: string
  email: string | null
  origen: string | null
  estado: string
  mensaje: string | null
  creadoEn: string
}

type PlanConfig = {
  id: string
  nombre: string
  cuotaMensual: string
  activo: boolean
}

type ModalConversion = {
  abierto: boolean
  tipo: 'servicio' | 'plan' | ''
  apellido: string
  email: string
  localidad: string
  tipoServicio: string
  tipoPlan: string
  notas: string
}

const ESTADOS = [
  { id: 'nuevo', label: 'Nuevo', color: '#1d4ed8' },
  { id: 'contactado', label: 'Contactado', color: '#15803d' },
  { id: 'interesado', label: 'Interesado', color: '#a16207' },
  { id: 'cotizado', label: 'Cotizado', color: '#7e22ce' },
  { id: 'convertido', label: '✓ Convirtió — crear cliente', color: '#15803d' },
  { id: 'perdido', label: 'Perdido', color: '#dc2626' },
]

const TIPOS_SERVICIO = [
  { id: 'cremacion_individual', label: 'Cremación individual' },
  { id: 'cremacion_comunitaria', label: 'Cremación comunitaria' },
  { id: 'jardin_del_recuerdo', label: 'Jardín del Recuerdo' },
]

function parsearMensaje(mensaje: string): { label: string; value: string }[] | null {
  if (!mensaje || !mensaje.includes(' · ')) return null
  const partes = mensaje.split(' · ')
  return partes.map(parte => {
    if (parte.startsWith('Zona:')) return { label: 'Zona', value: parte.replace('Zona: ', '') }
    if (parte.startsWith('Mascota:')) return { label: 'Mascota', value: parte.replace('Mascota: ', '') }
    if (['HUELLITAS', 'AMIGOS PARA SIEMPRE', 'AMIGOS DE VERDAD', 'COMPAÑEROS', 'SIEMPRE JUNTOS'].some(s => parte.toUpperCase().includes(s))) return { label: 'Servicio', value: parte }
    if (['PEQUEÑO', 'MEDIANO', 'GRANDE', 'EXTRA GRANDE'].some(s => parte.toUpperCase().includes(s))) return { label: 'Tamaño', value: parte }
    if (['TRAERLA', 'RETIREN', 'SUCURSAL', 'DOMICILIO'].some(s => parte.toUpperCase().includes(s))) return { label: 'Retiro', value: parte }
    return { label: 'Detalle', value: parte }
  })
}

function Cronometro({ iniciado }: { iniciado: boolean }) {
  const [segundos, setSegundos] = useState(0)
  const ref = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (iniciado) {
      ref.current = setInterval(() => setSegundos(s => s + 1), 1000)
    } else {
      if (ref.current) clearInterval(ref.current)
    }
    return () => { if (ref.current) clearInterval(ref.current) }
  }, [iniciado])

  const hh = Math.floor(segundos / 3600).toString().padStart(2, '0')
  const mm = Math.floor((segundos % 3600) / 60).toString().padStart(2, '0')
  const ss = (segundos % 60).toString().padStart(2, '0')

  return (
    <div style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 700, color: iniciado ? '#111827' : '#9ca3af', letterSpacing: 2 }}>
      {hh}:{mm}:{ss}
    </div>
  )
}

const modalInicial: ModalConversion = {
  abierto: false, tipo: '', apellido: '', email: '',
  localidad: '', tipoServicio: '', tipoPlan: '', notas: '',
}

export default function MisLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [planesConfig, setPlanesConfig] = useState<PlanConfig[]>([])
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

  useEffect(() => {
    fetch('/api/leads?misLeads=true')
      .then(r => r.json())
      .then(data => {
        const activos = data.filter((l: Lead) => l.estado !== 'convertido' && l.estado !== 'perdido')
        setLeads(activos)
        setLoading(false)
      })

    fetch('/api/configuracion/planes')
      .then(r => r.json())
      .then(data => setPlanesConfig(data.filter((p: PlanConfig) => p.activo)))
  }, [])

  const leadActual = leads[indiceActual]

  const abrirLead = () => {
    setLeadAbierto(true)
    setCronometroActivo(true)
    setReporte('')
    setNuevoEstado(leadActual?.estado ?? '')
    setError('')
  }

  const avanzarSiguiente = () => {
    setCronometroActivo(false)
    setLeadAbierto(false)
    setReporte('')
    setNuevoEstado('')
    setError('')
    setLeads(prev => prev.filter((_, i) => i !== indiceActual))
    setIndiceActual(i => Math.max(0, Math.min(i, leads.length - 2)))
  }

  const cerrarYPasar = async () => {
    if (!reporte.trim()) {
      setError('Tenés que completar el reporte antes de pasar al siguiente lead.')
      return
    }

    if (nuevoEstado === 'convertido') {
      setModal(prev => ({ ...prev, abierto: true, email: leadActual.email ?? '' }))
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
        leadId: leadActual.id,
        nombre: leadActual.nombre,
        apellido: modal.apellido,
        telefono: leadActual.telefono,
        email: modal.email,
        localidad: modal.localidad,
        tipo: modal.tipo,
        tipoServicio: modal.tipoServicio,
        tipoPlan: modal.tipoPlan,
        notas: modal.notas,
      }),
    })

    setGuardandoConversion(false)
    setModal(modalInicial)
    avanzarSiguiente()
  }

  if (loading) return <div className="page-container"><p style={{ color: '#9ca3af' }}>Cargando leads...</p></div>

  if (leads.length === 0) return (
    <div className="page-container">
      <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', marginBottom: 8 }}>Mis leads</h1>
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
        <p style={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>¡Sin leads pendientes!</p>
        <p style={{ fontSize: 14 }}>Todos tus leads están gestionados.</p>
      </div>
    </div>
  )

  const selecciones = leadActual?.mensaje ? parsearMensaje(leadActual.mensaje) : null

  return (
    <div className="page-container">

      {/* Modal de conversión */}
      {modal.abierto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, maxWidth: 520, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>🎉 ¡Convirtió! Crear cliente</h2>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 24px' }}>Completá los datos para crear el cliente y su servicio/plan.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Apellido</label>
                <input type="text" placeholder="Apellido" value={modal.apellido} onChange={e => setModal(p => ({ ...p, apellido: e.target.value }))} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
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
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>¿Qué compró?</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button onClick={() => setModal(p => ({ ...p, tipo: 'servicio', tipoPlan: '' }))} style={{ padding: '12px', borderRadius: 10, border: '2px solid', borderColor: modal.tipo === 'servicio' ? '#111827' : '#e5e7eb', background: modal.tipo === 'servicio' ? '#111827' : 'white', color: modal.tipo === 'servicio' ? 'white' : '#374151', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Servicio</button>
                  <button onClick={() => setModal(p => ({ ...p, tipo: 'plan', tipoServicio: '' }))} style={{ padding: '12px', borderRadius: 10, border: '2px solid', borderColor: modal.tipo === 'plan' ? '#111827' : '#e5e7eb', background: modal.tipo === 'plan' ? '#111827' : 'white', color: modal.tipo === 'plan' ? 'white' : '#374151', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Plan</button>
                </div>
              </div>
              {modal.tipo === 'servicio' && (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Tipo de servicio</label>
                  <select value={modal.tipoServicio} onChange={e => setModal(p => ({ ...p, tipoServicio: e.target.value }))} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', fontSize: 14, outline: 'none', background: 'white' }}>
                    <option value="">Seleccioná...</option>
                    {TIPOS_SERVICIO.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
              )}
              {modal.tipo === 'plan' && (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Plan</label>
                  <select value={modal.tipoPlan} onChange={e => setModal(p => ({ ...p, tipoPlan: e.target.value }))} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', fontSize: 14, outline: 'none', background: 'white' }}>
                    <option value="">Seleccioná...</option>
                    {planesConfig.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} — ${Number(p.cuotaMensual).toLocaleString('es-AR')}/mes
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Notas adicionales</label>
                <textarea placeholder="Detalles de la venta..." value={modal.notas} onChange={e => setModal(p => ({ ...p, notas: e.target.value }))} rows={3} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
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

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>Mis leads</h1>
        <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Lead {indiceActual + 1} de {leads.length} pendientes</p>
      </div>

      {/* Barra de progreso */}
      <div style={{ background: '#f3f4f6', borderRadius: 999, height: 6, marginBottom: 28 }}>
        <div style={{ background: '#111827', height: 6, borderRadius: 999, width: `${((indiceActual) / leads.length) * 100}%`, transition: 'width 0.3s' }} />
      </div>

      {!leadAbierto ? (
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f3f4f6', padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>👤</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>{leadActual?.nombre}</h2>
            <p style={{ fontSize: 15, color: '#6b7280', margin: '0 0 4px' }}>{leadActual?.telefono}</p>
            {leadActual?.email && <p style={{ fontSize: 14, color: '#9ca3af', margin: '0 0 16px' }}>{leadActual.email}</p>}
            {leadActual?.origen && <span style={{ fontSize: 12, background: '#f3f4f6', color: '#6b7280', padding: '4px 12px', borderRadius: 20 }}>{leadActual.origen}</span>}
            {selecciones && (
              <div style={{ marginTop: 20, textAlign: 'left' }}>
                <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Seleccionó en el cotizador</p>
                {selecciones.map((s, i) => (
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

          {/* Columna izquierda */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: 24, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Tiempo en este lead</p>
              <Cronometro iniciado={cronometroActivo} />
            </div>

            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 14px' }}>Datos de contacto</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: '#9ca3af' }}>Nombre</span>
                  <span style={{ fontWeight: 600 }}>{leadActual.nombre}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: '#9ca3af' }}>Teléfono</span>
                  <span style={{ fontWeight: 600 }}>{leadActual.telefono}</span>
                </div>
                {leadActual.email && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span style={{ color: '#9ca3af' }}>Email</span>
                    <span style={{ fontWeight: 600 }}>{leadActual.email}</span>
                  </div>
                )}
              </div>

              <a
                href={`https://wa.me/549${leadActual.telefono.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(leadActual.nombre)}%2C%20te%20contactamos%20de%20Huellas%20de%20Paz`}
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, background: '#25D366', color: 'white', borderRadius: 10, padding: '10px', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
              >
                💬 Contactar por WhatsApp
              </a>

              {leadActual.email && (
                <EmailLeadForm
                  leadId={leadActual.id}
                  emailDestinatario={leadActual.email}
                  nombreDestinatario={leadActual.nombre}
                />
              )}
            </div>

            {selecciones && (
              <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e0f2fe', padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 14px' }}>🐾 Lo que seleccionó</h3>
                {selecciones.map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f0f9ff', borderRadius: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: '#6b7280' }}>{s.label}</span>
                    <span style={{ fontSize: 13, color: '#0369a1', fontWeight: 600 }}>{s.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Columna derecha */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 14px' }}>Resultado de la gestión</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ESTADOS.map(e => (
                  <button
                    key={e.id}
                    onClick={() => setNuevoEstado(e.id)}
                    style={{
                      padding: '10px 16px', borderRadius: 10, border: '2px solid',
                      borderColor: nuevoEstado === e.id ? e.color : '#f3f4f6',
                      background: nuevoEstado === e.id ? e.color + '15' : 'white',
                      color: nuevoEstado === e.id ? e.color : '#6b7280',
                      fontWeight: nuevoEstado === e.id ? 700 : 400,
                      fontSize: 14, cursor: 'pointer', textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 16, border: error ? '1px solid #fca5a5' : '1px solid #f3f4f6', padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>
                Reporte de la gestión <span style={{ color: '#ef4444' }}>*</span>
              </h3>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 12px' }}>Obligatorio para pasar al siguiente lead</p>
              <textarea
                value={reporte}
                onChange={e => { setReporte(e.target.value); setError('') }}
                placeholder="¿Qué pasó? ¿Atendió? ¿Qué dijo? ¿Quedó algo pendiente?"
                rows={5}
                style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px', fontSize: 14, resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
              {error && <p style={{ fontSize: 13, color: '#ef4444', margin: '8px 0 0' }}>{error}</p>}
            </div>

            <button
              onClick={cerrarYPasar}
              disabled={enviando}
              style={{ background: enviando ? '#9ca3af' : '#111827', color: 'white', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 600, cursor: enviando ? 'not-allowed' : 'pointer', width: '100%' }}
            >
              {enviando ? 'Guardando...' : nuevoEstado === 'convertido' ? 'Siguiente: crear cliente →' : indiceActual < leads.length - 1 ? 'Guardar y pasar al siguiente →' : 'Guardar y finalizar ✓'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}