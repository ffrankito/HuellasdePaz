import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { planes, clientes } from '@/db/schema'
import { sql, eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const [plan] = await db.insert(planes).values({
      numero: sql`nextval('planes_numero_seq')`,
      clienteId: body.clienteId,
      mascotaId: body.mascotaId,
      planConfigId: body.planConfigId,
      cuotasMensual: body.cuotasMensual,
      cuotasTotales: body.cuotasTotales,
      cuotasPagadas: 0,
      porcentajeCobertura: '0',
      estado: 'activo',
      notas: body.notas,
    }).returning()

    if (body.convenioId && body.clienteId) {
      await db.update(clientes)
        .set({ veterinariaId: body.convenioId, actualizadoEn: new Date() })
        .where(eq(clientes.id, body.clienteId))
    }

    revalidatePath('/dashboard', 'layout')
    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    console.error('Error creando plan:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const data = await db.select().from(planes)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error obteniendo planes:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}