import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { templatesMsg } from '@/db/schema'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const [template] = await db.insert(templatesMsg).values({
      nombre: body.nombre,
      canal: body.canal,
      evento: body.evento,
      contenido: body.contenido,
      activo: body.activo ?? true,
    }).returning()

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Error creando template:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const data = await db.select().from(templatesMsg)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error obteniendo templates:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}