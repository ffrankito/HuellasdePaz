import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { leads, leadInteracciones, usuarios } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const lead = await db.query.leads.findFirst({ where: eq(leads.id, id) })
    if (!lead) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json(lead)
  } catch (error) {
    console.error('Error obteniendo lead:', error)
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

    // Obtener usuario logueado
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const usuario = user
      ? await db.query.usuarios.findFirst({ where: eq(usuarios.id, user.id) })
      : null

    const leadActual = await db.query.leads.findFirst({ where: eq(leads.id, id) })
    if (!leadActual) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

    const ahora = new Date()
    const updateData: Record<string, unknown> = { actualizadoEn: ahora }
    const interaccionesACrear: { tipo: string; descripcion: string }[] = []

    // Cambio de estado
    if (body.estado && body.estado !== leadActual.estado) {
      updateData.estado = body.estado
      updateData.ultimaInteraccionEn = ahora

      // Si es la primera vez que se contacta, registrar primerRespuestaEn
      if (!leadActual.primerRespuestaEn && body.estado !== 'nuevo') {
        updateData.primerRespuestaEn = ahora
      }

      interaccionesACrear.push({
        tipo: 'estado_cambio',
        descripcion: `Estado cambiado de "${leadActual.estado.replace(/_/g, ' ')}" a "${body.estado.replace(/_/g, ' ')}"`,
      })
    }

    // Agregar nota
    if (body.nota) {
      updateData.ultimaInteraccionEn = ahora

      // Primera interacción también cuenta como primera respuesta
      if (!leadActual.primerRespuestaEn) {
        updateData.primerRespuestaEn = ahora
      }

      interaccionesACrear.push({
        tipo: 'nota',
        descripcion: body.nota,
      })
    }

    // Actualizar el lead
    const [leadActualizado] = await db
      .update(leads)
      .set(updateData)
      .where(eq(leads.id, id))
      .returning()

    // Registrar todas las interacciones
    for (const interaccion of interaccionesACrear) {
      await db.insert(leadInteracciones).values({
        leadId: id,
        usuarioId: usuario?.id ?? null,
        tipo: interaccion.tipo,
        descripcion: interaccion.descripcion,
      })
    }

    return NextResponse.json(leadActualizado)
  } catch (error) {
    console.error('Error actualizando lead:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.delete(leads).where(eq(leads.id, id))
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error eliminando lead:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}