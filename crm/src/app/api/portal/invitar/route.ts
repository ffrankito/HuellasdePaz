import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { clientes } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { createClient } from '@supabase/supabase-js'
import { enviarInvitacion } from '@/lib/email/invitacion'

export async function POST(request: NextRequest) {
  try {
    const { clienteId } = await request.json()

    const cliente = await db.query.clientes.findFirst({
      where: eq(clientes.id, clienteId),
    })

    if (!cliente) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    if (!cliente.email) return NextResponse.json({ error: 'El cliente no tiene email registrado' }, { status: 400 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const { data: usuariosExistentes } = await supabase.auth.admin.listUsers()
    const usuarioExistente = usuariosExistentes?.users?.find(u => u.email === cliente.email)

    let authUserId: string
    let linkActivacion: string

    if (usuarioExistente) {
      authUserId = usuarioExistente.id
      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: cliente.email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/portal/${cliente.tokenPortal}`,
        },
      })
      if (error) return NextResponse.json({ error: 'Error al generar el link' }, { status: 500 })
      linkActivacion = data.properties.action_link
    } else {
      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'invite',
        email: cliente.email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/portal/activar?token=${cliente.tokenPortal}`,
          data: {
            nombre: cliente.nombre,
            clienteId: cliente.id,
            tokenPortal: cliente.tokenPortal,
          },
        },
      })
      if (error) return NextResponse.json({ error: 'Error al generar la invitación' }, { status: 500 })
      authUserId = data.user.id
      linkActivacion = data.properties.action_link
    }

    await db.update(clientes)
      .set({ authUserId })
      .where(eq(clientes.id, clienteId))

    await enviarInvitacion({
      nombre: cliente.nombre,
      email: cliente.email,
      linkActivacion,
    })

    revalidatePath('/dashboard/clientes')
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}