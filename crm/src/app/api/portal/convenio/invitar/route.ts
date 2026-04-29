import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { convenios } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { createClient } from '@supabase/supabase-js'
import { enviarInvitacionConvenio } from '@/lib/email/invitacionConvenio'

export async function POST(request: NextRequest) {
  try {
    const { convenioId } = await request.json()

    const convenio = await db.query.convenios.findFirst({
      where: eq(convenios.id, convenioId),
    })

    if (!convenio) return NextResponse.json({ error: 'Convenio no encontrado' }, { status: 404 })
    if (!convenio.email) return NextResponse.json({ error: 'El convenio no tiene email registrado' }, { status: 400 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const { data: usuariosExistentes } = await supabase.auth.admin.listUsers()
    const usuarioExistente = usuariosExistentes?.users?.find(u => u.email === convenio.email)

    let authUserId: string
    let linkActivacion: string

    const activarUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portal/convenio/activar?token=${convenio.tokenPortal}`

    if (usuarioExistente) {
      authUserId = usuarioExistente.id
      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: convenio.email,
        options: { redirectTo: activarUrl },
      })
      if (error) return NextResponse.json({ error: 'Error al generar el link' }, { status: 500 })
      linkActivacion = data.properties.action_link
    } else {
      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'invite',
        email: convenio.email,
        options: {
          redirectTo: activarUrl,
          data: { nombre: convenio.nombre, convenioId: convenio.id, tokenPortal: convenio.tokenPortal },
        },
      })
      if (error) return NextResponse.json({ error: 'Error al generar la invitación' }, { status: 500 })
      authUserId = data.user.id
      linkActivacion = data.properties.action_link
    }

    await db.update(convenios).set({ authUserId, portalActivo: true }).where(eq(convenios.id, convenioId))

    await enviarInvitacionConvenio({
      nombre: convenio.responsable ?? convenio.nombre,
      email: convenio.email,
      linkActivacion,
    })

    revalidatePath('/dashboard/convenios', 'layout')
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
