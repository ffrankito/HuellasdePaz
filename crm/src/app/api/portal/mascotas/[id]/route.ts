import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { clientes, mascotas } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { createClient } from '@supabase/supabase-js'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: mascotaId } = await params
    const formData = await request.formData()

    const token = formData.get('token') as string
    const dedicatoria = formData.get('dedicatoria') as string | null
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

    if (foto && foto.size > 0) {
      const ext = foto.name.split('.').pop() ?? 'jpg'
      const path = `mascotas/${mascotaId}/foto.${ext}`
      const buffer = Buffer.from(await foto.arrayBuffer())
      const { error: uploadError } = await supabase.storage
        .from('portal')
        .upload(path, buffer, { upsert: true, contentType: foto.type })
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('portal').getPublicUrl(path)
        updates.foto = publicUrl
      }
    }

    if (galeria.length > 0 || galeriaExistente !== null) {
      // Start from the existing gallery (potentially pruned by the user) or the current DB state
      const base: string[] = galeriaExistente !== null ? galeriaExistente : [...(mascota.galeria ?? [])]
      const galeriaUrls: string[] = [...base]
      for (const img of galeria) {
        if (img.size === 0) continue
        const ext = img.name.split('.').pop() ?? 'jpg'
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const path = `mascotas/${mascotaId}/galeria/${filename}`
        const buffer = Buffer.from(await img.arrayBuffer())
        const { error: uploadError } = await supabase.storage
          .from('portal')
          .upload(path, buffer, { upsert: false, contentType: img.type })
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

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error eliminando foto:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
