import { db } from '@/db'
import { leads, usuarios } from '@/db/schema'
import { eq, count, and, gte, lt } from 'drizzle-orm'
import { ReportesManagerClient } from '@/components/dashboard/ReportesManagerClient'

export default async function ReportesManagerPage() {
  const agentes = await db.select().from(usuarios).where(eq(usuarios.rol, 'televenta'))

  return (
    <div className="page-container">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: 0 }}>Reportes</h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>
          Análisis de rendimiento por período
        </p>
      </div>
      <ReportesManagerClient agentes={agentes} />
    </div>
  )
}