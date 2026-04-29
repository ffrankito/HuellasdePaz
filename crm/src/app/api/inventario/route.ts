import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { inventario } from '@/db/schema'
import { and, eq, gt } from 'drizzle-orm'

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
      paraVenta: body.paraVenta ?? false,
    }).returning()

    revalidatePath('/dashboard', 'layout')
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creando producto:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const selector = searchParams.get('selector') === 'true'

    const data = selector
      ? await db.select().from(inventario).where(
          and(eq(inventario.paraVenta, true), gt(inventario.stockActual, 0))
        )
      : await db.select().from(inventario)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error obteniendo inventario:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}