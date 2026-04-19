import { NextResponse } from 'next/server'
import { db } from '@/db'
import { leads, leadInteracciones } from '@/db/schema'
import { eq, and, lt, isNull, or } from 'drizzle-orm'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const ahora = new Date()

    // ── 1. "Interesado" sin actividad 24hs → registrar seguimiento pendiente
    // Esto hace que vuelva a aparecer en la cola del agente con una nota de seguimiento
    const hace24hs = new Date(ahora.getTime() - 24 * 60 * 60 * 1000)
    const hace48hs = new Date(ahora.getTime() - 48 * 60 * 60 * 1000)

    const interesadosSinActividad = await db
      .select()
      .from(leads)
      .where(
        and(
          eq(leads.estado, 'interesado'),
          lt(leads.ultimaInteraccionEn, hace24hs)
        )
      )

    for (const lead of interesadosSinActividad) {
      const horasDesdeUltimaInteraccion = lead.ultimaInteraccionEn
        ? (ahora.getTime() - lead.ultimaInteraccionEn.getTime()) / (1000 * 60 * 60)
        : 999

      // Entre 24hs y 48hs → seguimiento pendiente (vuelve a la cola)
      if (horasDesdeUltimaInteraccion >= 24 && horasDesdeUltimaInteraccion < 48) {
        // Verificar que no ya tiene una interacción de seguimiento reciente
        const yaNotificado = await db.query.leadInteracciones.findFirst({
          where: and(
            eq(leadInteracciones.leadId, lead.id),
            eq(leadInteracciones.tipo, 'seguimiento_24hs')
          ),
        })

        if (!yaNotificado) {
          await db.insert(leadInteracciones).values({
            leadId: lead.id,
            usuarioId: lead.asignadoAId,
            tipo: 'seguimiento_24hs',
            descripcion: '⏰ Seguimiento 24hs — Este lead no fue contactado en las últimas 24 horas. Es el momento de retomar el contacto.',
          })

          // Actualizar ultimaInteraccionEn para que vuelva a aparecer en la cola activa
          await db.update(leads)
            .set({ actualizadoEn: ahora })
            .where(eq(leads.id, lead.id))
        }
      }

      // A las 48hs → última chance, registrar interacción
      if (horasDesdeUltimaInteraccion >= 48 && horasDesdeUltimaInteraccion < 49) {
        const yaNotificado48 = await db.query.leadInteracciones.findFirst({
          where: and(
            eq(leadInteracciones.leadId, lead.id),
            eq(leadInteracciones.tipo, 'seguimiento_48hs')
          ),
        })

        if (!yaNotificado48) {
          await db.insert(leadInteracciones).values({
            leadId: lead.id,
            usuarioId: lead.asignadoAId,
            tipo: 'seguimiento_48hs',
            descripcion: '🚨 Última chance — Han pasado 48hs sin contacto. Si no se gestiona, el lead pasará a perdido.',
          })
        }
      }
    }

    // ── 2. "Interesado" sin actividad 48hs → perdido
    await db.update(leads)
      .set({ estado: 'perdido', actualizadoEn: ahora })
      .where(
        and(
          eq(leads.estado, 'interesado'),
          lt(leads.ultimaInteraccionEn, hace48hs)
        )
      )

    // ── 3. "Nuevo" sin actividad 72hs → perdido
    const hace72hs = new Date(ahora.getTime() - 72 * 60 * 60 * 1000)
    await db.update(leads)
      .set({ estado: 'perdido', actualizadoEn: ahora })
      .where(
        and(
          eq(leads.estado, 'nuevo'),
          lt(leads.creadoEn, hace72hs),
          or(
            isNull(leads.ultimaInteraccionEn),
            lt(leads.ultimaInteraccionEn, hace72hs)
          )
        )
      )

    // ── 4. "Perdido" hace más de 90 días → archivar
    const hace90dias = new Date(ahora.getTime() - 90 * 24 * 60 * 60 * 1000)
    await db.update(leads)
      .set({ actualizadoEn: ahora, notas: 'archivado' })
      .where(
        and(
          eq(leads.estado, 'perdido'),
          lt(leads.actualizadoEn, hace90dias)
        )
      )

    return NextResponse.json({
      ok: true,
      ejecutadoEn: ahora.toISOString(),
      seguimientos: interesadosSinActividad.length,
    })
  } catch (error) {
    console.error('Error en cron de leads:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}