import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { servicios, clientes, mascotas } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notificarCambioEstado } from '@/lib/email/estadoServicio'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const [servicio] = await db.update(servicios)
      .set({ estado: body.estado, actualizadoEn: new Date() })
      .where(eq(servicios.id, id))
      .returning()

    // Enviar email de notificación si el cliente tiene email
    if (servicio && body.estado) {
      enviarNotificacion(servicio).catch(e => console.error('Notificación estado fallida:', e))
    }

    return NextResponse.json(servicio)
  } catch (error) {
    console.error('Error actualizando servicio:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

async function enviarNotificacion(servicio: { clienteId: string; mascotaId: string | null; estado: string }) {
  const [cliente, mascota] = await Promise.all([
    db.query.clientes.findFirst({ where: eq(clientes.id, servicio.clienteId) }),
    servicio.mascotaId
      ? db.query.mascotas.findFirst({ where: eq(mascotas.id, servicio.mascotaId) })
      : Promise.resolve(null),
  ])

  if (!cliente?.email) return

  await notificarCambioEstado({
    email: cliente.email,
    nombreCliente: cliente.nombre,
    nombreMascota: mascota?.nombre ?? 'tu mascota',
    nuevoEstado: servicio.estado,
    tokenPortal: cliente.tokenPortal ?? null,
  })
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const servicio = await db.query.servicios.findFirst({
      where: eq(servicios.id, id),
    })
    if (!servicio) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json(servicio)
  } catch (error) {
    console.error('Error obteniendo servicio:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
