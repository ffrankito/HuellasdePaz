import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { planesConfig } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const updateData: Record<string, unknown> = { actualizadoEn: new Date() }
    if (body.nombre !== undefined) updateData.nombre = body.nombre
    if (body.descripcion !== undefined) updateData.descripcion = body.descripcion
    if (body.cuotaMensual !== undefined) updateData.cuotaMensual = body.cuotaMensual
    if (body.activo !== undefined) updateData.activo = body.activo

    const [planActualizado] = await db
      .update(planesConfig)
      .set(updateData)
      .where(eq(planesConfig.id, id))
      .returning()

    revalidatePath('/dashboard/configuracion')
    return NextResponse.json(planActualizado)
  } catch (error) {
    console.error('Error actualizando plan config:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.delete(planesConfig).where(eq(planesConfig.id, id))
    revalidatePath('/dashboard/configuracion')
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error eliminando plan config:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}