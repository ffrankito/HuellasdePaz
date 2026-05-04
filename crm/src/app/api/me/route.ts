import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/db'
import { usuarios } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const usuario = await db.query.usuarios.findFirst({ where: eq(usuarios.id, user.id) })
  if (!usuario) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  return NextResponse.json({ id: usuario.id, nombre: usuario.nombre, rol: usuario.rol, mfaEmailActivo: usuario.mfaEmailActivo })
}
