import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { convenios } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { crearLeadAutomatico } from '@/lib/leads/crearLeadAutomatico'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params

  const convenio = await db.query.convenios.findFirst({
    where: eq(convenios.tokenPortal, token),
  })
  if (!convenio) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  if (!convenio.portalActivo) return NextResponse.json({ error: 'Portal inactivo' }, { status: 403 })

  const body = await request.json()
  if (!body.nombre?.trim() || !body.telefono?.trim()) {
    return NextResponse.json({ error: 'Nombre y teléfono son requeridos' }, { status: 400 })
  }

  const partesMascota: string[] = []
  if (body.mascotaNombre) partesMascota.push(`Mascota: ${body.mascotaNombre}`)
  if (body.mascotaEspecie) partesMascota.push(`(${body.mascotaEspecie})`)
  if (body.servicioInteres) partesMascota.push(`Servicio de interés: ${body.servicioInteres}`)
  if (body.notas) partesMascota.push(`Notas: ${body.notas}`)

  const mensaje = partesMascota.length > 0 ? partesMascota.join(' · ') : undefined

  const { lead, esNuevo } = await crearLeadAutomatico({
    nombre: body.nombre.trim(),
    telefono: body.telefono.trim(),
    email: body.email?.trim() || undefined,
    dni: body.dni?.trim() || undefined,
    mensaje,
    origen: 'veterinaria',
    veterinariaId: convenio.id,
  })

  return NextResponse.json(lead, { status: esNuevo ? 201 : 200 })
}
