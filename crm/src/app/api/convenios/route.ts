import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { convenios } from '@/db/schema'
import { eq } from 'drizzle-orm'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const soloActivos = searchParams.get('activos') === 'true'

    const data = soloActivos
      ? await db.select().from(convenios).where(eq(convenios.estadoConvenio, 'activo'))
      : await db.select().from(convenios)

    return NextResponse.json(data, { headers: corsHeaders })
  } catch (error) {
    console.error('Error obteniendo convenios:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500, headers: corsHeaders })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.nombre) {
      return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
    }

    const [convenio] = await db.insert(convenios).values({
      nombre: body.nombre,
      tipo: body.tipo ?? 'veterinaria',
      direccion: body.direccion || null,
      telefono: body.telefono || null,
      email: body.email || null,
      responsable: body.responsable || null,
      instagram: body.instagram || null,
      web: body.web || null,
      estadoConvenio: body.estadoConvenio ?? 'sin_convenio',
      descuentoPorcentaje: body.descuentoPorcentaje?.toString() ?? '0',
      beneficioDescripcion: body.beneficioDescripcion || null,
      fechaInicioConvenio: body.fechaInicioConvenio ? new Date(body.fechaInicioConvenio) : null,
      fechaVencimientoConvenio: body.fechaVencimientoConvenio ? new Date(body.fechaVencimientoConvenio) : null,
      notas: body.notas || null,
    }).returning()

    return NextResponse.json(convenio, { status: 201 })
  } catch (error) {
    console.error('Error creando convenio:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
