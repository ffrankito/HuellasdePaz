import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { clientes } from '@/db/schema'
import { generarToken } from '@/lib/utils/token'
import { requireAuth } from '@/lib/api-auth'

export async function POST(request: NextRequest) {
  const auth = await requireAuth(['admin', 'manager', 'televenta'])
  if (!auth.ok) return auth.response

  try {
    const body = await request.json()

    const [cliente] = await db.insert(clientes).values({
      nombre: body.nombre,
      apellido: body.apellido,
      telefono: body.telefono,
      email: body.email,
      dni: body.dni ?? null,
      direccion: body.direccion,
      localidad: body.localidad,
      provincia: body.provincia ?? 'Santa Fe',
      origen: body.origen,
      notas: body.notas,
      tokenPortal: generarToken(),
    }).returning()

    revalidatePath('/dashboard', 'layout')
    return NextResponse.json(cliente, { status: 201 })
  } catch (error) {
    console.error('Error creando cliente:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function GET() {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  try {
    const data = await db.select().from(clientes)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error obteniendo clientes:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}