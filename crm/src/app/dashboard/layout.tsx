import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
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
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const usuario = await db.query.usuarios.findFirst({
    where: eq(usuarios.id, user.id),
  })

  if (!usuario) redirect('/auth/login')

  if (usuario.mfaEmailActivo) {
    const cookieStore = await cookies()
    const mfaS = cookieStore.get('mfa_s')?.value
    const valid = !!mfaS && (() => {
      const sep = mfaS.lastIndexOf(':')
      const uid = mfaS.slice(0, sep)
      const token = mfaS.slice(sep + 1)
      return (
        uid === usuario.id &&
        usuario.mfaSesionToken === token &&
        usuario.mfaSesionExpiraEn != null &&
        new Date() < usuario.mfaSesionExpiraEn
      )
    })()
    if (!valid) redirect('/auth/verificar-mfa')
  }

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