import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { servicios, inventario } from '@/db/schema'
import { sql, eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar stock antes de insertar
    if (body.inventarioItemId) {
      const item = await db.query.inventario.findFirst({ where: eq(inventario.id, body.inventarioItemId) })
      if (!item || item.stockActual <= 0) {
        return NextResponse.json({ error: 'El producto seleccionado no tiene stock disponible.' }, { status: 400 })
      }
    }

    const [servicio] = await db.insert(servicios).values({
      numero: sql`nextval('servicios_numero_seq')`,
      clienteId: body.clienteId,
      mascotaId: body.mascotaId || null,
      tipo: body.tipo,
      estado: 'pendiente',
      precio: body.precio || null,
      descuento: body.descuento || '0',
      servicioConfigId: body.servicioConfigId || null,
      convenioId: body.convenioId || null,
      inventarioItemId: body.inventarioItemId || null,
      fechaRetiro: body.fechaRetiro ? new Date(body.fechaRetiro) : null,
      modalidadRetiro: body.modalidadRetiro || null,
      notas: body.notas,
    }).returning()

    // Decrementar stock si se asoció un producto
    if (body.inventarioItemId) {
      await db.update(inventario)
        .set({ stockActual: sql`${inventario.stockActual} - 1` })
        .where(eq(inventario.id, body.inventarioItemId))
    }

    revalidatePath('/dashboard', 'layout')
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