import { db } from '@/db'
import { veterinarias } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { VeterinariaForm } from '@/components/veterinarias/VeterinariaForm'

export default async function EditarVeterinariaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const vet = await db.query.veterinarias.findFirst({
    where: eq(veterinarias.id, id),
  })

  if (!vet) notFound()

  return (
    <div className="page-container">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: 0 }}>
          Editar — {vet.nombre}
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>
          Actualizá los datos y el convenio
        </p>
      </div>
      <VeterinariaForm veterinaria={vet} />
    </div>
  )
}