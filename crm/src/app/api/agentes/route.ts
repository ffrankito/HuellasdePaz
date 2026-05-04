import { NextResponse } from 'next/server'
import { db } from '@/db'
import { usuarios } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { requireAuth } from '@/lib/api-auth'

export async function GET() {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  const data = await db
    .select({ id: usuarios.id, nombre: usuarios.nombre, rol: usuarios.rol })
    .from(usuarios)
    .where(eq(usuarios.rol, 'televenta'))
    .orderBy(asc(usuarios.nombre))

  return NextResponse.json(data)
}
