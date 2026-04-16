import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { inventario } from '@/db/schema'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const [item] = await db.insert(inventario).values({
      nombre: body.nombre,
      descripcion: body.descripcion,
      categoria: body.categoria,
      stockActual: body.stockActual,
      stockMinimo: body.stockMinimo,
      proveedor: body.proveedor,
      notas: body.notas,
      foto: body.foto,
    }).returning()

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creando producto:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const data = await db.select().from(inventario)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error obteniendo inventario:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}