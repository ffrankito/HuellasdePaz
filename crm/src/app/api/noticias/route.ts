import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { noticiasCementerio, usuarios } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const data = await db
      .select()
      .from(noticiasCementerio)
      .orderBy(desc(noticiasCementerio.creadoEn))
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error obteniendo noticias:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const usuario = await db.query.usuarios.findFirst({ where: eq(usuarios.id, user.id) })
    if (usuario?.rol !== 'admin') return NextResponse.json({ error: 'Solo admins pueden publicar noticias' }, { status: 403 })

    const body = await request.json()
    if (!body.titulo?.trim() || !body.contenido?.trim()) {
      return NextResponse.json({ error: 'Título y contenido son requeridos' }, { status: 400 })
    }

    const [noticia] = await db.insert(noticiasCementerio).values({
      titulo: body.titulo.trim(),
      contenido: body.contenido.trim(),
      creadoPorId: user.id,
    }).returning()

    return NextResponse.json(noticia, { status: 201 })
  } catch (error) {
    console.error('Error creando noticia:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
