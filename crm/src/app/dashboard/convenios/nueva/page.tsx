import { db } from '@/db'
import { serviciosConfig } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { ConvenioForm } from '@/components/convenios/ConvenioForm'

export default async function NuevoConvenioPage() {
  const configs = await db.select().from(serviciosConfig).where(eq(serviciosConfig.activo, true))

  return (
    <div className="page-container">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: 0 }}>Nuevo convenio</h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>
          Registrá un convenio y configurá sus beneficios
        </p>
      </div>
      <ConvenioForm serviciosConfig={configs} />
    </div>
  )
}
