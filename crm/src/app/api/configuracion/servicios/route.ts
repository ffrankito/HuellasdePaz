import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { serviciosConfig } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getCorsHeaders } from '@/lib/cors'

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: getCorsHeaders(request.headers.get('origin')) })
}

export async function GET(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request.headers.get('origin'))
  const data = await db.select().from(serviciosConfig).where(eq(serviciosConfig.activo, true))
  return NextResponse.json(data, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const [config] = await db.insert(serviciosConfig).values({
      nombre: body.nombre,
      tipo: body.tipo,
      precio: body.precio ? body.precio.toString() : null,
      descripcion: body.descripcion || null,
    }).returning()
    revalidatePath('/dashboard/configuracion')
    return NextResponse.json(config, { status: 201 })
  } catch (error) {
    console.error('Error creando config servicio:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
