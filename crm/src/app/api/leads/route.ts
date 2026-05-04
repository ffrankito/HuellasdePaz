import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { leads, usuarios } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { crearLeadAutomatico } from '@/lib/leads/crearLeadAutomatico'
import type { OrigenLead } from '@/lib/leads/crearLeadAutomatico'
import { getCorsHeaders } from '@/lib/cors'
import { requireAuth } from '@/lib/api-auth'

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: getCorsHeaders(request.headers.get('origin')) })
}

export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request.headers.get('origin'))
  try {
    const body = await request.json()
    if (!body.nombre || !body.telefono) {
      return NextResponse.json({ error: 'Nombre y teléfono son requeridos' }, { status: 400, headers: corsHeaders })
    }
    const { lead, esNuevo } = await crearLeadAutomatico({
      nombre: body.nombre,
      telefono: body.telefono,
      email: body.email,
      dni: body.dni,
      mensaje: body.mensaje,
      origen: (body.origen as OrigenLead) ?? 'directo',
      pickupMethod: body.pickupMethod,
      veterinariaId: body.veterinariaId,
      importacionId: body.importacionId,
    })
    revalidatePath('/dashboard', 'layout')
    return NextResponse.json(lead, { status: esNuevo ? 201 : 200, headers: corsHeaders })
  } catch (error) {
    console.error('Error creando lead:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500, headers: corsHeaders })
  }
}

export async function GET(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request.headers.get('origin'))

  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const agenteId = searchParams.get('agenteId')
    const misLeads = searchParams.get('misLeads')

    const esAdminOManager = auth.usuario.rol === 'admin' || auth.usuario.rol === 'manager'

    // Solo admin/manager pueden ver leads de otros agentes
    if (agenteId && !esAdminOManager) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403, headers: corsHeaders })
    }

    const query = db
      .select({
        id: leads.id,
        nombre: leads.nombre,
        telefono: leads.telefono,
        email: leads.email,
        dni: leads.dni,
        mensaje: leads.mensaje,
        origen: leads.origen,
        estado: leads.estado,
        pickupMethod: leads.pickupMethod,
        asignadoAId: leads.asignadoAId,
        agenteNombre: usuarios.nombre,
        notas: leads.notas,
        primerRespuestaEn: leads.primerRespuestaEn,
        ultimaInteraccionEn: leads.ultimaInteraccionEn,
        seguimientoEn: leads.seguimientoEn,
        creadoEn: leads.creadoEn,
        actualizadoEn: leads.actualizadoEn,
      })
      .from(leads)
      .leftJoin(usuarios, eq(leads.asignadoAId, usuarios.id))
      .orderBy(asc(leads.creadoEn))

    const data = misLeads === 'true'
      ? await query.where(eq(leads.asignadoAId, auth.usuario.id))
      : agenteId
        ? await query.where(eq(leads.asignadoAId, agenteId))
        : await query

    return NextResponse.json(data, { headers: corsHeaders })
  } catch (error) {
    console.error('Error obteniendo leads:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500, headers: corsHeaders })
  }
}