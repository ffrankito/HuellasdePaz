import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { mascotas } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const [mascota] = await db.insert(mascotas).values({
      clienteId: body.clienteId,
      nombre: body.nombre,
      especie: body.especie,
      raza: body.raza,
      color: body.color,
      fechaNacimiento: body.fechaNacimiento,
      notas: body.notas,
    }).returning()

    revalidatePath('/dashboard', 'layout')
    revalidatePath('/', 'layout')
    return NextResponse.json(mascota, { status: 201 })
  } catch (error) {
    console.error('Error creando mascota:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clienteId = searchParams.get('clienteId')

    const data = clienteId
      ? await db.select().from(mascotas).where(eq(mascotas.clienteId, clienteId))
      : await db.select().from(mascotas)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error obteniendo mascotas:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}