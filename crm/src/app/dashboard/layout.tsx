import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { AsistenteWidget } from '@/components/asistente/AsistenteWidget'
import { DarkModeInit } from '@/components/DarkModeInit'
import { db } from '@/db'
import { usuarios } from '@/db/schema'
import { eq } from 'drizzle-orm'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) redirect('/auth/login')

  const usuario = await db.query.usuarios.findFirst({
    where: eq(usuarios.id, session.user.id),
  })

  if (!usuario) redirect('/auth/login')

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <DarkModeInit />
      <Sidebar usuario={usuario} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header nombre={usuario.nombre} />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
      <AsistenteWidget />
    </div>
  )
}