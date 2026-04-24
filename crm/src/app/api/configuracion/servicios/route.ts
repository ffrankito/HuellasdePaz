import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { serviciosConfig } from '@/db/schema'

export async function GET() {
  const data = await db.select().from(serviciosConfig)
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const [config] = await db.insert(serviciosConfig).values({
      nombre: body.nombre,
      tipo: body.tipo,
      precio: body.precio ? body.precio.toString() : null,
      descripcion: body.descripcion || null,
    }).returning()
    return NextResponse.json(config, { status: 201 })
  } catch (error) {
    console.error('Error creando config servicio:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
