import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { convenios } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const convenio = await db.query.convenios.findFirst({ where: eq(convenios.id, id) })
    if (!convenio) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json(convenio)
  } catch (error) {
    console.error('Error obteniendo convenio:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const [actualizado] = await db.update(convenios).set({ ...body, actualizadoEn: new Date() }).where(eq(convenios.id, id)).returning()
    return NextResponse.json(actualizado)
  } catch (error) {
    console.error('Error actualizando convenio:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}