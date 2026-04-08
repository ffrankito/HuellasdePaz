import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { leads } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const [lead] = await db.update(leads)
      .set({ estado: body.estado, actualizadoEn: new Date() })
      .where(eq(leads.id, id))
      .returning()

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Error actualizando lead:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}