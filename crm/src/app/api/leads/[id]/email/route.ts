import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { leads, leadInteracciones, usuarios } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'
import { enviarEmailLead } from '@/lib/email/enviarEmailLead'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { asunto, cuerpo } = body

    if (!asunto || !cuerpo) {
      return NextResponse.json({ error: 'Asunto y cuerpo son requeridos' }, { status: 400 })
    }

    const lead = await db.query.leads.findFirst({ where: eq(leads.id, id) })
    if (!lead) return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })
    if (!lead.email) return NextResponse.json({ error: 'El lead no tiene email' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const agente = user
      ? await db.query.usuarios.findFirst({ where: eq(usuarios.id, user.id) })
      : null

    await enviarEmailLead({
      para: lead.email,
      asunto,
      cuerpo,
      nombreAgente: agente?.nombre ?? 'Huellas de Paz',
    })

    await db.insert(leadInteracciones).values({
      leadId: id,
      usuarioId: agente?.id ?? null,
      tipo: 'email',
      descripcion: `📧 Email enviado — Asunto: "${asunto}"`,
    })

    await db.update(leads)
      .set({ ultimaInteraccionEn: new Date(), actualizadoEn: new Date() })
      .where(eq(leads.id, id))

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error enviando email:', error)
    return NextResponse.json({ error: 'Error al enviar el email' }, { status: 500 })
  }
}