import { NuevoServicioForm } from '@/components/dashboard/NuevoServicioForm'
import { db } from '@/db'
import { clientes, mascotas } from '@/db/schema'

export default async function NuevoServicioPage() {
  const clientesData = await db.select().from(clientes)
  const mascotasData = await db.select().from(mascotas)

  return (
    <div style={{ padding: '40px 48px', background: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: 0 }}>Nuevo servicio</h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>Registrá un nuevo servicio</p>
      </div>
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', maxWidth: 680 }}>
        <NuevoServicioForm clientes={clientesData} mascotas={mascotasData} />
      </div>
    </div>
  )
}