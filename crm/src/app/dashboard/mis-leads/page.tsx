'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

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

const ESTADOS = [
  { id: 'nuevo', label: 'Nuevo', color: '#1d4ed8' },
  { id: 'contactado', label: 'Contactado', color: '#15803d' },
  { id: 'interesado', label: 'Interesado', color: '#a16207' },
  { id: 'cotizado', label: 'Cotizado', color: '#7e22ce' },
  { id: 'convertido', label: 'Convertido', color: '#15803d' },
  { id: 'perdido', label: 'Perdido', color: '#dc2626' },
]

function parsearMensaje(mensaje: string): { label: string; value: string }[] | null {
  if (!mensaje || !mensaje.includes(' · ')) return null
  const partes = mensaje.split(' · ')
  return partes.map(parte => {
    if (parte.startsWith('Zona:')) return { label: 'Zona', value: parte.replace('Zona: ', '') }
    if (parte.startsWith('Mascota:')) return { label: 'Mascota', value: parte.replace('Mascota: ', '') }
    if (['HUELLITAS', 'AMIGOS PARA SIEMPRE', 'AMIGOS DE VERDAD'].some(s => parte.includes(s))) return { label: 'Servicio', value: parte }
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

export default function MisLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [indiceActual, setIndiceActual] = useState(0)
  const [leadAbierto, setLeadAbierto] = useState(false)
  const [cronometroActivo, setCronometroActivo] = useState(false)
  const [reporte, setReporte] = useState('')
  const [nuevoEstado, setNuevoEstado] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetch('/api/leads?misLeads=true')
      .then(r => r.json())
      .then(data => {
        const activos = data.filter((l: Lead) => l.estado !== 'convertido' && l.estado !== 'perdido')
        setLeads(activos)
        setLoading(false)
      })
  }, [])

  const leadActual = leads[indiceActual]

  const abrirLead = () => {
    setLeadAbierto(true)
    setCronometroActivo(true)
    setReporte('')
    setNuevoEstado(leadActual?.estado ?? '')
    setError('')
  }

  const cerrarYPasar = async () => {
    if (!reporte.trim()) {
      setError('Tenés que completar el reporte antes de pasar al siguiente lead.')
      return
    }
    setEnviando(true)

    // Guardar nota/reporte
    await fetch(`/api/leads/${leadActual.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estado: nuevoEstado || leadActual.estado,
        nota: reporte,
      }),
    })

    setCronometroActivo(false)
    setLeadAbierto(false)
    setReporte('')
    setNuevoEstado('')
    setError('')
    setEnviando(false)

    // Actualizar lista local
    setLeads(prev => prev.map(l =>
      l.id === leadActual.id ? { ...l, estado: nuevoEstado || l.estado } : l
    ).filter(l => l.estado !== 'convertido' && l.estado !== 'perdido'))

    // Pasar al siguiente
    setIndiceActual(i => Math.min(i + 1, leads.length - 1))
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
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>Mis leads</h1>
        <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
          Lead {indiceActual + 1} de {leads.length} pendientes
        </p>
      </div>

      {/* Barra de progreso */}
      <div style={{ background: '#f3f4f6', borderRadius: 999, height: 6, marginBottom: 28 }}>
        <div style={{
          background: '#111827',
          height: 6,
          borderRadius: 999,
          width: `${((indiceActual) / leads.length) * 100}%`,
          transition: 'width 0.3s',
        }} />
      </div>

      {!leadAbierto ? (
        /* Vista previa del lead */
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f3f4f6', padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>👤</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>{leadActual?.nombre}</h2>
            <p style={{ fontSize: 15, color: '#6b7280', margin: '0 0 4px' }}>{leadActual?.telefono}</p>
            {leadActual?.email && <p style={{ fontSize: 14, color: '#9ca3af', margin: '0 0 16px' }}>{leadActual.email}</p>}
            {leadActual?.origen && (
              <span style={{ fontSize: 12, background: '#f3f4f6', color: '#6b7280', padding: '4px 12px', borderRadius: 20 }}>
                {leadActual.origen}
              </span>
            )}

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

            <button
              onClick={abrirLead}
              style={{
                marginTop: 28, width: '100%', background: '#111827', color: 'white',
                border: 'none', borderRadius: 12, padding: '14px', fontSize: 15,
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              Iniciar gestión →
            </button>
          </div>
        </div>
      ) : (
        /* Vista de trabajo */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 900, margin: '0 auto' }}>

          {/* Columna izquierda — info del lead */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Cronómetro */}
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: 24, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Tiempo en este lead</p>
              <Cronometro iniciado={cronometroActivo} />
            </div>

            {/* Datos del lead */}
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

              {/* Botón WhatsApp */}
              <a
                href={`https://wa.me/549${leadActual.telefono.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(leadActual.nombre)}%2C%20te%20contactamos%20de%20Huellas%20de%20Paz`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  marginTop: 16, background: '#25D366', color: 'white', borderRadius: 10,
                  padding: '10px', fontSize: 14, fontWeight: 600, textDecoration: 'none',
                }}
              >
                💬 Contactar por WhatsApp
              </a>
            </div>

            {/* Selecciones cotizador */}
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

          {/* Columna derecha — reporte */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Cambiar estado */}
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

            {/* Reporte obligatorio */}
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
                style={{
                  width: '100%', border: '1px solid #e5e7eb', borderRadius: 10,
                  padding: '12px', fontSize: 14, resize: 'vertical',
                  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                }}
              />
              {error && <p style={{ fontSize: 13, color: '#ef4444', margin: '8px 0 0' }}>{error}</p>}
            </div>

            {/* Botón cerrar */}
            <button
              onClick={cerrarYPasar}
              disabled={enviando}
              style={{
                background: enviando ? '#9ca3af' : '#111827',
                color: 'white', border: 'none', borderRadius: 12,
                padding: '14px', fontSize: 15, fontWeight: 600,
                cursor: enviando ? 'not-allowed' : 'pointer', width: '100%',
              }}
            >
              {enviando ? 'Guardando...' : indiceActual < leads.length - 1 ? 'Guardar y pasar al siguiente →' : 'Guardar y finalizar ✓'}
            </button>

          </div>
        </div>
      )}
    </div>
  )
}