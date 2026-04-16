import { db } from '@/db'
import { servicios, clientes, mascotas } from '@/db/schema'
import { eq, ne, and, gte, lt } from 'drizzle-orm'
import { AvanzarButtonClient } from '@/components/dashboard/AvanzarButton'
import Link from 'next/link'

const estadoColors: Record<string, { bg: string; color: string }> = {
  ingresado: { bg: '#eff6ff', color: '#1d4ed8' },
  retiro_pendiente: { bg: '#fefce8', color: '#a16207' },
  en_transporte: { bg: '#fff7ed', color: '#c2410c' },
  recibido: { bg: '#f0fdf4', color: '#15803d' },
  en_cremacion: { bg: '#fdf4ff', color: '#7e22ce' },
  cremado: { bg: '#f0fdf4', color: '#15803d' },
  listo_entrega: { bg: '#fefce8', color: '#a16207' },
  entregado: { bg: '#f0fdf4', color: '#15803d' },
  cancelado: { bg: '#fef2f2', color: '#dc2626' },
}

const estadoSiguiente: Record<string, string> = {
  ingresado: 'retiro_pendiente',
  retiro_pendiente: 'en_transporte',
  en_transporte: 'recibido',
  recibido: 'en_cremacion',
  en_cremacion: 'cremado',
  cremado: 'listo_entrega',
  listo_entrega: 'entregado',
}

const tipoLabel: Record<string, string> = {
  cremacion_individual: 'Cremación individual',
  cremacion_comunitaria: 'Cremación comunitaria',
  entierro: 'Entierro',
}

const HORAS = Array.from({ length: 13 }, (_, i) => i + 8)

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>
}) {
  const { fecha: fechaParam } = await searchParams
  const hoy = new Date().toISOString().split('T')[0]
  const fechaSeleccionada = fechaParam ?? hoy

  const inicioDia = new Date(fechaSeleccionada + 'T00:00:00')
  const finDia = new Date(fechaSeleccionada + 'T23:59:59')

  const diaAnterior = new Date(inicioDia)
  diaAnterior.setDate(diaAnterior.getDate() - 1)
  const diaSiguiente = new Date(inicioDia)
  diaSiguiente.setDate(diaSiguiente.getDate() + 1)

  const serviciosDia = await db
    .select({
      id: servicios.id,
      tipo: servicios.tipo,
      estado: servicios.estado,
      fechaRetiro: servicios.fechaRetiro,
      clienteNombre: clientes.nombre,
      clienteApellido: clientes.apellido,
      clienteTelefono: clientes.telefono,
      mascotaNombre: mascotas.nombre,
      mascotaEspecie: mascotas.especie,
    })
    .from(servicios)
    .leftJoin(clientes, eq(servicios.clienteId, clientes.id))
    .leftJoin(mascotas, eq(servicios.mascotaId, mascotas.id))
    .where(
      and(
        ne(servicios.estado, 'entregado'),
        ne(servicios.estado, 'cancelado'),
        gte(servicios.fechaRetiro, inicioDia),
        lt(servicios.fechaRetiro, finDia),
      )
    )

  const sinFecha = await db
    .select({
      id: servicios.id,
      tipo: servicios.tipo,
      estado: servicios.estado,
      fechaRetiro: servicios.fechaRetiro,
      clienteNombre: clientes.nombre,
      clienteApellido: clientes.apellido,
      clienteTelefono: clientes.telefono,
      mascotaNombre: mascotas.nombre,
      mascotaEspecie: mascotas.especie,
    })
    .from(servicios)
    .leftJoin(clientes, eq(servicios.clienteId, clientes.id))
    .leftJoin(mascotas, eq(servicios.mascotaId, mascotas.id))
    .where(and(ne(servicios.estado, 'entregado'), ne(servicios.estado, 'cancelado')))
    .then(rows => rows.filter(r => !r.fechaRetiro))

  const horaActual = new Date().getHours()
  const esHoy = fechaSeleccionada === hoy

  const etiquetaDia = () => {
    if (fechaSeleccionada === hoy) return 'Hoy'
    const manana = new Date()
    manana.setDate(manana.getDate() + 1)
    if (fechaSeleccionada === manana.toISOString().split('T')[0]) return 'Mañana'
    return new Date(fechaSeleccionada + 'T00:00:00').toLocaleDateString('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long'
    })
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: 0 }}>Agenda</h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>
            {serviciosDia.length} {serviciosDia.length === 1 ? 'servicio' : 'servicios'} para {etiquetaDia().toLowerCase()}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href={`/dashboard/agenda?fecha=${diaAnterior.toISOString().split('T')[0]}`}
            style={{ padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500, border: '1px solid #e5e7eb', background: 'white', color: '#374151', textDecoration: 'none' }}>
            ← Anterior
          </Link>
          <Link href="/dashboard/agenda"
            style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, border: '1px solid', borderColor: esHoy ? '#111827' : '#e5e7eb', background: esHoy ? '#111827' : 'white', color: esHoy ? 'white' : '#374151', textDecoration: 'none' }}>
            Hoy
          </Link>
          <Link href={`/dashboard/agenda?fecha=${diaSiguiente.toISOString().split('T')[0]}`}
            style={{ padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500, border: '1px solid #e5e7eb', background: 'white', color: '#374151', textDecoration: 'none' }}>
            Siguiente →
          </Link>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111827', margin: 0, textTransform: 'capitalize' }}>
          {etiquetaDia()} — {new Date(fechaSeleccionada + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </h2>
      </div>

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: 32 }}>
        {HORAS.map(hora => {
          const eventosHora = serviciosDia.filter(s => s.fechaRetiro && new Date(s.fechaRetiro).getHours() === hora)
          const esPasada = esHoy && hora < horaActual
          const esActual = esHoy && hora === horaActual

          return (
            <div key={hora} style={{
              display: 'flex', borderBottom: '1px solid #f9fafb',
              background: esActual ? '#fafafa' : esPasada ? '#fdfdfd' : 'white',
              minHeight: eventosHora.length > 0 ? 'auto' : 64,
            }}>
              <div style={{ width: 60, flexShrink: 0, borderRight: '1px solid #f3f4f6', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: '16px 10px 0 0' }}>
                <span style={{ fontSize: 11, fontWeight: esActual ? 700 : 400, color: esActual ? '#111827' : esPasada ? '#d1d5db' : '#9ca3af' }}>
                  {hora.toString().padStart(2, '0')}:00
                </span>
              </div>
              <div style={{ flex: 1, padding: eventosHora.length > 0 ? '10px 12px' : '0 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {esActual && eventosHora.length === 0 && (
                  <div style={{ height: 2, background: '#111827', borderRadius: 1, marginTop: 16, marginBottom: 16 }} />
                )}
                {eventosHora.map(s => {
                  const badge = estadoColors[s.estado] ?? { bg: '#f3f4f6', color: '#374151' }
                  const siguiente = estadoSiguiente[s.estado]
                  const horaMinuto = new Date(s.fechaRetiro!).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
                  return (
                    <div key={s.id} className="agenda-card" style={{
                      background: badge.bg, border: `1px solid ${badge.color}33`,
                      borderRadius: 12, padding: '12px 14px',
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: badge.color }}>{horaMinuto}</span>
                          <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{s.mascotaNombre ?? '—'}</span>
                          <span style={{ fontSize: 12, color: '#9ca3af' }}>{s.mascotaEspecie}</span>
                          <span style={{ fontSize: 11, color: badge.color, fontWeight: 600, background: 'white', padding: '1px 8px', borderRadius: 20 }}>
                            {s.estado.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
                          {s.clienteNombre} {s.clienteApellido} · {s.clienteTelefono}
                        </p>
                      </div>
                      {siguiente && <AvanzarButtonClient id={s.id} siguiente={siguiente} />}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {sinFecha.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#6b7280' }}>Sin fecha asignada</span>
            <span style={{ fontSize: 12, color: '#9ca3af', background: '#f3f4f6', padding: '2px 8px', borderRadius: 20 }}>{sinFecha.length}</span>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sinFecha.map(s => {
              const badge = estadoColors[s.estado] ?? { bg: '#f3f4f6', color: '#374151' }
              const siguiente = estadoSiguiente[s.estado]
              return (
                <div key={s.id} className="agenda-card" style={{
                  background: 'white', borderRadius: 14, border: '1px solid #f3f4f6',
                  padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{s.mascotaNombre ?? '—'}</span>
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>{s.mascotaEspecie}</span>
                      <span style={{ background: badge.bg, color: badge.color, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500 }}>
                        {s.estado.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
                      {s.clienteNombre} {s.clienteApellido} · {s.clienteTelefono}
                    </p>
                  </div>
                  {siguiente && <AvanzarButtonClient id={s.id} siguiente={siguiente} />}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}