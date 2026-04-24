import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { servicios } from '@/db/schema'
import { sql } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const [servicio] = await db.insert(servicios).values({
      numero: sql`nextval('servicios_numero_seq')`,
      clienteId: body.clienteId,
      mascotaId: body.mascotaId || null,
      tipo: body.tipo,
      estado: 'ingresado',
      precio: body.precio || null,
      descuento: body.descuento || '0',
      servicioConfigId: body.servicioConfigId || null,
      convenioId: body.convenioId || null,
      fechaRetiro: body.fechaRetiro ? new Date(body.fechaRetiro) : null,
      notas: body.notas,
    }).returning()

    return NextResponse.json(servicio, { status: 201 })
  } catch (error) {
    console.error('Error creando servicio:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const data = await db.select().from(servicios)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error obteniendo servicios:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}