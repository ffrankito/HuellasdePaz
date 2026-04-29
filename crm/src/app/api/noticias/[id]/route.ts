import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { noticiasCementerio, usuarios } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const usuario = await db.query.usuarios.findFirst({ where: eq(usuarios.id, user.id) })
  return usuario?.rol === 'admin' ? usuario : null
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

    const { id } = await params
    const contentType = request.headers.get('content-type') ?? ''

    // JSON body: toggle publicada or destacada
    if (contentType.includes('application/json')) {
      const body = await request.json()
      const updates: Record<string, unknown> = {}
      if (typeof body.publicada === 'boolean') updates.publicada = body.publicada
      if (typeof body.destacada === 'boolean') updates.destacada = body.destacada
      if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'Nada para actualizar' }, { status: 400 })

      const [updated] = await db.update(noticiasCementerio).set(updates).where(eq(noticiasCementerio.id, id)).returning()
      revalidatePath('/dashboard/novedades')
      revalidatePath('/', 'layout')
      return NextResponse.json(updated)
    }

    // FormData: full edit
    const formData = await request.formData()
    const titulo = (formData.get('titulo') as string)?.trim()
    const contenido = (formData.get('contenido') as string)?.trim()
    const imagenFile = formData.get('imagen') as File | null
    const quitarImagen = formData.get('quitarImagen') === 'true'

    if (!titulo || !contenido) return NextResponse.json({ error: 'Título y descripción requeridos' }, { status: 400 })

    const updates: Record<string, unknown> = { titulo, contenido }

    if (quitarImagen) {
      updates.imagen = null
    } else if (imagenFile && imagenFile.size > 0) {
      const storage = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      )
      const ext = imagenFile.name.split('.').pop() ?? 'jpg'
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const path = `novedades/${filename}`
      const buffer = Buffer.from(await imagenFile.arrayBuffer())
      const { error: uploadError } = await storage.storage
        .from('portal')
        .upload(path, buffer, { upsert: false, contentType: imagenFile.type })
      if (!uploadError) {
        const { data: { publicUrl } } = storage.storage.from('portal').getPublicUrl(path)
        updates.imagen = publicUrl
      }
    }

    const [updated] = await db.update(noticiasCementerio)
      .set(updates)
      .where(eq(noticiasCementerio.id, id))
      .returning()

    revalidatePath('/dashboard/novedades')
    revalidatePath('/', 'layout')
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error editando novedad:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

    const { id } = await params
    await db.delete(noticiasCementerio).where(eq(noticiasCementerio.id, id))
    revalidatePath('/dashboard/novedades')
    revalidatePath('/', 'layout')
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error eliminando novedad:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
