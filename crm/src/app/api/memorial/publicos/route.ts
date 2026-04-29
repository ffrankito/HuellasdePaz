import { NextResponse } from 'next/server'
import { db } from '@/db'
import { mascotas, clientes } from '@/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function GET() {
  try {
    const rows = await db
      .select({
        id: mascotas.id,
        nombre: mascotas.nombre,
        especie: mascotas.especie,
        raza: mascotas.raza,
        foto: mascotas.foto,
        dedicatoria: mascotas.dedicatoria,
        fechaFallecimiento: mascotas.fechaFallecimiento,
        tokenPortal: clientes.tokenPortal,
      })
      .from(mascotas)
      .innerJoin(clientes, eq(mascotas.clienteId, clientes.id))
      .where(eq(mascotas.memoriaPublica, true))

    return NextResponse.json(rows, { headers: corsHeaders })
  } catch (error) {
    console.error('Error obteniendo memoriales públicos:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500, headers: corsHeaders })
  }
}
