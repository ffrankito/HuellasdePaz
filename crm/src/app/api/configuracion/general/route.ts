import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { configuracionGeneral } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()

    const [config] = await db.update(configuracionGeneral)
      .set({ valores: body.valores, actualizadoEn: new Date() })
      .where(eq(configuracionGeneral.clave, body.clave))
      .returning()

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error actualizando configuracion:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}