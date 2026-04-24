import { db } from '@/db'
import { servicios, clientes, mascotas, convenios } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ServicioEstadoForm } from '@/components/servicios/ServicioEstadoForm'

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

const tipoLabel: Record<string, string> = {
  cremacion_individual: 'Cremación individual',
  cremacion_comunitaria: 'Cremación comunitaria',
  entierro: 'Entierro',
}

const estadoOrden = [
  'ingresado', 'retiro_pendiente', 'en_transporte', 'recibido',
  'en_cremacion', 'cremado', 'listo_entrega', 'entregado',
]

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f9fafb' }}>
      <span style={{ fontSize: 13, color: '#9ca3af' }}>{label}</span>
      <span style={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

export default async function ServicioDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [row] = await db
    .select({
      servicio: servicios,
      cliente: clientes,
      mascota: mascotas,
      convenioNombre: convenios.nombre,
    })
    .from(servicios)
    .leftJoin(clientes, eq(servicios.clienteId, clientes.id))
    .leftJoin(mascotas, eq(servicios.mascotaId, mascotas.id))
    .leftJoin(convenios, eq(clientes.veterinariaId, convenios.id))
    .where(eq(servicios.id, id))
    .limit(1)

  if (!row?.servicio) notFound()

  const { servicio, cliente, mascota, convenioNombre } = row
  const badge = estadoColors[servicio.estado] ?? { bg: '#f3f4f6', color: '#374151' }
  const neto = servicio.precio
    ? Number(servicio.precio) - Number(servicio.descuento ?? 0)
    : null
  const pasoActual = estadoOrden.indexOf(servicio.estado)

  return (
    <div className="page-container">
      {/* Encabezado */}
      <div style={{ marginBottom: 28 }}>
        <Link href="/dashboard/servicios" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>
          ← Servicios
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: 0 }}>
            Servicio #{String(servicio.numero).padStart(4, '0')}
          </h1>
          <span style={{ background: badge.bg, color: badge.color, padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 500 }}>
            {servicio.estado.replace(/_/g, ' ')}
          </span>
        </div>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>
          {tipoLabel[servicio.tipo] ?? servicio.tipo}
        </p>
      </div>

      {/* Progreso */}
      {servicio.estado !== 'cancelado' && (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '20px 24px', marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {estadoOrden.map((e, i) => {
              const done = i <= pasoActual
              const active = i === pasoActual
              return (
                <div key={e} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative' }}>
                  {i > 0 && (
                    <div style={{
                      position: 'absolute', top: 10, right: '50%', left: '-50%', height: 2,
                      background: done ? '#2d8a54' : '#e5e7eb',
                    }} />
                  )}
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', zIndex: 1,
                    background: active ? '#2d8a54' : done ? '#bbf7d0' : '#f3f4f6',
                    border: active ? '3px solid #2d8a54' : 'none',
                  }} />
                  <span style={{ fontSize: 10, color: active ? '#2d8a54' : done ? '#6b7280' : '#d1d5db', textAlign: 'center', lineHeight: 1.2 }}>
                    {e.replace(/_/g, ' ')}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid-2">
        {/* Datos del servicio */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 16, marginTop: 0 }}>Datos del servicio</h2>
          <InfoRow label="Tipo" value={tipoLabel[servicio.tipo] ?? servicio.tipo} />
          <InfoRow label="Fecha de retiro" value={servicio.fechaRetiro ? new Date(servicio.fechaRetiro).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} />
          <InfoRow label="Fecha de cremación" value={servicio.fechaCremacion ? new Date(servicio.fechaCremacion).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} />
          <InfoRow label="Fecha de entrega" value={servicio.fechaEntrega ? new Date(servicio.fechaEntrega).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} />
          {convenioNombre && <InfoRow label="Convenio" value={convenioNombre} />}
          {neto !== null && (
            <InfoRow
              label="Precio"
              value={`$${neto.toLocaleString('es-AR')}${Number(servicio.descuento) > 0 ? ` (desc. $${Number(servicio.descuento).toLocaleString('es-AR')})` : ''}`}
            />
          )}
          {servicio.notas && (
            <div style={{ marginTop: 12, padding: '12px 14px', background: '#f9fafb', borderRadius: 10 }}>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 4px' }}>Notas</p>
              <p style={{ fontSize: 14, color: '#374151', margin: 0 }}>{servicio.notas}</p>
            </div>
          )}
        </div>

        {/* Cliente y mascota */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 }}>Cliente</h2>
              {cliente && (
                <Link href={`/dashboard/clientes/${cliente.id}`} style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none' }}>
                  Ver perfil →
                </Link>
              )}
            </div>
            {cliente ? (
              <>
                <InfoRow label="Nombre" value={`${cliente.nombre} ${cliente.apellido}`} />
                <InfoRow label="Teléfono" value={cliente.telefono} />
                <InfoRow label="Email" value={cliente.email ?? '—'} />
              </>
            ) : (
              <p style={{ fontSize: 14, color: '#9ca3af' }}>Sin datos</p>
            )}
          </div>

          {mascota && (
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 16, marginTop: 0 }}>Mascota</h2>
              <InfoRow label="Nombre" value={mascota.nombre} />
              <InfoRow label="Especie" value={mascota.especie} />
              {mascota.raza && <InfoRow label="Raza" value={mascota.raza} />}
              {mascota.color && <InfoRow label="Color" value={mascota.color} />}
            </div>
          )}

          {/* Cambiar estado */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 16, marginTop: 0 }}>Cambiar estado</h2>
            <ServicioEstadoForm servicioId={servicio.id} estadoActual={servicio.estado} />
          </div>
        </div>
      </div>
    </div>
  )
}
