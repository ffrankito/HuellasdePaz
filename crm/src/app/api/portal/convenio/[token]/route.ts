import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { convenios, leads } from '@/db/schema'
import { eq, count, sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params

  const convenio = await db.query.convenios.findFirst({
    where: eq(convenios.tokenPortal, token),
  })
  if (!convenio) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  if (!convenio.portalActivo) return NextResponse.json({ error: 'Portal inactivo' }, { status: 403 })

  const [stats] = await db.select({
    total:      count(),
    convertidos: sql<number>`count(*) filter (where ${leads.estado} = 'convertido')`,
    perdidos:    sql<number>`count(*) filter (where ${leads.estado} = 'perdido')`,
  }).from(leads).where(eq(leads.veterinariaId, convenio.id))

  const leadsRecientes = await db.select({
    id: leads.id,
    nombre: leads.nombre,
    telefono: leads.telefono,
    estado: leads.estado,
    creadoEn: leads.creadoEn,
    mensaje: leads.mensaje,
  }).from(leads).where(eq(leads.veterinariaId, convenio.id))
    .orderBy(leads.creadoEn)
    .limit(50)

  return NextResponse.json({
    convenio: {
      id: convenio.id,
      nombre: convenio.nombre,
      tipo: convenio.tipo,
      descuentoPorcentaje: convenio.descuentoPorcentaje,
    },
    stats: {
      total: stats.total,
      convertidos: Number(stats.convertidos),
      perdidos: Number(stats.perdidos),
      enProceso: stats.total - Number(stats.convertidos) - Number(stats.perdidos),
    },
    leads: leadsRecientes,
  })
}
