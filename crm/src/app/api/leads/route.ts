import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { leads } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { crearLeadAutomatico, type OrigenLead } from '@/lib/leads/crearLeadAutomatico'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.nombre || !body.telefono) {
      return NextResponse.json({ error: 'Nombre y teléfono son requeridos' }, { status: 400 })
    }
    const { lead, esNuevo } = await crearLeadAutomatico({
      nombre: body.nombre,
      telefono: body.telefono,
      email: body.email,
      mensaje: body.mensaje,
      origen: (body.origen as OrigenLead) ?? 'directo',
      veterinariaId: body.veterinariaId,
    })
    return NextResponse.json(lead, { status: esNuevo ? 201 : 200 })
  } catch (error) {
    console.error('Error creando lead:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agenteId = searchParams.get('agenteId')
    const data = agenteId
      ? await db.select().from(leads).where(eq(leads.asignadoAId, agenteId)).orderBy(asc(leads.creadoEn))
      : await db.select().from(leads).orderBy(asc(leads.creadoEn))
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error obteniendo leads:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}