import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { clientes } from '@/db/schema'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const [cliente] = await db.insert(clientes).values({
      nombre: body.nombre,
      apellido: body.apellido,
      telefono: body.telefono,
      email: body.email,
      direccion: body.direccion,
      localidad: body.localidad,
      provincia: body.provincia ?? 'Santa Fe',
      origen: body.origen,
      notas: body.notas,
    }).returning()

    return NextResponse.json(cliente, { status: 201 })
  } catch (error) {
    console.error('Error creando cliente:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const data = await db.select().from(clientes)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error obteniendo clientes:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}