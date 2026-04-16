// crm/src/app/dashboard/clientes/[id]/mascotas/nueva/page.tsx
import NuevaMascotaForm from '@/components/clientes/NuevaMascotaForm'
import Link from 'next/link'

export default async function NuevaMascotaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div style={{ padding: '40px 48px', background: '#f9fafb', minHeight: '100vh' }}>
      <Link href={`/dashboard/clientes/${id}`} style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>
        ← Volver al perfil
      </Link>
      <div style={{ marginTop: 12, marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: 0 }}>Nueva mascota</h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>Completá los datos de la mascota</p>
      </div>
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', maxWidth: 520 }}>
        <NuevaMascotaForm clienteId={id} />
      </div>
    </div>
  )
}