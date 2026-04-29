import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/db'
import { convenios } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const convenio = await db.query.convenios.findFirst({
    where: eq(convenios.authUserId, user.id),
  })

  if (!convenio) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  return NextResponse.json({ token: convenio.tokenPortal })
}
