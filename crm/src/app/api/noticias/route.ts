import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { noticiasCementerio, usuarios } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const data = await db
      .select()
      .from(noticiasCementerio)
      .orderBy(desc(noticiasCementerio.destacada), desc(noticiasCementerio.creadoEn))
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
    if (usuario?.rol !== 'admin') return NextResponse.json({ error: 'Solo admins pueden publicar novedades' }, { status: 403 })

    const formData = await request.formData()
    const titulo = (formData.get('titulo') as string)?.trim()
    const contenido = (formData.get('contenido') as string)?.trim()
    const imagenFile = formData.get('imagen') as File | null

    if (!titulo || !contenido) {
      return NextResponse.json({ error: 'Título y descripción son requeridos' }, { status: 400 })
    }

    let imagenUrl: string | null = null

    if (imagenFile && imagenFile.size > 0) {
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
        imagenUrl = publicUrl
      }
    }

    const publicadaRaw = formData.get('publicada')
    const publicada = publicadaRaw === null ? true : publicadaRaw !== 'false'

    const [noticia] = await db.insert(noticiasCementerio).values({
      titulo,
      contenido,
      imagen: imagenUrl,
      creadoPorId: user.id,
      publicada,
    }).returning()

    return NextResponse.json(noticia, { status: 201 })
  } catch (error) {
    console.error('Error creando novedad:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
