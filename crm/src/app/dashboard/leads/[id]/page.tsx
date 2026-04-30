import { db } from '@/db'
import { leads, usuarios, leadInteracciones } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CambiarEstadoLeadForm } from '@/components/leads/CambiarEstadoLeadForm'
import { AgregarNotaForm } from '@/components/leads/AgregarNotaForm'

const estadoColors: Record<string, { bg: string; color: string }> = {
  nuevo: { bg: '#eff6ff', color: '#1d4ed8' },
  contactado: { bg: '#f0fdf4', color: '#15803d' },
  interesado: { bg: '#fefce8', color: '#a16207' },
  cotizado: { bg: '#fdf4ff', color: '#7e22ce' },
  convertido: { bg: '#f0fdf4', color: '#15803d' },
  perdido: { bg: '#fef2f2', color: '#dc2626' },
}

const tipoIcono: Record<string, string> = {
  asignacion: '👤',
  estado_cambio: '🔄',
  nota: '💬',
}

// Parsear el mensaje del cotizador en partes legibles
function parsearMensajeCotizador(mensaje: string): { label: string; value: string }[] | null {
  if (!mensaje || !mensaje.includes(' · ')) return null
  const partes = mensaje.split(' · ')
  const resultado: { label: string; value: string }[] = []
  for (const parte of partes) {
    if (parte.startsWith('Zona:')) resultado.push({ label: 'Zona', value: parte.replace('Zona: ', '') })
    else if (parte.startsWith('Mascota:')) resultado.push({ label: 'Mascota', value: parte.replace('Mascota: ', '') })
    else if (['HUELLITAS', 'AMIGOS PARA SIEMPRE', 'AMIGOS DE VERDAD'].some(s => parte.includes(s))) resultado.push({ label: 'Servicio', value: parte })
    else if (['PEQUEÑO', 'MEDIANO', 'GRANDE', 'EXTRA GRANDE'].some(s => parte.includes(s))) resultado.push({ label: 'Tamaño', value: parte })
    else if (['TRAERLA', 'RETIREN', 'SUCURSAL'].some(s => parte.toUpperCase().includes(s))) resultado.push({ label: 'Retiro', value: parte })
    else resultado.push({ label: 'Detalle', value: parte })
  }
  return resultado
}

export default async function LeadDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const lead = await db.query.leads.findFirst({
    where: eq(leads.id, id),
  })

  if (!lead) notFound()

  const [agente, interacciones] = await Promise.all([
    lead.asignadoAId
      ? db.query.usuarios.findFirst({ where: eq(usuarios.id, lead.asignadoAId) })
      : null,
    db
      .select()
      .from(leadInteracciones)
      .where(eq(leadInteracciones.leadId, id))
      .orderBy(leadInteracciones.creadoEn),
  ])

  const badge = estadoColors[lead.estado] ?? { bg: '#f3f4f6', color: '#374151' }

  let tiempoRespuesta: string | null = null
  if (lead.primerRespuestaEn) {
    const diff = new Date(lead.primerRespuestaEn).getTime() - new Date(lead.creadoEn).getTime()
    const horas = Math.floor(diff / (1000 * 60 * 60))
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    tiempoRespuesta = horas > 0 ? `${horas}h ${minutos}m` : `${minutos}m`
  }

  const seleccionesCotizador = lead.mensaje ? parsearMensajeCotizador(lead.mensaje) : null
  const esDeCotizador = lead.origen === 'cotizador' && seleccionesCotizador

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <Link href="/dashboard/leads" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>
            ← Leads
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: '4px 0 6px' }}>
            {lead.nombre}
          </h1>
          <span style={{ background: badge.bg, color: badge.color, padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
            {lead.estado.replace(/_/g, ' ')}
          </span>
        </div>
        <CambiarEstadoLeadForm leadId={lead.id} estadoActual={lead.estado} />
      </div>

      <div className="grid-2">

        {/* Columna izquierda */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Datos del lead */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>Datos del lead</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <InfoRow label="Teléfono" value={lead.telefono} />
              {lead.dni && <InfoRow label="DNI" value={lead.dni} />}
              <InfoRow label="Email" value={lead.email ?? '—'} />
              <InfoRow label="Origen" value={lead.origen ?? '—'} />
              <InfoRow label="Agente asignado" value={agente?.nombre ?? 'Sin asignar'} />
            </div>
          </div>

          {/* Selecciones del cotizador */}
          {esDeCotizador && (
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e0f2fe', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 16 }}>🐾</span>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 }}>Lo que seleccionó en el cotizador</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {seleccionesCotizador!.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f0f9ff', borderRadius: 10, fontSize: 14 }}>
                    <span style={{ color: '#6b7280', fontWeight: 500 }}>{item.label}</span>
                    <span style={{ color: '#0369a1', fontWeight: 600 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mensaje si no es cotizador */}
          {!esDeCotizador && lead.mensaje && (
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>Mensaje inicial</h2>
              <p style={{ fontSize: 14, color: '#374151', margin: 0, lineHeight: 1.6 }}>{lead.mensaje}</p>
            </div>
          )}

          {/* Mini reporte */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>Reporte del lead</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <InfoRow
                label="Fecha de ingreso"
                value={new Date(lead.creadoEn).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Argentina/Buenos_Aires' })}
              />
              <InfoRow label="Agente asignado" value={agente?.nombre ?? 'Sin asignar'} />
              <InfoRow label="Primera respuesta" value={tiempoRespuesta ? `En ${tiempoRespuesta}` : 'Sin respuesta aún'} />
              <InfoRow label="Interacciones" value={`${interacciones.length}`} />
              <InfoRow
                label="Última actividad"
                value={lead.ultimaInteraccionEn
                  ? new Date(lead.ultimaInteraccionEn).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' })
                  : '—'}
              />
              <InfoRow label="Estado actual" value={lead.estado.replace(/_/g, ' ')} />
            </div>
          </div>

          {/* Agregar nota */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>Agregar nota</h2>
            <AgregarNotaForm leadId={lead.id} />
          </div>
        </div>

        {/* Columna derecha — historial */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 20px' }}>
            Historial de actividad
          </h2>

          {interacciones.length === 0 ? (
            <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>Sin actividad registrada</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {interacciones.map((item, idx) => (
                <div key={item.id} style={{ display: 'flex', gap: 14 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                      {tipoIcono[item.tipo] ?? '•'}
                    </div>
                    {idx < interacciones.length - 1 && (
                      <div style={{ width: 2, flex: 1, background: '#f3f4f6', minHeight: 20, marginTop: 4 }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: 20, flex: 1 }}>
                    <p style={{ fontSize: 14, color: '#374151', margin: '6px 0 4px', lineHeight: 1.5 }}>
                      {item.descripcion}
                    </p>
                    <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>
                      {new Date(item.creadoEn).toLocaleDateString('es-AR', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                        timeZone: 'America/Argentina/Buenos_Aires',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, gap: 12 }}>
      <span style={{ color: '#9ca3af', flexShrink: 0 }}>{label}</span>
      <span style={{ color: '#111827', fontWeight: 500, textAlign: 'right', textTransform: 'capitalize' }}>{value}</span>
    </div>
  )
}