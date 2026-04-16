import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { comunicaciones } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const [comunicacion] = await db.update(comunicaciones)
      .set({ estado: body.estado })
      .where(eq(comunicaciones.id, id))
      .returning()

    return NextResponse.json(comunicacion)
  } catch (error) {
    console.error('Error actualizando comunicacion:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}