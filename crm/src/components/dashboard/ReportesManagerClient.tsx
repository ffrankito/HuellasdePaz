'use client'

import { useState } from 'react'
import { type Usuario } from '@/db/schema'

type Periodo = '1mes' | '3meses' | 'personalizado'

export function ReportesManagerClient({ agentes }: { agentes: Usuario[] }) {
  const [periodo, setPeriodo] = useState<Periodo>('1mes')
  const [agenteId, setAgenteId] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [datos, setDatos] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function buscar() {
    setLoading(true)

    let desde = ''
    let hasta = new Date().toISOString().split('T')[0]

    if (periodo === '1mes') {
      const d = new Date()
      d.setMonth(d.getMonth() - 1)
      desde = d.toISOString().split('T')[0]
    } else if (periodo === '3meses') {
      const d = new Date()
      d.setMonth(d.getMonth() - 3)
      desde = d.toISOString().split('T')[0]
    } else {
      desde = fechaDesde
      hasta = fechaHasta
    }

    const res = await fetch(`/api/manager/reportes?desde=${desde}&hasta=${hasta}&agenteId=${agenteId}`)
    const data = await res.json()
    setDatos(data)
    setLoading(false)
  }

  const inputStyle = {
    padding: '9px 14px', fontSize: 13, color: '#111827', background: 'white',
    border: '1px solid #e5e7eb', borderRadius: 8, outline: 'none',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Filtros */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 20px' }}>Filtros</h2>
        <div className="grid-4" style={{ marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 6 }}>Período</label>
            <select value={periodo} onChange={e => setPeriodo(e.target.value as Periodo)} style={{ ...inputStyle, width: '100%' }}>
              <option value="1mes">Último mes</option>
              <option value="3meses">Últimos 3 meses</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 6 }}>Agente</label>
            <select value={agenteId} onChange={e => setAgenteId(e.target.value)} style={{ ...inputStyle, width: '100%' }}>
              <option value="">Todos los agentes</option>
              {agentes.map(a => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
          </div>

          {periodo === 'personalizado' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 6 }}>Desde</label>
                <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' as const }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 6 }}>Hasta</label>
                <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' as const }} />
              </div>
            </>
          )}
        </div>

        <button
          onClick={buscar}
          disabled={loading}
          style={{ padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 500, border: 'none', background: '#111827', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Buscando...' : 'Generar reporte'}
        </button>
      </div>

      {/* Resultados */}
      {datos && (
        <>
          <div className="grid-4">
            {[
              { label: 'Total leads', valor: datos.total, color: '#111827' },
              { label: 'Convertidos', valor: datos.convertidos, color: '#15803d' },
              { label: 'Perdidos', valor: datos.perdidos, color: '#dc2626' },
              { label: 'Tasa conversión', valor: `${datos.conversion}%`, color: '#7e22ce' },
            ].map(m => (
              <div key={m.label} style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 8px' }}>{m.label}</p>
                <p style={{ fontSize: 28, fontWeight: 700, color: m.color, margin: 0 }}>{m.valor}</p>
              </div>
            ))}
          </div>

          {/* Por agente */}
          {datos.porAgente && datos.porAgente.length > 0 && (
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 20px' }}>Por agente</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {datos.porAgente.map((a: any) => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: '#f9fafb', borderRadius: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>{a.nombre.charAt(0)}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#111827', margin: '0 0 4px' }}>{a.nombre}</p>
                      <div style={{ display: 'flex', gap: 16 }}>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>Leads: <strong>{a.total}</strong></span>
                        <span style={{ fontSize: 12, color: '#15803d' }}>Convertidos: <strong>{a.convertidos}</strong></span>
                        <span style={{ fontSize: 12, color: '#dc2626' }}>Perdidos: <strong>{a.perdidos}</strong></span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>{a.conversion}%</p>
                      <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>conversión</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}