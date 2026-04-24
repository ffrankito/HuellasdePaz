import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { servicios, clientes } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const [servicio] = await db.insert(servicios).values({
      numero: sql`nextval('servicios_numero_seq')`,
      clienteId: body.clienteId,
      mascotaId: body.mascotaId,
      tipo: body.tipo,
      estado: 'ingresado',
      fechaRetiro: body.fechaRetiro ? new Date(body.fechaRetiro) : null,
      notas: body.notas,
    }).returning()

    if (body.convenioId && body.clienteId) {
      await db.update(clientes)
        .set({ veterinariaId: body.convenioId, actualizadoEn: new Date() })
        .where(eq(clientes.id, body.clienteId))
    }

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