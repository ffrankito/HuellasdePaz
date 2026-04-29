import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { clientes, mascotas } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: mascotaId } = await params
    const formData = await request.formData()

    const token = formData.get('token') as string
    const dedicatoria = formData.get('dedicatoria') as string | null
    const memoriaPublicaRaw = formData.get('memoriaPublica') as string | null
    const memoriaPublica = memoriaPublicaRaw !== null ? memoriaPublicaRaw === 'true' : null
    const foto = formData.get('foto') as File | null
    const galeria = formData.getAll('galeria') as File[]
    const galeriaExistenteRaw = formData.get('galeriaExistente') as string | null
    const galeriaExistente: string[] = galeriaExistenteRaw ? JSON.parse(galeriaExistenteRaw) : null

    if (!token) return NextResponse.json({ error: 'Token requerido' }, { status: 400 })

    const cliente = await db.query.clientes.findFirst({
      where: eq(clientes.tokenPortal, token),
    })
    if (!cliente) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

    const mascota = await db.query.mascotas.findFirst({
      where: and(eq(mascotas.id, mascotaId), eq(mascotas.clienteId, cliente.id)),
    })
    if (!mascota) return NextResponse.json({ error: 'Mascota no encontrada' }, { status: 404 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const updates: Record<string, unknown> = {
      actualizadoEn: new Date(),
    }

    if (dedicatoria !== null) updates.dedicatoria = dedicatoria
    if (memoriaPublica !== null) updates.memoriaPublica = memoriaPublica

    if (foto && foto.size > 0) {
      const raw = Buffer.from(await foto.arrayBuffer())
      const jpeg = await sharp(raw).rotate().resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer()
      const path = `mascotas/${mascotaId}/foto.jpg`
      const { error: uploadError } = await supabase.storage
        .from('portal')
        .upload(path, jpeg, { upsert: true, contentType: 'image/jpeg' })
      if (uploadError) {
        console.error('Supabase Storage upload error:', uploadError)
        return NextResponse.json({ error: 'storage_error', detail: uploadError.message }, { status: 500 })
      }
      const { data: { publicUrl } } = supabase.storage.from('portal').getPublicUrl(path)
      updates.foto = `${publicUrl}?t=${Date.now()}`
    }

    if (galeria.length > 0 || galeriaExistente !== null) {
      // Start from the existing gallery (potentially pruned by the user) or the current DB state
      const base: string[] = galeriaExistente !== null ? galeriaExistente : [...(mascota.galeria ?? [])]
      const galeriaUrls: string[] = [...base]
      for (const img of galeria) {
        if (img.size === 0) continue
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
        const path = `mascotas/${mascotaId}/galeria/${filename}`
        const rawImg = Buffer.from(await img.arrayBuffer())
        const jpegImg = await sharp(rawImg).rotate().resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer()
        const { error: uploadError } = await supabase.storage
          .from('portal')
          .upload(path, jpegImg, { upsert: false, contentType: 'image/jpeg' })
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('portal').getPublicUrl(path)
          galeriaUrls.push(publicUrl)
        }
      }
      updates.galeria = galeriaUrls
    }

    const [updated] = await db.update(mascotas)
      .set(updates)
      .where(eq(mascotas.id, mascotaId))
      .returning()

    revalidatePath('/', 'layout')
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error actualizando memorial:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: mascotaId } = await params
    const { token, url: fotoUrl } = await request.json()

    if (!token) return NextResponse.json({ error: 'Token requerido' }, { status: 400 })

    const cliente = await db.query.clientes.findFirst({
      where: eq(clientes.tokenPortal, token),
    })
    if (!cliente) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

    const mascota = await db.query.mascotas.findFirst({
      where: and(eq(mascotas.id, mascotaId), eq(mascotas.clienteId, cliente.id)),
    })
    if (!mascota) return NextResponse.json({ error: 'Mascota no encontrada' }, { status: 404 })

    const nuevaGaleria = (mascota.galeria ?? []).filter((u: string) => u !== fotoUrl)
    const [updated] = await db.update(mascotas)
      .set({ galeria: nuevaGaleria, actualizadoEn: new Date() })
      .where(eq(mascotas.id, mascotaId))
      .returning()

    revalidatePath('/', 'layout')
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error eliminando foto:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
