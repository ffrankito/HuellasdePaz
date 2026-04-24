'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { type Cliente, type Mascota, type ServicioConfig } from '@/db/schema'

type ConvenioActivo = { id: string; nombre: string; descuentoPorcentaje: string | null }

export function NuevoServicioForm({ clientes, mascotas, serviciosConfig }: {
  clientes: Cliente[]
  mascotas: Mascota[]
  serviciosConfig: ServicioConfig[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clienteId, setClienteId] = useState('')
  const [servicioConfigId, setServicioConfigId] = useState('')
  const [convenioId, setConvenioId] = useState('')
  const [conveniosActivos, setConveniosActivos] = useState<ConvenioActivo[]>([])

  const mascotasFiltradas = mascotas.filter(m => m.clienteId === clienteId)
  const configSeleccionada = serviciosConfig.find(s => s.id === servicioConfigId)
  const convenioSeleccionado = conveniosActivos.find(c => c.id === convenioId)

  const precioBase = configSeleccionada?.precio ? Number(configSeleccionada.precio) : null
  const descuentoPct = convenioSeleccionado?.descuentoPorcentaje ? Number(convenioSeleccionado.descuentoPorcentaje) : 0
  const descuentoMonto = precioBase ? Math.round(precioBase * descuentoPct / 100) : 0
  const precioFinal = precioBase !== null ? precioBase - descuentoMonto : null

  useEffect(() => {
    fetch('/api/convenios?activos=true')
      .then(r => r.ok ? r.json() : [])
      .then(setConveniosActivos)
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = e.currentTarget
    const data = {
      clienteId,
      mascotaId: (form.elements.namedItem('mascotaId') as HTMLSelectElement).value || null,
      tipo: configSeleccionada?.tipo ?? '',
      servicioConfigId: servicioConfigId || null,
      precio: precioBase !== null ? precioBase.toString() : null,
      descuento: descuentoMonto > 0 ? descuentoMonto.toString() : '0',
      fechaRetiro: (form.elements.namedItem('fechaRetiro') as HTMLInputElement).value || null,
      notas: (form.elements.namedItem('notas') as HTMLTextAreaElement).value || null,
      convenioId: convenioId || null,
    }

    const res = await fetch('/api/servicios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      setError('Error al guardar el servicio. Intentá de nuevo.')
      setLoading(false)
      return
    }

    router.push('/dashboard/servicios')
    router.refresh()
  }

  const inputStyle = {
    display: 'block', width: '100%', padding: '10px 14px', fontSize: 14,
    color: '#111827', background: 'white', border: '1px solid #e5e7eb',
    borderRadius: 10, outline: 'none', boxSizing: 'border-box' as const,
  }
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }
  const fieldStyle = { display: 'flex', flexDirection: 'column' as const }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={fieldStyle}>
        <label style={labelStyle}>Cliente *</label>
        <select required value={clienteId} onChange={e => setClienteId(e.target.value)} style={inputStyle}>
          <option value="">Seleccioná un cliente</option>
          {clientes.map(c => (
            <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>
          ))}
        </select>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Mascota</label>
        <select name="mascotaId" style={inputStyle} disabled={!clienteId}>
          <option value="">{clienteId ? 'Seleccioná una mascota (opcional)' : 'Primero seleccioná un cliente'}</option>
          {mascotasFiltradas.map(m => (
            <option key={m.id} value={m.id}>{m.nombre} · {m.especie}</option>
          ))}
        </select>
        {clienteId && mascotasFiltradas.length === 0 && (
          <p style={{ fontSize: 12, color: '#f59e0b', marginTop: 4 }}>Este cliente no tiene mascotas registradas.</p>
        )}
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Servicio *</label>
        <select required value={servicioConfigId} onChange={e => setServicioConfigId(e.target.value)} style={inputStyle}>
          <option value="">Seleccioná el servicio</option>
          {serviciosConfig.filter(s => s.activo).map(s => (
            <option key={s.id} value={s.id}>
              {s.nombre}{s.precio ? ` — $${Number(s.precio).toLocaleString('es-AR')}` : ' — Consultar'}
            </option>
          ))}
        </select>
      </div>

      {conveniosActivos.length > 0 && (
        <div style={fieldStyle}>
          <label style={labelStyle}>¿Vino por convenio?</label>
          <select value={convenioId} onChange={e => setConvenioId(e.target.value)} style={inputStyle}>
            <option value="">Sin convenio</option>
            {conveniosActivos.map(c => (
              <option key={c.id} value={c.id}>
                {c.nombre}{c.descuentoPorcentaje && Number(c.descuentoPorcentaje) > 0 ? ` — ${c.descuentoPorcentaje}% desc.` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Resumen de precio */}
      {configSeleccionada && (
        <div style={{ background: '#f9fafb', borderRadius: 12, padding: '16px 20px', border: '1px solid #f3f4f6' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: '0 0 10px' }}>Resumen de precio</p>
          {precioBase !== null ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#9ca3af' }}>Precio base</span>
                <span style={{ color: '#111827' }}>${precioBase.toLocaleString('es-AR')}</span>
              </div>
              {descuentoMonto > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#9ca3af' }}>Descuento convenio ({descuentoPct}%)</span>
                  <span style={{ color: '#dc2626' }}>−${descuentoMonto.toLocaleString('es-AR')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, paddingTop: 8, borderTop: '1px solid #e5e7eb', marginTop: 4 }}>
                <span style={{ color: '#111827' }}>Total a cobrar</span>
                <span style={{ color: '#15803d' }}>${precioFinal!.toLocaleString('es-AR')}</span>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Precio a consultar — ingresarlo manualmente al confirmar.</p>
          )}
        </div>
      )}

      <div style={fieldStyle}>
        <label style={labelStyle}>Fecha de retiro</label>
        <input name="fechaRetiro" type="datetime-local" style={inputStyle} />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Notas</label>
        <textarea name="notas" rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Información adicional..." />
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 10, padding: '12px 16px' }}>
          <p style={{ fontSize: 14, color: '#dc2626', margin: 0 }}>{error}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 }}>
        <button type="button" onClick={() => router.back()}
          style={{ padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500, border: '1px solid #e5e7eb', background: 'white', color: '#374151', cursor: 'pointer' }}>
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          style={{ padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500, border: 'none', background: '#111827', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Guardando...' : 'Guardar servicio'}
        </button>
      </div>
    </form>
  )
}
