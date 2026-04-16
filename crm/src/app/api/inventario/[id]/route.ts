import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { inventario } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const item = await db.query.inventario.findFirst({ where: eq(inventario.id, id) })
    if (!item) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json(item)
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const [item] = await db.update(inventario)
      .set({
        nombre: body.nombre,
        descripcion: body.descripcion,
        categoria: body.categoria,
        stockActual: body.stockActual,
        stockMinimo: body.stockMinimo,
        proveedor: body.proveedor,
        notas: body.notas,
        foto: body.foto,
        actualizadoEn: new Date(),
      })
      .where(eq(inventario.id, id))
      .returning()

    return NextResponse.json(item)
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.delete(inventario).where(eq(inventario.id, id))
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}