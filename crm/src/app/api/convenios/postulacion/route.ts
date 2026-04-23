import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { convenios } from '@/db/schema'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.nombre || !body.tipo || !body.responsable || !body.telefono) {
      return NextResponse.json(
        { error: 'Nombre, tipo, responsable y teléfono son requeridos' },
        { status: 400, headers: corsHeaders }
      )
    }

    const tiposValidos = ['veterinaria', 'petshop', 'refugio', 'clinica', 'otro']
    if (!tiposValidos.includes(body.tipo)) {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400, headers: corsHeaders })
    }

    const notasBase = 'Postulación recibida desde la landing.'
    const notas = body.mensaje ? `${notasBase}\n\n${body.mensaje}` : notasBase

    const [convenio] = await db
      .insert(convenios)
      .values({
        nombre:         body.nombre,
        tipo:           body.tipo,
        responsable:    body.responsable,
        telefono:       body.telefono,
        email:          body.email || null,
        estadoConvenio: 'en_negociacion',
        notas,
      })
      .returning()

    return NextResponse.json(convenio, { status: 201, headers: corsHeaders })
  } catch (error) {
    console.error('Error creando postulación de convenio:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500, headers: corsHeaders })
  }
}
