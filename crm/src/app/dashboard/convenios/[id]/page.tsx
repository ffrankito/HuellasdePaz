import { db } from '@/db'
import { convenios, leads, clientes, servicios, serviciosConfig } from '@/db/schema'
import { eq, count, and, sql } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { InvitarConvenioBtn, TogglePortalActivoBtn } from '@/components/convenios/PortalConvenioBtn'

const estadoColors: Record<string, { bg: string; color: string; label: string }> = {
  sin_convenio: { bg: '#f3f4f6', color: '#6b7280', label: 'Sin convenio' },
  en_negociacion: { bg: '#fefce8', color: '#a16207', label: 'En negociación' },
  activo: { bg: '#f0fdf4', color: '#15803d', label: 'Convenio activo' },
  pausado: { bg: '#fef2f2', color: '#dc2626', label: 'Pausado' },
}

export default async function ConvenioDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const convenio = await db.query.convenios.findFirst({
    where: eq(convenios.id, id),
  })

  if (!convenio) notFound()

  const todosLosConfigs = await db.select({ id: serviciosConfig.id, nombre: serviciosConfig.nombre }).from(serviciosConfig)
  const configMap = Object.fromEntries(todosLosConfigs.map(c => [c.id, c.nombre]))

  const [
    totalLeads,
    leadsConvertidos,
    leadsNuevos,
    totalClientes,
    ultimosLeads,
    ultimosClientes,
    [statsServicios],
  ] = await Promise.all([
    db.select({ count: count() }).from(leads).where(eq(leads.veterinariaId, id)),
    db.select({ count: count() }).from(leads).where(and(eq(leads.veterinariaId, id), eq(leads.estado, 'convertido'))),
    db.select({ count: count() }).from(leads).where(and(eq(leads.veterinariaId, id), eq(leads.estado, 'nuevo'))),
    db.select({ count: count() }).from(clientes).where(eq(clientes.veterinariaId, id)),
    db.select().from(leads).where(eq(leads.veterinariaId, id)).orderBy(leads.creadoEn).limit(5),
    db.select().from(clientes).where(eq(clientes.veterinariaId, id)).orderBy(clientes.creadoEn).limit(5),
    db.select({
      totalServicios:      sql<number>`count(*)`,
      comisionCobrada:     sql<number>`coalesce(sum(coalesce(${servicios.descuento},0)::numeric) filter (where ${servicios.pagado} = true), 0)`,
      comisionPendiente:   sql<number>`coalesce(sum(coalesce(${servicios.descuento},0)::numeric) filter (where ${servicios.pagado} = false and ${servicios.estado} != 'cancelado'), 0)`,
    }).from(servicios).where(eq(servicios.convenioId, id)),
  ])

  const conversion = totalLeads[0].count > 0
    ? Math.round((leadsConvertidos[0].count / totalLeads[0].count) * 100)
    : 0

  const comisionCobrada   = Number(statsServicios.comisionCobrada)
  const comisionPendiente = Number(statsServicios.comisionPendiente)
  const totalServicios    = Number(statsServicios.totalServicios)

  const badge = estadoColors[convenio.estadoConvenio] ?? estadoColors.sin_convenio

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <Link href="/dashboard/convenios" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>
            ← Convenios
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: '4px 0 8px' }}>
            {convenio.nombre}
          </h1>
          <span style={{ background: badge.bg, color: badge.color, padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
            {badge.label}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <TogglePortalActivoBtn convenioId={id} portalActivo={convenio.portalActivo ?? false} />
          <InvitarConvenioBtn
            convenioId={id}
            email={convenio.email ?? null}
            yaInvitado={!!convenio.authUserId}
          />
          <Link href={`/dashboard/convenios/${id}/editar`} style={{
            background: '#111827', color: 'white', padding: '10px 20px',
            borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: 'none',
          }}>
            Editar
          </Link>
        </div>
      </div>

      <div className="grid-2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>Datos de contacto</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <InfoRow label="Tipo" value={convenio.tipo ?? '—'} />
              <InfoRow label="Responsable" value={convenio.responsable ?? '—'} />
              <InfoRow label="Teléfono" value={convenio.telefono ?? '—'} />
              <InfoRow label="Email" value={convenio.email ?? '—'} />
              <InfoRow label="Dirección" value={convenio.direccion ?? '—'} />
              {convenio.instagram && <InfoRow label="Instagram" value={convenio.instagram} />}
              {convenio.web && <InfoRow label="Web" value={convenio.web} />}
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>Convenio</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <InfoRow label="Estado" value={badge.label} />
              <InfoRow label="Comisión" value={Number(convenio.descuentoPorcentaje) > 0 ? `${Number(convenio.descuentoPorcentaje)}%` : '—'} />
              {convenio.beneficioDescripcion && <InfoRow label="Beneficio" value={convenio.beneficioDescripcion} />}
              <InfoRow
                label="Servicios"
                value={
                  convenio.serviciosCubiertos && (convenio.serviciosCubiertos as string[]).length > 0
                    ? (convenio.serviciosCubiertos as string[]).map(id => configMap[id] ?? id).join(', ')
                    : 'Todos los servicios'
                }
              />
              {convenio.fechaInicioConvenio && <InfoRow label="Inicio" value={new Date(convenio.fechaInicioConvenio).toLocaleDateString('es-AR')} />}
              {convenio.fechaVencimientoConvenio && <InfoRow label="Vencimiento" value={new Date(convenio.fechaVencimientoConvenio).toLocaleDateString('es-AR')} />}
            </div>
          </div>

          {convenio.notas && (
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>Notas</h2>
              <p style={{ fontSize: 14, color: '#4b5563', margin: 0, lineHeight: 1.6 }}>{convenio.notas}</p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Comisiones acumuladas */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>Comisiones a pagar</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f0faf5', borderRadius: 12, border: '1px solid #d1ead9' }}>
                <div>
                  <p style={{ fontSize: 12, color: '#2d8a54', margin: '0 0 2px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ya cobrado</p>
                  <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>Servicios pagados por el cliente</p>
                </div>
                <p style={{ fontSize: 26, fontWeight: 700, color: '#2d8a54', margin: 0 }}>
                  ${comisionCobrada.toLocaleString('es-AR')}
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: comisionPendiente > 0 ? '#fefce8' : '#f9fafb', borderRadius: 12, border: `1px solid ${comisionPendiente > 0 ? '#fde68a' : '#f3f4f6'}` }}>
                <div>
                  <p style={{ fontSize: 12, color: comisionPendiente > 0 ? '#a16207' : '#9ca3af', margin: '0 0 2px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pendiente de cobro</p>
                  <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>Servicios aún no pagados</p>
                </div>
                <p style={{ fontSize: 26, fontWeight: 700, color: comisionPendiente > 0 ? '#a16207' : '#9ca3af', margin: 0 }}>
                  ${comisionPendiente.toLocaleString('es-AR')}
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 4px' }}>
                <span style={{ color: '#9ca3af' }}>Servicios derivados totales</span>
                <span style={{ fontWeight: 600, color: '#111827' }}>{totalServicios}</span>
              </div>
            </div>
          </div>

          {/* Métricas leads/clientes */}
          <div className="grid-2">
            <div style={{ background: '#f0fdf4', borderRadius: 14, border: '1px solid #bbf7d0', padding: '18px 20px' }}>
              <p style={{ fontSize: 12, color: '#15803d', margin: '0 0 6px' }}>Clientes derivados</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#15803d', margin: 0 }}>{totalClientes[0].count}</p>
            </div>
            <div style={{ background: '#eff6ff', borderRadius: 14, border: '1px solid #bfdbfe', padding: '18px 20px' }}>
              <p style={{ fontSize: 12, color: '#1d4ed8', margin: '0 0 6px' }}>Leads totales</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#1d4ed8', margin: 0 }}>{totalLeads[0].count}</p>
            </div>
            <div style={{ background: 'white', borderRadius: 14, border: '1px solid #f3f4f6', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 6px' }}>Sin contactar</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#a16207', margin: 0 }}>{leadsNuevos[0].count}</p>
            </div>
            <div style={{ background: 'white', borderRadius: 14, border: '1px solid #f3f4f6', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 6px' }}>Conversión</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0 }}>{conversion}%</p>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 }}>Últimos leads</h2>
              <Link href={`/dashboard/leads?veterinariaId=${id}`} style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>Ver todos →</Link>
            </div>
            {ultimosLeads.length === 0 ? (
              <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>Sin leads todavía</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ultimosLeads.map(l => (
                  <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f9fafb' }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#111827', margin: 0 }}>{l.nombre}</p>
                      <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{l.telefono}</p>
                    </div>
                    <span style={{ fontSize: 12, color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: 20 }}>{l.estado}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 }}>Clientes derivados</h2>
              <Link href={`/dashboard/clientes?veterinariaId=${id}`} style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>Ver todos →</Link>
            </div>
            {ultimosClientes.length === 0 ? (
              <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>Sin clientes todavía</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ultimosClientes.map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f9fafb' }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#111827', margin: 0 }}>{c.nombre} {c.apellido}</p>
                      <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{c.telefono}</p>
                    </div>
                    <Link href={`/dashboard/clientes/${c.id}`} style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none' }}>Ver →</Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, gap: 12 }}>
      <span style={{ color: '#9ca3af', flexShrink: 0 }}>{label}</span>
      <span style={{ color: '#111827', fontWeight: 500, textAlign: 'right' }}>{value}</span>
    </div>
  )
}