import { db } from '@/db'
import { convenios } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { ConvenioForm } from '@/components/convenios/ConvenioForm'

export default async function EditarConvenioPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const convenio = await db.query.convenios.findFirst({
    where: eq(convenios.id, id),
  })

  if (!convenio) notFound()

  return (
    <div className="page-container">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: 0 }}>
          Editar — {convenio.nombre}
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>
          Actualizá los datos y el convenio
        </p>
      </div>
      <ConvenioForm convenio={convenio} />
    </div>
  )
}