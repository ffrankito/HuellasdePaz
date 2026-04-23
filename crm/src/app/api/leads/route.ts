import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { leads } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { crearLeadAutomatico } from '@/lib/leads/crearLeadAutomatico'
import type { OrigenLead } from '@/lib/leads/crearLeadAutomatico'
import { createClient } from '@/lib/supabase/server'
import { getCorsHeaders } from '@/lib/cors'

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
      mensaje: body.mensaje,
      origen: (body.origen as OrigenLead) ?? 'directo',
      veterinariaId: body.veterinariaId,
    })
    return NextResponse.json(lead, { status: esNuevo ? 201 : 200, headers: corsHeaders })
  } catch (error) {
    console.error('Error creando lead:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500, headers: corsHeaders })
  }
}

export async function GET(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request.headers.get('origin'))
  try {
    const { searchParams } = new URL(request.url)
    const agenteId = searchParams.get('agenteId')
    const misLeads = searchParams.get('misLeads')

    let userId: string | null = null

    if (misLeads === 'true') {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id ?? null
    }

    const data = userId
      ? await db.select().from(leads).where(eq(leads.asignadoAId, userId)).orderBy(asc(leads.creadoEn))
      : agenteId
        ? await db.select().from(leads).where(eq(leads.asignadoAId, agenteId)).orderBy(asc(leads.creadoEn))
        : await db.select().from(leads).orderBy(asc(leads.creadoEn))

    return NextResponse.json(data, { headers: corsHeaders })
  } catch (error) {
    console.error('Error obteniendo leads:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500, headers: corsHeaders })
  }
}