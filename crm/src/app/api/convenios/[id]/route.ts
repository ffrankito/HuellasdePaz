import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { convenios } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const convenio = await db.query.convenios.findFirst({ where: eq(convenios.id, id) })
    if (!convenio) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json(convenio)
  } catch (error) {
    console.error('Error obteniendo convenio:', error)
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

    // Allow partial updates (e.g., toggle portalActivo) or full form saves
    const campos = body.nombre !== undefined ? {
      nombre: body.nombre,
      tipo: body.tipo,
      direccion: body.direccion || null,
      telefono: body.telefono || null,
      email: body.email || null,
      responsable: body.responsable || null,
      instagram: body.instagram || null,
      web: body.web || null,
      estadoConvenio: body.estadoConvenio,
      descuentoPorcentaje: body.descuentoPorcentaje?.toString() ?? '0',
      beneficioDescripcion: body.beneficioDescripcion || null,
      serviciosCubiertos: body.serviciosCubiertos ?? null,
      fechaInicioConvenio: body.fechaInicioConvenio ? new Date(body.fechaInicioConvenio) : null,
      fechaVencimientoConvenio: body.fechaVencimientoConvenio ? new Date(body.fechaVencimientoConvenio) : null,
      notas: body.notas || null,
      actualizadoEn: new Date(),
    } : {
      ...(body.portalActivo !== undefined && { portalActivo: body.portalActivo }),
      actualizadoEn: new Date(),
    }

    const [actualizado] = await db.update(convenios).set(campos).where(eq(convenios.id, id)).returning()

    if (!actualizado) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    revalidatePath('/dashboard', 'layout')
    return NextResponse.json(actualizado)
  } catch (error) {
    console.error('Error actualizando convenio:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
