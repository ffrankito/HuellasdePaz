import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { serviciosConfig } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const [updated] = await db.update(serviciosConfig).set({
      nombre: body.nombre,
      tipo: body.tipo,
      precio: body.precio ? body.precio.toString() : null,
      descripcion: body.descripcion || null,
      activo: body.activo ?? true,
      actualizadoEn: new Date(),
    }).where(eq(serviciosConfig.id, id)).returning()
    if (!updated) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error actualizando config servicio:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
