import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { planesConfig } from '@/db/schema'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const [plan] = await db.insert(planesConfig).values({
      nombre: body.nombre,
      descripcion: body.descripcion,
      cuotaMensual: body.cuotaMensual,
      cuotasTotales: body.cuotasTotales,
      activo: body.activo ?? true,
    }).returning()

    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    console.error('Error creando plan config:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const data = await db.select().from(planesConfig)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error obteniendo planes config:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}