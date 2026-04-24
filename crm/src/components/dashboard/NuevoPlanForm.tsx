'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { type Cliente, type Mascota, type PlanConfig, type Plan } from '@/db/schema'

type Props = {
  clientes: Cliente[]
  mascotas: Mascota[]
  planesConfig: PlanConfig[]
  planExistente?: Plan & { clienteNombre?: string; mascotaNombre?: string }
}

export function NuevoPlanForm({ clientes, mascotas, planesConfig, planExistente }: Props) {
  const router = useRouter()
  const esEdicion = !!planExistente
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clienteId, setClienteId] = useState(planExistente?.clienteId ?? '')
  const [planConfigId, setPlanConfigId] = useState(planExistente?.planConfigId ?? '')
  const [estado, setEstado] = useState(planExistente?.estado ?? 'activo')
  const [cuotasPagadas, setCuotasPagadas] = useState(planExistente?.cuotasPagadas?.toString() ?? '0')
  const [mascotaAdicional, setMascotaAdicional] = useState(planExistente?.mascotaAdicional ?? false)
const mascotasFiltradas = mascotas.filter(m => m.clienteId === clienteId)
  const planSeleccionado = planesConfig.find(p => p.id === planConfigId)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = e.currentTarget
    const data = {
      clienteId,
      mascotaId: (form.elements.namedItem('mascotaId') as HTMLSelectElement).value || null,
      planConfigId,
      cuotasMensual: planSeleccionado?.cuotaMensual,
      estado,
      cuotasPagadas: Number(cuotasPagadas),
      mascotaAdicional,
      notas: (form.elements.namedItem('notas') as HTMLTextAreaElement).value || null,
    }

    const url = esEdicion ? `/api/planes/${planExistente.id}` : '/api/planes'
    const method = esEdicion ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      setError('Error al guardar el plan. Intentá de nuevo.')
      setLoading(false)
      return
    }

    router.push('/dashboard/planes')
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

      {/* Cliente */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Cliente *</label>
        <select required value={clienteId} onChange={e => setClienteId(e.target.value)} style={inputStyle} disabled={esEdicion}>
          <option value="">Seleccioná un cliente</option>
          {clientes.map(c => (
            <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>
          ))}
        </select>
      </div>

      {/* Mascota */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Mascota</label>
        <select
          name="mascotaId"
          style={inputStyle}
          disabled={!clienteId}
          defaultValue={planExistente?.mascotaId ?? ''}
        >
          <option value="">{clienteId ? 'Seleccioná una mascota (opcional)' : 'Primero seleccioná un cliente'}</option>
          {mascotasFiltradas.map(m => (
            <option key={m.id} value={m.id}>{m.nombre} · {m.especie}</option>
          ))}
        </select>
      </div>

      {/* Plan */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Plan *</label>
        {planesConfig.length === 0 ? (
          <div style={{ padding: '12px 14px', background: '#fefce8', border: '1px solid #fde68a', borderRadius: 10 }}>
            <p style={{ fontSize: 13, color: '#a16207', margin: 0 }}>
              No hay planes configurados todavía. Creá los planes desde{' '}
              <a href="/dashboard/configuracion" style={{ color: '#a16207', fontWeight: 600 }}>Configuración</a>.
            </p>
          </div>
        ) : (
          <select required value={planConfigId} onChange={e => setPlanConfigId(e.target.value)} style={inputStyle}>
            <option value="">Seleccioná un plan</option>
            {planesConfig.map(p => (
              <option key={p.id} value={p.id}>{p.nombre} — ${Number(p.cuotaMensual).toLocaleString('es-AR')}/mes</option>
            ))}
          </select>
        )}
      </div>

      {/* Resumen del plan — sin cuotas totales */}
      {planSeleccionado && (
        <div style={{ background: '#f9fafb', borderRadius: 12, padding: '16px 20px', border: '1px solid #f3f4f6' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>Resumen del plan</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Cuota mensual</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '2px 0 0' }}>
                ${Number(planSeleccionado.cuotaMensual).toLocaleString('es-AR')}
              </p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Vigencia</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '2px 0 0' }}>
                Indefinida hasta baja
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Estado — solo en edición */}
      {esEdicion && (
        <div style={fieldStyle}>
          <label style={labelStyle}>Estado</label>
          <select value={estado} onChange={e => setEstado(e.target.value as Plan['estado'])} style={inputStyle}>
            <option value="activo">Activo</option>
            <option value="pausado">Pausado</option>
            <option value="cancelado">Cancelado</option>
            <option value="utilizado">Utilizado</option>
          </select>
        </div>
      )}

      {/* Cuotas pagadas — solo en edición */}
      {esEdicion && (
        <div style={fieldStyle}>
          <label style={labelStyle}>Cuotas pagadas</label>
          <input
            type="number" min="0" value={cuotasPagadas}
            onChange={e => setCuotasPagadas(e.target.value)}
            style={inputStyle}
          />
        </div>
      )}

      {/* Mascota adicional */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          type="checkbox" id="mascotaAdicional"
          checked={mascotaAdicional}
          onChange={e => setMascotaAdicional(e.target.checked)}
          style={{ width: 16, height: 16, cursor: 'pointer' }}
        />
        <label htmlFor="mascotaAdicional" style={{ fontSize: 14, color: '#374151', cursor: 'pointer' }}>
          Mascota adicional (+50% sobre cuota base)
        </label>
      </div>

      {/* Notas */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Notas</label>
        <textarea
          name="notas" rows={3}
          style={{ ...inputStyle, resize: 'vertical' }}
          placeholder="Información adicional..."
          defaultValue={planExistente?.notas ?? ''}
        />
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
        <button type="submit" disabled={loading || planesConfig.length === 0}
          style={{ padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500, border: 'none', background: '#111827', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading || planesConfig.length === 0 ? 0.5 : 1 }}>
          {loading ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Guardar plan'}
        </button>
      </div>
    </form>
  )
}