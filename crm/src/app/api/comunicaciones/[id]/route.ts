import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { comunicaciones } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '@/lib/api-auth'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  try {
    const { id } = await params
    const body = await request.json()

    const [comunicacion] = await db.update(comunicaciones)
      .set({ estado: body.estado })
      .where(eq(comunicaciones.id, id))
      .returning()

    revalidatePath('/dashboard/comunicacion')
    return NextResponse.json(comunicacion)
  } catch (error) {
    console.error('Error actualizando comunicacion:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}