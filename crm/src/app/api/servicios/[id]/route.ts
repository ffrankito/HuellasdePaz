import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { servicios } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const [servicio] = await db.update(servicios)
      .set({ estado: body.estado, actualizadoEn: new Date() })
      .where(eq(servicios.id, id))
      .returning()

    return NextResponse.json(servicio)
  } catch (error) {
    console.error('Error actualizando servicio:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const servicio = await db.query.servicios.findFirst({
      where: eq(servicios.id, id),
    })
    if (!servicio) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json(servicio)
  } catch (error) {
    console.error('Error obteniendo servicio:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}