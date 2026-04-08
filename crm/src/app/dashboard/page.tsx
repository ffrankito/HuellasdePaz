import { db } from '@/db'
import { clientes, servicios, leads } from '@/db/schema'
import { count } from 'drizzle-orm'

export default async function DashboardPage() {
  const [totalClientes, totalServicios, totalLeads] = await Promise.all([
    db.select({ count: count() }).from(clientes),
    db.select({ count: count() }).from(servicios),
    db.select({ count: count() }).from(leads),
  ])

  return (
    <div style={{ padding: '40px 48px', background: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>Resumen general del sistema</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        <StatCard title="Clientes" value={totalClientes[0].count} />
        <StatCard title="Servicios activos" value={totalServicios[0].count} />
        <StatCard title="Leads nuevos" value={totalLeads[0].count} />
      </div>
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: 16,
      border: '1px solid #f3f4f6',
      padding: '24px 28px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{title}</p>
      <p style={{ fontSize: 36, fontWeight: 600, color: '#111827', marginTop: 8, marginBottom: 0 }}>{value}</p>
    </div>
  )
}