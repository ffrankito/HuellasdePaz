import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/db'
import { clientes } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const cliente = await db.query.clientes.findFirst({
    where: eq(clientes.authUserId, user.id),
  })

  if (!cliente) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  return NextResponse.json({ token: cliente.tokenPortal })
}
