import { db } from '@/db'
import { servicios, clientes, mascotas } from '@/db/schema'
import { eq, ne, and, gte, lt, isNull, asc } from 'drizzle-orm'
import { AgendaCard } from '@/components/dashboard/AgendaCard'
import { AgendaDatePicker } from '@/components/dashboard/AgendaDatePicker'
import Link from 'next/link'

const serviciosSelect = {
  id: servicios.id,
  tipo: servicios.tipo,
  estado: servicios.estado,
  fechaRetiro: servicios.fechaRetiro,
  clienteNombre: clientes.nombre,
  clienteApellido: clientes.apellido,
  clienteTelefono: clientes.telefono,
  mascotaNombre: mascotas.nombre,
  mascotaEspecie: mascotas.especie,
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>
}) {
  const { fecha: fechaParam } = await searchParams
  const hoy = new Date().toISOString().split('T')[0]
  const fechaSeleccionada = fechaParam ?? hoy

  const inicioDia = new Date(fechaSeleccionada + 'T00:00:00')
  const finDia    = new Date(fechaSeleccionada + 'T23:59:59')

  const diaAnterior = new Date(inicioDia)
  diaAnterior.setDate(diaAnterior.getDate() - 1)
  const diaSiguiente = new Date(inicioDia)
  diaSiguiente.setDate(diaSiguiente.getDate() + 1)

  const [serviciosDia, sinFecha] = await Promise.all([
    db.select(serviciosSelect)
      .from(servicios)
      .leftJoin(clientes, eq(servicios.clienteId, clientes.id))
      .leftJoin(mascotas, eq(servicios.mascotaId, mascotas.id))
      .where(and(
        ne(servicios.estado, 'entregado'),
        ne(servicios.estado, 'cancelado'),
        gte(servicios.fechaRetiro, inicioDia),
        lt(servicios.fechaRetiro, finDia),
      ))
      .orderBy(asc(servicios.fechaRetiro)),
    db.select(serviciosSelect)
      .from(servicios)
      .leftJoin(clientes, eq(servicios.clienteId, clientes.id))
      .leftJoin(mascotas, eq(servicios.mascotaId, mascotas.id))
      .where(and(
        ne(servicios.estado, 'entregado'),
        ne(servicios.estado, 'cancelado'),
        isNull(servicios.fechaRetiro),
      )),
  ])

  const esHoy = fechaSeleccionada === hoy
  const ahora = new Date()

  const etiquetaDia = () => {
    if (fechaSeleccionada === hoy) return 'Hoy'
    const manana = new Date()
    manana.setDate(manana.getDate() + 1)
    if (fechaSeleccionada === manana.toISOString().split('T')[0]) return 'Mañana'
    return new Date(fechaSeleccionada + 'T00:00:00').toLocaleDateString('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long',
    })
  }

  const etiqueta = etiquetaDia()
  const fechaLarga = new Date(fechaSeleccionada + 'T00:00:00').toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="page-container">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: 0 }}>Agenda</h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 0, textTransform: 'capitalize' }}>
            {fechaLarga}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Link href={`/dashboard/agenda?fecha=${diaAnterior.toISOString().split('T')[0]}`} style={navBtn(false)}>
            ← Anterior
          </Link>
          <Link href="/dashboard/agenda" style={navBtn(esHoy, true)}>
            Hoy
          </Link>
          <Link href={`/dashboard/agenda?fecha=${diaSiguiente.toISOString().split('T')[0]}`} style={navBtn(false)}>
            Siguiente →
          </Link>
          <AgendaDatePicker value={fechaSeleccionada} />
        </div>
      </div>

      {/* Resumen del día */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap',
      }}>
        <StatChip label="Programados" value={serviciosDia.length} color="#1d4ed8" />
        <StatChip label="Sin fecha" value={sinFecha.length} color="#6b7280" />
        <StatChip
          label="Pendientes"
          value={[...serviciosDia, ...sinFecha].filter(s => s.estado === 'pendiente').length}
          color="#a16207"
        />
        <StatChip
          label="En proceso"
          value={[...serviciosDia, ...sinFecha].filter(s => s.estado === 'en_proceso').length}
          color="#15803d"
        />
      </div>

      {/* Lista del día */}
      {serviciosDia.length === 0 && sinFecha.length === 0 ? (
        <div style={{
          background: 'white', borderRadius: 16, border: '1px solid #f3f4f6',
          padding: '48px 24px', textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <p style={{ fontSize: 15, color: '#9ca3af', margin: 0 }}>
            No hay servicios para {etiqueta.toLowerCase()}
          </p>
        </div>
      ) : (
        <>
          {serviciosDia.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <SectionLabel label={etiqueta} count={serviciosDia.length} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {serviciosDia.map(s => {
                  const hora = s.fechaRetiro ? new Date(s.fechaRetiro) : null
                  const esPasado = esHoy && hora ? hora < ahora : false
                  return (
                    <div key={s.id} style={{ opacity: esPasado ? 0.6 : 1, transition: 'opacity .15s' }}>
                      <AgendaCard s={s} />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {sinFecha.length > 0 && (
            <div>
              <SectionLabel label="Sin fecha asignada" count={sinFecha.length} muted />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sinFecha.map(s => <AgendaCard key={s.id} s={s} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function StatChip({ label, value, color }: { label: string; value: number; color: string }) {
  if (value === 0) return null
  return (
    <div style={{
      background: 'white', border: '1px solid #f3f4f6', borderRadius: 12,
      padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8,
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    }}>
      <span style={{ fontSize: 20, fontWeight: 700, color }}>{value}</span>
      <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{label}</span>
    </div>
  )
}

function SectionLabel({ label, count, muted }: { label: string; count: number; muted?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: muted ? '#9ca3af' : '#374151', textTransform: 'capitalize' }}>
        {label}
      </span>
      <span style={{
        fontSize: 11, fontWeight: 600, color: muted ? '#9ca3af' : '#6b7280',
        background: '#f3f4f6', padding: '2px 8px', borderRadius: 20,
      }}>
        {count}
      </span>
      <div style={{ flex: 1, height: 1, background: '#f3f4f6' }} />
    </div>
  )
}

function navBtn(active: boolean, isHoy = false): React.CSSProperties {
  return {
    padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: isHoy ? 600 : 500,
    border: '1px solid', borderColor: active ? '#111827' : '#e5e7eb',
    background: active ? '#111827' : 'white',
    color: active ? 'white' : '#374151',
    textDecoration: 'none',
  }
}