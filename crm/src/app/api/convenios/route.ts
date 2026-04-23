import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { convenios } from '@/db/schema'

export async function GET() {
  try {
    const data = await db.select().from(convenios)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error obteniendo convenios:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
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
