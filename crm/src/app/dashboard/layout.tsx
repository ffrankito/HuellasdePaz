import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
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

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar usuario={usuario} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}