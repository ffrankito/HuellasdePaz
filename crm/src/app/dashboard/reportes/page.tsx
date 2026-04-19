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
  serviciosPorTipo: { tipo: string; count: number }[]
  leadsPorOrigen: { origen: string | null; count: number }[]
  leadsPorEstado: { estado: string; count: number }[]
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
      const primerDiaMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1)
      const ultimoDiaMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth(), 0, 23, 59, 59)
      return { desde: primerDiaMesAnterior, hasta: ultimoDiaMesAnterior }
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
  if (valor === 0) return <span style={{ fontSize: 12, color: '#9ca3af' }}>= sin cambio</span>
  const sube = valor > 0
  return (
    <span style={{ fontSize: 12, fontWeight: 600, color: sube ? '#15803d' : '#dc2626' }}>
      {sube ? '↑' : '↓'} {Math.abs(valor)}% vs período anterior
    </span>
  )
}

function MetricaCard({ titulo, valor, delta, formato = 'numero' }: { titulo: string; valor: number; delta: number; formato?: 'numero' | 'porcentaje' | 'moneda' }) {
  const display = formato === 'porcentaje' ? `${valor}%` : formato === 'moneda' ? `$${valor.toLocaleString('es-AR')}` : valor
  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px 28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 10px' }}>{titulo}</p>
      <p style={{ fontSize: 32, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>{display}</p>
      <Delta valor={delta} />
    </div>
  )
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
    const data = await res.json()
    setDatos(data)
    setLoading(false)
  }, [periodo, desdeCustom, hastaCustom])

  useEffect(() => { cargarDatos() }, [cargarDatos])

  const labelServicio: Record<string, string> = {
    cremacion_individual: 'Cremación individual',
    cremacion_comunitaria: 'Cremación comunitaria',
    entierro: 'Entierro',
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: 0 }}>Reportes del negocio</h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>
            {datos && !loading
              ? `${new Date(datos.periodo.desde).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })} — ${new Date(datos.periodo.hasta).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}`
              : 'Cargando...'}
          </p>
        </div>
        <a
          href="/api/reportes/pdf"
          target="_blank"
          style={{ background: '#111827', color: 'white', padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
        >
          Exportar PDF
        </a>
      </div>

      {/* Selector de período */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '16px 20px', marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        {PERIODOS.map(p => (
          <button
            key={p.id}
            onClick={() => setPeriodo(p.id)}
            style={{
              padding: '7px 16px', borderRadius: 999, border: '1.5px solid',
              borderColor: periodo === p.id ? '#111827' : '#e5e7eb',
              background: periodo === p.id ? '#111827' : 'white',
              color: periodo === p.id ? 'white' : '#374151',
              fontWeight: periodo === p.id ? 600 : 400,
              fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {p.label}
          </button>
        ))}

        {periodo === 'personalizado' && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 8 }}>
            <input
              type="date" value={desdeCustom}
              onChange={e => setDesdeCustom(e.target.value)}
              style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 10px', fontSize: 13, outline: 'none' }}
            />
            <span style={{ color: '#9ca3af', fontSize: 13 }}>hasta</span>
            <input
              type="date" value={hastaCustom}
              onChange={e => setHastaCustom(e.target.value)}
              style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 10px', fontSize: 13, outline: 'none' }}
            />
            <button
              onClick={cargarDatos}
              style={{ background: '#111827', color: 'white', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Aplicar
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>Cargando datos...</div>
      ) : datos ? (
        <>
          {/* Métricas principales */}
          <div className="grid-4" style={{ marginBottom: 20 }}>
            <MetricaCard titulo="Clientes nuevos" valor={datos.metricas.clientes.valor} delta={datos.metricas.clientes.delta} />
            <MetricaCard titulo="Servicios" valor={datos.metricas.servicios.valor} delta={datos.metricas.servicios.delta} />
            <MetricaCard titulo="Leads" valor={datos.metricas.leads.valor} delta={datos.metricas.leads.delta} />
            <MetricaCard titulo="Tasa de conversión" valor={datos.metricas.conversion.valor} delta={datos.metricas.conversion.delta} formato="porcentaje" />
          </div>

          {/* Segunda fila de métricas */}
          <div className="grid-3" style={{ marginBottom: 20 }}>
            <MetricaCard titulo="Servicios entregados" valor={datos.metricas.serviciosEntregados.valor} delta={0} />
            <MetricaCard titulo="Leads convertidos" valor={datos.metricas.leadsConvertidos.valor} delta={datos.metricas.leadsConvertidos.delta} />
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px 28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 10px' }}>Planes activos (total)</p>
              <p style={{ fontSize: 32, fontWeight: 700, color: '#111827', margin: 0 }}>{datos.planes.activos}</p>
            </div>
          </div>

          {/* Planes financiero */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 20px' }}>Planes de previsión</h2>
            <div className="grid-3">
              <div style={{ background: '#f9fafb', borderRadius: 12, padding: '20px 24px' }}>
                <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 8px' }}>Planes activos</p>
                <p style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0 }}>{datos.planes.activos}</p>
              </div>
              <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '20px 24px', border: '1px solid #bbf7d0' }}>
                <p style={{ fontSize: 13, color: '#15803d', margin: '0 0 8px' }}>Ganancia cobrada</p>
                <p style={{ fontSize: 28, fontWeight: 700, color: '#15803d', margin: 0 }}>${datos.planes.gananciaCobrada.toLocaleString('es-AR')}</p>
              </div>
              <div style={{ background: '#fef2f2', borderRadius: 12, padding: '20px 24px', border: '1px solid #fecaca' }}>
                <p style={{ fontSize: 13, color: '#dc2626', margin: '0 0 8px' }}>Deuda pendiente</p>
                <p style={{ fontSize: 28, fontWeight: 700, color: '#dc2626', margin: 0 }}>${datos.planes.deudaPendiente.toLocaleString('es-AR')}</p>
              </div>
            </div>
          </div>

          {/* Servicios por tipo — barra */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 20px' }}>Servicios por tipo</h2>
            {datos.serviciosPorTipo.length === 0
              ? <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>Sin servicios en este período</p>
              : datos.serviciosPorTipo.map(s => {
                const total = datos.metricas.servicios.valor
                const pct = total > 0 ? Math.round((s.count / total) * 100) : 0
                return (
                  <div key={s.tipo} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: '#374151' }}>{labelServicio[s.tipo] ?? s.tipo}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{s.count} ({pct}%)</span>
                    </div>
                    <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: '#111827', borderRadius: 3 }} />
                    </div>
                  </div>
                )
              })
            }
          </div>

          {/* Gráficos */}
          <div className="grid-2">
            <GraficoPie
              titulo="Leads por origen"
              data={[
                { label: 'Cotizador', valor: datos.leadsPorOrigen.find(l => l.origen === 'cotizador')?.count ?? 0, color: '#111827' },
                { label: 'Landing', valor: datos.leadsPorOrigen.find(l => l.origen === 'landing')?.count ?? 0, color: '#374151' },
                { label: 'WhatsApp', valor: datos.leadsPorOrigen.find(l => l.origen === 'whatsapp')?.count ?? 0, color: '#6b7280' },
                { label: 'Convenio', valor: datos.leadsPorOrigen.find(l => l.origen === 'veterinaria')?.count ?? 0, color: '#9ca3af' },
                { label: 'Directo', valor: datos.leadsPorOrigen.find(l => l.origen === 'directo')?.count ?? 0, color: '#d1d5db' },
              ]}
            />
            <GraficoPie
              titulo="Estado de leads"
              data={[
                { label: 'Nuevo', valor: datos.leadsPorEstado.find(l => l.estado === 'nuevo')?.count ?? 0, color: '#1d4ed8' },
                { label: 'Contactado', valor: datos.leadsPorEstado.find(l => l.estado === 'contactado')?.count ?? 0, color: '#15803d' },
                { label: 'Interesado', valor: datos.leadsPorEstado.find(l => l.estado === 'interesado')?.count ?? 0, color: '#a16207' },
                { label: 'Convertido', valor: datos.leadsPorEstado.find(l => l.estado === 'convertido')?.count ?? 0, color: '#111827' },
                { label: 'Perdido', valor: datos.leadsPorEstado.find(l => l.estado === 'perdido')?.count ?? 0, color: '#dc2626' },
              ]}
            />
          </div>
        </>
      ) : null}
    </div>
  )
}