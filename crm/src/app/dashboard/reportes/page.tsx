'use client'

import { useState, useEffect, useCallback } from 'react'
import { GraficoPie } from '@/components/dashboard/GraficoPie'

type Metrica = { valor: number; delta: number }

type Datos = {
  periodo: { desde: string; hasta: string }
  metricas: {
    clientes: Metrica
    servicios: Metrica
    serviciosEntregados: Metrica
    leads: Metrica
    leadsConvertidos: Metrica
    conversion: Metrica
  }
  planes: { activos: number; gananciaCobrada: number; deudaPendiente: number }
  serviciosFinancieros: { gananciaCobrada: number; deudaPendiente: number }
  serviciosPorTipo: { tipo: string; count: number }[]
  leadsPorOrigen: { origen: string | null; count: number }[]
  leadsPorEstado: { estado: string; count: number }[]
  leadsPorConvenio: { nombre: string; tipo: string; count: number }[]
}

const PERIODOS = [
  { id: 'este_mes', label: 'Este mes' },
  { id: 'mes_pasado', label: 'Mes pasado' },
  { id: 'ultimos_3', label: 'Últimos 3 meses' },
  { id: 'ultimos_6', label: 'Últimos 6 meses' },
  { id: 'este_anio', label: 'Este año' },
  { id: 'personalizado', label: 'Personalizado' },
]

function calcularRango(periodo: string): { desde: Date; hasta: Date } {
  const ahora = new Date()
  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 23, 59, 59)
  switch (periodo) {
    case 'este_mes':
      return { desde: new Date(ahora.getFullYear(), ahora.getMonth(), 1), hasta: hoy }
    case 'mes_pasado': {
      const desde = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1)
      const hasta = new Date(ahora.getFullYear(), ahora.getMonth(), 0, 23, 59, 59)
      return { desde, hasta }
    }
    case 'ultimos_3':
      return { desde: new Date(ahora.getFullYear(), ahora.getMonth() - 2, 1), hasta: hoy }
    case 'ultimos_6':
      return { desde: new Date(ahora.getFullYear(), ahora.getMonth() - 5, 1), hasta: hoy }
    case 'este_anio':
      return { desde: new Date(ahora.getFullYear(), 0, 1), hasta: hoy }
    default:
      return { desde: new Date(ahora.getFullYear(), ahora.getMonth(), 1), hasta: hoy }
  }
}

function Delta({ valor }: { valor: number }) {
  if (valor === 0) return <span style={{ fontSize: 12, color: '#9ca3af' }}>sin cambio</span>
  const sube = valor > 0
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 600, color: sube ? '#15803d' : '#dc2626' }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        {sube
          ? <><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></>
          : <><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></>
        }
      </svg>
      {Math.abs(valor)}% vs período anterior
    </span>
  )
}

function KPI({
  titulo,
  valor,
  delta,
  formato = 'numero',
  accent,
}: {
  titulo: string
  valor: number
  delta: number
  formato?: 'numero' | 'porcentaje' | 'moneda'
  accent?: boolean
}) {
  const display =
    formato === 'porcentaje' ? `${valor}%` :
    formato === 'moneda' ? `$${valor.toLocaleString('es-AR')}` :
    valor.toLocaleString('es-AR')

  return (
    <div style={{
      background: accent ? '#111827' : 'white',
      borderRadius: 16,
      border: `1px solid ${accent ? 'transparent' : '#f0f0f0'}`,
      padding: '24px 26px',
      boxShadow: accent ? '0 4px 20px rgba(0,0,0,0.12)' : '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: accent ? 'rgba(255,255,255,0.45)' : '#9ca3af', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        {titulo}
      </p>
      <p style={{ fontSize: 34, fontWeight: 700, color: accent ? 'white' : '#111827', margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: 1 }}>
        {display}
      </p>
      <Delta valor={delta} />
    </div>
  )
}

const CANALES = [
  { key: 'whatsapp',    label: 'WhatsApp',         emoji: '💬', color: '#25D366' },
  { key: 'instagram',   label: 'Instagram',        emoji: '📸', color: '#E1306C' },
  { key: 'landing',     label: 'Página web',       emoji: '🌐', color: '#2d8a54' },
  { key: 'telefono',    label: 'Teléfono',         emoji: '📞', color: '#2563eb' },
  { key: 'directo',     label: 'Contacto directo', emoji: '🚶', color: '#374151' },
  { key: 'veterinaria', label: 'Convenio',         emoji: '🏥', color: '#d97706' },
  { key: 'cotizador',   label: 'Cotizador web',    emoji: '🧮', color: '#6b7280' },
]

const labelServicio: Record<string, string> = {
  cremacion_individual: 'Cremación individual',
  cremacion_comunitaria: 'Cremación comunitaria',
  entierro: 'Entierro',
}

const coloresServicio: Record<string, string> = {
  cremacion_individual: '#111827',
  cremacion_comunitaria: '#374151',
  entierro: '#2d8a54',
}

export default function ReportesPage() {
  const [periodo, setPeriodo] = useState('este_mes')
  const [desdeCustom, setDesdeCustom] = useState('')
  const [hastaCustom, setHastaCustom] = useState('')
  const [datos, setDatos] = useState<Datos | null>(null)
  const [loading, setLoading] = useState(true)

  const cargarDatos = useCallback(async () => {
    setLoading(true)
    let desde: Date, hasta: Date
    if (periodo === 'personalizado' && desdeCustom && hastaCustom) {
      desde = new Date(desdeCustom)
      hasta = new Date(hastaCustom)
    } else if (periodo !== 'personalizado') {
      const rango = calcularRango(periodo)
      desde = rango.desde
      hasta = rango.hasta
    } else {
      setLoading(false)
      return
    }
    const res = await fetch(`/api/reportes/negocio?desde=${desde.toISOString()}&hasta=${hasta.toISOString()}`)
    setDatos(await res.json())
    setLoading(false)
  }, [periodo, desdeCustom, hastaCustom])

  useEffect(() => { cargarDatos() }, [cargarDatos])

  const totalServicios = datos?.metricas.servicios.valor ?? 0

  return (
    <div className="page-container">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Reportes del negocio
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
            {datos && !loading
              ? `${new Date(datos.periodo.desde).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })} — ${new Date(datos.periodo.hasta).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}`
              : 'Seleccioná un período'}
          </p>
        </div>
        {datos && !loading && (
          <a
            href={`/api/reportes/pdf?desde=${new Date(datos.periodo.desde).toISOString()}&hasta=${new Date(datos.periodo.hasta).toISOString()}`}
            target="_blank"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#111827', color: 'white', padding: '9px 18px',
              borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            Exportar PDF
          </a>
        )}
      </div>

      {/* Selector de período */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginBottom: 28 }}>
        {PERIODOS.map(p => (
          <button
            key={p.id}
            onClick={() => setPeriodo(p.id)}
            style={{
              padding: '6px 16px', borderRadius: 999, border: '1.5px solid',
              borderColor: periodo === p.id ? '#111827' : '#e5e7eb',
              background: periodo === p.id ? '#111827' : 'white',
              color: periodo === p.id ? 'white' : '#6b7280',
              fontWeight: periodo === p.id ? 600 : 400,
              fontSize: 13, cursor: 'pointer', transition: 'all 0.12s',
            }}
          >
            {p.label}
          </button>
        ))}
        {periodo === 'personalizado' && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 4 }}>
            <input type="date" value={desdeCustom} onChange={e => setDesdeCustom(e.target.value)}
              style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 10px', fontSize: 13, outline: 'none' }} />
            <span style={{ color: '#9ca3af', fontSize: 13 }}>→</span>
            <input type="date" value={hastaCustom} onChange={e => setHastaCustom(e.target.value)}
              style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 10px', fontSize: 13, outline: 'none' }} />
            <button onClick={cargarDatos}
              style={{ background: '#111827', color: 'white', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Aplicar
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ display: 'inline-block', width: 36, height: 36, borderRadius: '50%', border: '3px solid #f3f4f6', borderTopColor: '#111827', animation: 'spin 0.7s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      ) : datos ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── Métricas principales ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            <KPI titulo="Clientes nuevos" valor={datos.metricas.clientes.valor} delta={datos.metricas.clientes.delta} accent />
            <KPI titulo="Servicios" valor={datos.metricas.servicios.valor} delta={datos.metricas.servicios.delta} />
            <KPI titulo="Leads" valor={datos.metricas.leads.valor} delta={datos.metricas.leads.delta} />
            <KPI titulo="Tasa de conversión" valor={datos.metricas.conversion.valor} delta={datos.metricas.conversion.delta} formato="porcentaje" />
          </div>

          {/* ── Métricas secundarias ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            <KPI titulo="Servicios entregados" valor={datos.metricas.serviciosEntregados.valor} delta={0} />
            <KPI titulo="Planes activos (total)" valor={datos.planes.activos} delta={0} />
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f0f0f0', padding: '24px 26px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Leads convertidos
              </p>
              <p style={{ fontSize: 34, fontWeight: 700, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {datos.metricas.leadsConvertidos.valor}
              </p>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
                de {datos.metricas.leads.valor} leads totales
              </p>
            </div>
          </div>

          {/* ── Planes — ingresos ── */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f0f0f0', padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Planes de previsión — situación financiera
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '20px 22px', border: '1px solid #bbf7d0' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#15803d', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Ganancia cobrada
                </p>
                <p style={{ fontSize: 28, fontWeight: 700, color: '#15803d', margin: 0, letterSpacing: '-0.02em' }}>
                  ${datos.planes.gananciaCobrada.toLocaleString('es-AR')}
                </p>
              </div>
              <div style={{ background: '#fef2f2', borderRadius: 12, padding: '20px 22px', border: '1px solid #fecaca' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#dc2626', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Deuda pendiente
                </p>
                <p style={{ fontSize: 28, fontWeight: 700, color: '#dc2626', margin: 0, letterSpacing: '-0.02em' }}>
                  ${datos.planes.deudaPendiente.toLocaleString('es-AR')}
                </p>
              </div>
            </div>
          </div>

          {/* ── Servicios — ingresos ── */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f0f0f0', padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Servicios — situación financiera
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '20px 22px', border: '1px solid #bbf7d0' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#15803d', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Ganancia cobrada
                </p>
                <p style={{ fontSize: 28, fontWeight: 700, color: '#15803d', margin: 0, letterSpacing: '-0.02em' }}>
                  ${datos.serviciosFinancieros.gananciaCobrada.toLocaleString('es-AR')}
                </p>
              </div>
              <div style={{ background: '#fef2f2', borderRadius: 12, padding: '20px 22px', border: '1px solid #fecaca' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#dc2626', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Deuda pendiente
                </p>
                <p style={{ fontSize: 28, fontWeight: 700, color: '#dc2626', margin: 0, letterSpacing: '-0.02em' }}>
                  ${datos.serviciosFinancieros.deudaPendiente.toLocaleString('es-AR')}
                </p>
              </div>
            </div>
          </div>

          {/* ── Servicios por tipo ── */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f0f0f0', padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Servicios por tipo
            </p>
            {datos.serviciosPorTipo.length === 0 ? (
              <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>Sin servicios en este período</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {datos.serviciosPorTipo.map(s => {
                  const pct = totalServicios > 0 ? Math.round((s.count / totalServicios) * 100) : 0
                  const color = coloresServicio[s.tipo] ?? '#6b7280'
                  return (
                    <div key={s.tipo}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>{labelServicio[s.tipo] ?? s.tipo}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{s.count}</span>
                          <span style={{ fontSize: 12, color: '#9ca3af', minWidth: 32, textAlign: 'right' }}>{pct}%</span>
                        </div>
                      </div>
                      <div style={{ height: 7, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Leads por convenio ── */}
          {datos.leadsPorConvenio.length > 0 && (
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f0f0f0', padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Leads por convenio
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {(() => {
                  const total = datos.leadsPorConvenio.reduce((s, c) => s + c.count, 0)
                  return datos.leadsPorConvenio.map(c => {
                    const pct = total > 0 ? Math.round((c.count / total) * 100) : 0
                    const tipoLabel: Record<string, string> = {
                      veterinaria: '🏥', petshop: '🐾', refugio: '🏠', clinica: '💉', otro: '🤝'
                    }
                    return (
                      <div key={c.nombre}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <span style={{ fontSize: 15, lineHeight: 1, flexShrink: 0 }}>{tipoLabel[c.tipo] ?? '🤝'}</span>
                          <span style={{ fontSize: 14, fontWeight: 500, color: '#374151', flex: 1 }}>{c.nombre}</span>
                          <span style={{ fontSize: 11, color: '#9ca3af', background: '#f3f4f6', padding: '2px 8px', borderRadius: 999, marginRight: 4 }}>{c.tipo}</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#111827', minWidth: 28, textAlign: 'right' }}>{c.count}</span>
                          <span style={{ fontSize: 12, color: '#9ca3af', minWidth: 36, textAlign: 'right' }}>{pct}%</span>
                        </div>
                        <div style={{ height: 7, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: '#2d8a54', borderRadius: 4, transition: 'width 0.5s ease' }} />
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>
            </div>
          )}

          {/* ── Canal de adquisición + estado leads ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 14 }}>

            {/* Canal de adquisición */}
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f0f0f0', padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Canal de adquisición
              </p>
              {(() => {
                const totalLeads = datos.leadsPorOrigen.reduce((s, l) => s + l.count, 0)
                const canalesConDatos = CANALES
                  .map(c => ({ ...c, count: datos.leadsPorOrigen.find(l => l.origen === c.key)?.count ?? 0 }))
                  .filter(c => c.count > 0)
                  .sort((a, b) => b.count - a.count)

                // Leads de orígenes no mapeados en CANALES
                const otrasCantidad = datos.leadsPorOrigen
                  .filter(l => !CANALES.some(c => c.key === l.origen))
                  .reduce((s, l) => s + l.count, 0)

                const filas = otrasCantidad > 0
                  ? [...canalesConDatos, { key: 'otro', label: 'Otros', emoji: '📋', color: '#9ca3af', count: otrasCantidad }]
                  : canalesConDatos

                if (filas.length === 0) return (
                  <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>Sin leads en este período</p>
                )

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {filas.map(canal => {
                      const pct = totalLeads > 0 ? Math.round((canal.count / totalLeads) * 100) : 0
                      return (
                        <div key={canal.key}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                            <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>{canal.emoji}</span>
                            <span style={{ fontSize: 14, fontWeight: 500, color: '#374151', flex: 1 }}>{canal.label}</span>
                            <span style={{ fontSize: 14, fontWeight: 700, color: '#111827', minWidth: 28, textAlign: 'right' }}>{canal.count}</span>
                            <span style={{ fontSize: 12, color: '#9ca3af', minWidth: 36, textAlign: 'right' }}>{pct}%</span>
                          </div>
                          <div style={{ height: 7, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: canal.color, borderRadius: 4, transition: 'width 0.5s ease' }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>

            {/* Estado de leads */}
            <GraficoPie
              titulo="Estado de leads"
              data={[
                { label: 'Nuevo',      valor: datos.leadsPorEstado.find(l => l.estado === 'nuevo')?.count ?? 0,      color: '#1d4ed8' },
                { label: 'Contactado', valor: datos.leadsPorEstado.find(l => l.estado === 'contactado')?.count ?? 0, color: '#15803d' },
                { label: 'Interesado', valor: datos.leadsPorEstado.find(l => l.estado === 'interesado')?.count ?? 0, color: '#a16207' },
                { label: 'Convertido', valor: datos.leadsPorEstado.find(l => l.estado === 'convertido')?.count ?? 0, color: '#111827' },
                { label: 'Perdido',    valor: datos.leadsPorEstado.find(l => l.estado === 'perdido')?.count ?? 0,    color: '#dc2626' },
              ]}
            />
          </div>

        </div>
      ) : null}
    </div>
  )
}
