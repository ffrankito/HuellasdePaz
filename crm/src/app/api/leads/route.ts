import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { leads } from '@/db/schema'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const [lead] = await db.insert(leads).values({
      nombre: body.nombre,
      telefono: body.telefono,
      email: body.email,
      origen: body.origen ?? 'landing',
      mensaje: body.mensaje,
    }).returning()

    return NextResponse.json(lead, { status: 201 })
  } catch (error) {
    console.error('Error creando lead:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const data = await db.select().from(leads)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error obteniendo leads:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}