import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { planes } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const plan = await db.query.planes.findFirst({ where: eq(planes.id, id) })
    if (!plan) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json(plan)
  } catch (error) {
    console.error('Error obteniendo plan:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const updateData: Record<string, unknown> = { actualizadoEn: new Date() }

    if (body.estado !== undefined) updateData.estado = body.estado
    if (body.cuotasPagadas !== undefined) updateData.cuotasPagadas = Number(body.cuotasPagadas)
    if (body.mascotaId !== undefined) updateData.mascotaId = body.mascotaId
    if (body.mascotaAdicional !== undefined) updateData.mascotaAdicional = body.mascotaAdicional
    if (body.notas !== undefined) updateData.notas = body.notas
    if (body.planConfigId !== undefined) updateData.planConfigId = body.planConfigId
    if (body.cuotasMensual !== undefined) updateData.cuotasMensual = body.cuotasMensual

    // Calcular porcentaje de cobertura según cuotas pagadas
    if (body.cuotasPagadas !== undefined) {
      const pagadas = Number(body.cuotasPagadas)
      if (pagadas <= 6) updateData.porcentajeCobertura = '0'
      else if (pagadas <= 12) updateData.porcentajeCobertura = '50'
      else updateData.porcentajeCobertura = '100'
    }

    const [planActualizado] = await db
      .update(planes)
      .set(updateData)
      .where(eq(planes.id, id))
      .returning()

    return NextResponse.json(planActualizado)
  } catch (error) {
    console.error('Error actualizando plan:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}