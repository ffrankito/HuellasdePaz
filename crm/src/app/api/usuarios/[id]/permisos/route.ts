import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { usuarios } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Solo admin puede modificar permisos
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const solicitante = await db.query.usuarios.findFirst({
      where: eq(usuarios.id, user.id),
    })
    if (!solicitante || solicitante.rol !== 'admin') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await request.json()
    const [actualizado] = await db
      .update(usuarios)
      .set({ permisos: body.permisos, actualizadoEn: new Date() })
      .where(eq(usuarios.id, id))
      .returning()

    return NextResponse.json(actualizado)
  } catch (error) {
    console.error('Error actualizando permisos:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}