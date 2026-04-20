import { db } from '@/db'
import { planes, clientes, mascotas, planesConfig } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { RegistrarPagoButton } from '@/components/planes/RegistrarPagoButton'

const estadoColors: Record<string, { bg: string; color: string }> = {
  activo: { bg: '#f0fdf4', color: '#15803d' },
  pausado: { bg: '#fefce8', color: '#a16207' },
  cancelado: { bg: '#fef2f2', color: '#dc2626' },
  utilizado: { bg: '#f3f4f6', color: '#6b7280' },
}

export default async function DetallePlanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [plan] = await db
    .select({
      id: planes.id,
      numero: planes.numero,
      estado: planes.estado,
      clienteId: planes.clienteId,
      mascotaId: planes.mascotaId,
      planConfigId: planes.planConfigId,
      cuotasMensual: planes.cuotasMensual,
      cuotasPagadas: planes.cuotasPagadas,
      cuotasTotales: planes.cuotasTotales,
      porcentajeCobertura: planes.porcentajeCobertura,
      mascotaAdicional: planes.mascotaAdicional,
      notas: planes.notas,
      creadoEn: planes.creadoEn,
      actualizadoEn: planes.actualizadoEn,
      clienteNombre: clientes.nombre,
      clienteApellido: clientes.apellido,
      clienteTelefono: clientes.telefono,
      clienteEmail: clientes.email,
      mascotaNombre: mascotas.nombre,
      mascotaEspecie: mascotas.especie,
    })
    .from(planes)
    .leftJoin(clientes, eq(planes.clienteId, clientes.id))
    .leftJoin(mascotas, eq(planes.mascotaId, mascotas.id))
    .where(eq(planes.id, id))

  if (!plan) notFound()

  const planConfig = plan.planConfigId
    ? await db.query.planesConfig.findFirst({ where: eq(planesConfig.id, plan.planConfigId) })
    : null

  const badge = estadoColors[plan.estado] ?? { bg: '#f3f4f6', color: '#374151' }
  const totalCobrado = Number(plan.cuotasMensual) * (plan.cuotasPagadas ?? 0)
  const cobertura = plan.cuotasPagadas >= 12 ? 100 : plan.cuotasPagadas >= 6 ? 50 : 0

  return (
    <div className="page-container">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <Link href="/dashboard/planes" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>
            ← Planes
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: '4px 0 8px' }}>
            Plan #{String(plan.numero).padStart(4, '0')}
          </h1>
          <span style={{ background: badge.bg, color: badge.color, padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
            {plan.estado}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <RegistrarPagoButton planId={plan.id} cuotasPagadas={plan.cuotasPagadas ?? 0} cuotaMensual={Number(plan.cuotasMensual)} />
          <Link href={`/dashboard/planes/${plan.id}/editar`} style={{
            background: '#111827', color: 'white', padding: '10px 20px',
            borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: 'none',
          }}>
            Editar
          </Link>
        </div>
      </div>

      <div className="grid-2">

        {/* Columna izquierda */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Cliente */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>Cliente</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <InfoRow label="Nombre" value={`${plan.clienteNombre} ${plan.clienteApellido ?? ''}`} />
              <InfoRow label="Teléfono" value={plan.clienteTelefono ?? '—'} />
              {plan.clienteEmail && <InfoRow label="Email" value={plan.clienteEmail} />}
              {plan.mascotaNombre && <InfoRow label="Mascota" value={`${plan.mascotaNombre} (${plan.mascotaEspecie ?? ''})`} />}
              {plan.mascotaAdicional && (
                <span style={{ fontSize: 12, background: '#f5f3ff', color: '#7e22ce', padding: '3px 10px', borderRadius: 20, width: 'fit-content' }}>
                  + Mascota adicional
                </span>
              )}
            </div>
            <Link href={`/dashboard/clientes/${plan.clienteId}`} style={{ display: 'block', marginTop: 16, fontSize: 13, color: '#1d4ed8', textDecoration: 'none' }}>
              Ver ficha del cliente →
            </Link>
          </div>

          {/* Plan */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>Detalles del plan</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {planConfig && <InfoRow label="Plan" value={planConfig.nombre} />}
              <InfoRow label="Cuota mensual" value={`$${Number(plan.cuotasMensual).toLocaleString('es-AR')}`} />
              <InfoRow label="Vigencia" value="Indefinida hasta baja" />
              <InfoRow label="Cobertura actual" value={`${cobertura}%`} />
              <InfoRow label="Alta del plan" value={new Date(plan.creadoEn).toLocaleDateString('es-AR')} />
            </div>
          </div>

          {plan.notas && (
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>Notas</h2>
              <p style={{ fontSize: 14, color: '#4b5563', margin: 0, lineHeight: 1.6 }}>{plan.notas}</p>
            </div>
          )}
        </div>

        {/* Columna derecha — pagos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Métricas de pagos */}
          <div className="grid-2">
            <div style={{ background: '#f0fdf4', borderRadius: 14, border: '1px solid #bbf7d0', padding: '18px 20px' }}>
              <p style={{ fontSize: 12, color: '#15803d', margin: '0 0 6px' }}>Cuotas pagadas</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#15803d', margin: 0 }}>{plan.cuotasPagadas ?? 0}</p>
            </div>
            <div style={{ background: '#eff6ff', borderRadius: 14, border: '1px solid #bfdbfe', padding: '18px 20px' }}>
              <p style={{ fontSize: 12, color: '#1d4ed8', margin: '0 0 6px' }}>Total cobrado</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#1d4ed8', margin: 0 }}>${totalCobrado.toLocaleString('es-AR')}</p>
            </div>
          </div>

          {/* Cobertura */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>Cobertura escalonada</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { cuotas: '1 a 5 cuotas', cobertura: '0%', activo: (plan.cuotasPagadas ?? 0) < 6 },
                { cuotas: '6 a 11 cuotas', cobertura: '50%', activo: (plan.cuotasPagadas ?? 0) >= 6 && (plan.cuotasPagadas ?? 0) < 12 },
                { cuotas: '12+ cuotas', cobertura: '100%', activo: (plan.cuotasPagadas ?? 0) >= 12 },
              ].map(tramo => (
                <div key={tramo.cuotas} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 16px', borderRadius: 10,
                  background: tramo.activo ? '#f0fdf4' : '#f9fafb',
                  border: `1px solid ${tramo.activo ? '#bbf7d0' : '#f3f4f6'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {tramo.activo && <span style={{ fontSize: 12 }}>✓</span>}
                    <span style={{ fontSize: 13, color: tramo.activo ? '#15803d' : '#6b7280' }}>{tramo.cuotas}</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: tramo.activo ? '#15803d' : '#9ca3af' }}>
                    {tramo.cobertura}
                  </span>
                </div>
              ))}
            </div>
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