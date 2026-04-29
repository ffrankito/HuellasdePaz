import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { importacionesLeads, leads, leadInteracciones } from '@/db/schema'
import { eq, inArray } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const [updated] = await db.update(importacionesLeads)
      .set({
        totalImportados: body.totalImportados,
        totalDuplicados: body.totalDuplicados,
        totalErrores: body.totalErrores,
      })
      .where(eq(importacionesLeads.id, id))
      .returning()
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error actualizando importacion:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Obtener IDs de leads de esta importación
    const leadsDeImportacion = await db
      .select({ id: leads.id })
      .from(leads)
      .where(eq(leads.importacionId, id))

    if (leadsDeImportacion.length > 0) {
      const leadIds = leadsDeImportacion.map(l => l.id)
      await db.delete(leadInteracciones).where(inArray(leadInteracciones.leadId, leadIds))
      await db.delete(leads).where(inArray(leads.id, leadIds))
    }

    await db.delete(importacionesLeads).where(eq(importacionesLeads.id, id))
    revalidatePath('/dashboard', 'layout')
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error eliminando importacion:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
