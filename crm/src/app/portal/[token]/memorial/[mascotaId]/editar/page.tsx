import { db } from '@/db'
import { clientes, mascotas } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditarMemorialForm } from '@/components/portal/EditarMemorialForm'

export default async function EditarMemorialPage({
  params,
}: {
  params: Promise<{ token: string; mascotaId: string }>
}) {
  const { token, mascotaId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const cliente = await db.query.clientes.findFirst({
    where: eq(clientes.tokenPortal, token),
  })

  if (!cliente) notFound()

  if (!user || user.id !== cliente.authUserId) {
    redirect(`/portal/login?token=${token}`)
  }

  const mascota = await db.query.mascotas.findFirst({
    where: and(eq(mascotas.id, mascotaId), eq(mascotas.clienteId, cliente.id)),
  })

  if (!mascota) notFound()

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>
      <div style={{ background: '#111827', padding: '20px 24px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href={`/portal/${token}/memorial/${mascotaId}`} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 14 }}>← Volver</a>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'white', margin: 0 }}>Editar memorial de {mascota.nombre}</p>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>
        <EditarMemorialForm mascota={mascota} token={token} />
      </div>
    </div>
  )
}