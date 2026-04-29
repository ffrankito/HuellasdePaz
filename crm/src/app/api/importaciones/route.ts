import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { importacionesLeads } from '@/db/schema'
import { desc } from 'drizzle-orm'

export async function GET() {
  try {
    const data = await db.select().from(importacionesLeads).orderBy(desc(importacionesLeads.creadoEn))
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error obteniendo importaciones:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const [importacion] = await db.insert(importacionesLeads).values({
      nombreArchivo: body.nombreArchivo,
      totalImportados: 0,
      totalDuplicados: 0,
      totalErrores: 0,
    }).returning()
    return NextResponse.json(importacion, { status: 201 })
  } catch (error) {
    console.error('Error creando importacion:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
