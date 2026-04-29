'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { type Cliente, type Mascota, type ServicioConfig } from '@/db/schema'
import { SelectorProducto } from '@/components/servicios/SelectorProducto'

type ConvenioActivo = { id: string; nombre: string; descuentoPorcentaje: string | null; serviciosCubiertos: string[] | null }

function convenioAplica(c: ConvenioActivo, tipo: string | undefined): boolean {
  if (!tipo) return true
  if (!c.serviciosCubiertos || c.serviciosCubiertos.length === 0) return true
  return c.serviciosCubiertos.includes(tipo)
}

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
  const [inventarioItemId, setInventarioItemId] = useState<string | null>(null)

  const mascotasFiltradas = mascotas.filter(m => m.clienteId === clienteId)
  const configSeleccionada = serviciosConfig.find(s => s.id === servicioConfigId)
  const tipoSeleccionado = configSeleccionada?.tipo
  const conveniosAplicables = conveniosActivos.filter(c => convenioAplica(c, tipoSeleccionado))
  const convenioSeleccionado = conveniosAplicables.find(c => c.id === convenioId)

  const precioBase = configSeleccionada?.precio ? Number(configSeleccionada.precio) : null
  // El cliente SIEMPRE paga el precio completo. El % del convenio es la comisión al socio (veterinaria/petshop).
  const comisionPct = convenioSeleccionado?.descuentoPorcentaje ? Number(convenioSeleccionado.descuentoPorcentaje) : 0
  const comisionMonto = precioBase ? Math.round(precioBase * comisionPct / 100) : 0
  const ingresoNeto = precioBase !== null ? precioBase - comisionMonto : null

  useEffect(() => {
    fetch('/api/convenios?activos=true')
      .then(r => r.ok ? r.json() : [])
      .then(setConveniosActivos)
      .catch(() => {})
  }, [])

  // Limpiar convenio si cambia el tipo y el convenio actual no aplica
  useEffect(() => {
    if (!convenioId || !tipoSeleccionado) return
    const actual = conveniosActivos.find(c => c.id === convenioId)
    if (actual && !convenioAplica(actual, tipoSeleccionado)) setConvenioId('')
  }, [tipoSeleccionado])

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
      descuento: comisionMonto > 0 ? comisionMonto.toString() : '0',
      fechaRetiro: (form.elements.namedItem('fechaRetiro') as HTMLInputElement).value || null,
      notas: (form.elements.namedItem('notas') as HTMLTextAreaElement).value || null,
      convenioId: convenioId || null,
      inventarioItemId: inventarioItemId || null,
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

      {conveniosAplicables.length > 0 && (
        <div style={fieldStyle}>
          <label style={labelStyle}>¿Vino por convenio?</label>
          {tipoSeleccionado && conveniosActivos.length > conveniosAplicables.length && (
            <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 6px' }}>
              Solo se muestran los convenios que cubren este tipo de servicio.
            </p>
          )}
          <select value={convenioId} onChange={e => setConvenioId(e.target.value)} style={inputStyle}>
            <option value="">Sin convenio</option>
            {conveniosAplicables.map(c => (
              <option key={c.id} value={c.id}>
                {c.nombre}{c.descuentoPorcentaje && Number(c.descuentoPorcentaje) > 0 ? ` — ${c.descuentoPorcentaje}% com.` : ''}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, paddingBottom: 8, borderBottom: comisionMonto > 0 ? '1px solid #e5e7eb' : 'none', marginBottom: comisionMonto > 0 ? 4 : 0 }}>
                <span style={{ color: '#111827' }}>Total a cobrar al cliente</span>
                <span style={{ color: '#15803d' }}>${precioBase.toLocaleString('es-AR')}</span>
              </div>
              {comisionMonto > 0 && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#9ca3af' }}>Comisión {convenioSeleccionado?.nombre} ({comisionPct}%)</span>
                    <span style={{ color: '#d97706' }}>−${comisionMonto.toLocaleString('es-AR')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#9ca3af' }}>Ingreso neto Huellas de Paz</span>
                    <span style={{ color: '#6b7280', fontWeight: 600 }}>${ingresoNeto!.toLocaleString('es-AR')}</span>
                  </div>
                </>
              )}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Precio a consultar — ingresarlo manualmente al confirmar.</p>
          )}
        </div>
      )}

      <div style={fieldStyle}>
        <label style={labelStyle}>Producto / Urna <span style={{ fontWeight: 400, color: '#9ca3af' }}>(opcional)</span></label>
        <SelectorProducto value={inventarioItemId} onChange={setInventarioItemId} />
      </div>

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

      <div style={{ position: 'sticky', bottom: 0, background: 'white', paddingTop: 16, paddingBottom: 4, marginTop: 8, borderTop: '1px solid #f3f4f6', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button type="button" onClick={() => router.back()}
          style={{ padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 500, border: '1px solid #e5e7eb', background: 'white', color: '#374151', cursor: 'pointer' }}>
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          style={{ padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, border: 'none', background: '#111827', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Guardando...' : 'Guardar servicio'}
        </button>
      </div>
    </form>
  )
}
