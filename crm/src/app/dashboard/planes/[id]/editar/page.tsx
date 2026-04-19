import { db } from '@/db'
import { planes, clientes, mascotas, planesConfig } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { NuevoPlanForm } from '@/components/dashboard/NuevoPlanForm'

export default async function EditarPlanPage({
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
      mascotaNombre: mascotas.nombre,
    })
    .from(planes)
    .leftJoin(clientes, eq(planes.clienteId, clientes.id))
    .leftJoin(mascotas, eq(planes.mascotaId, mascotas.id))
    .where(eq(planes.id, id))

  if (!plan) notFound()

  const [clientesData, mascotasData, planesConfigData] = await Promise.all([
    db.select().from(clientes),
    db.select().from(mascotas),
    db.select().from(planesConfig),
  ])

  return (
    <div style={{ padding: '40px 48px', background: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: 0 }}>
          Editar plan #{String(plan.numero).padStart(4, '0')}
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>
          {plan.clienteNombre}
        </p>
      </div>
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', maxWidth: 680 }}>
        <NuevoPlanForm
          clientes={clientesData}
          mascotas={mascotasData}
          planesConfig={planesConfigData}
          planExistente={plan as any}
        />
      </div>
    </div>
  )
}