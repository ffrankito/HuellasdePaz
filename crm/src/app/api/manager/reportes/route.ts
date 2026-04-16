import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { leads, usuarios } from '@/db/schema'
import { eq, count, and, gte, lte } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const desde = searchParams.get('desde')
    const hasta = searchParams.get('hasta')
    const agenteId = searchParams.get('agenteId')

    const filtroFecha = desde && hasta
      ? and(
          gte(leads.creadoEn, new Date(desde)),
          lte(leads.creadoEn, new Date(hasta + 'T23:59:59')),
        )
      : undefined

    const filtroAgente = agenteId ? eq(leads.asignadoAId, agenteId) : undefined

    const filtro = filtroFecha && filtroAgente
      ? and(filtroFecha, filtroAgente)
      : filtroFecha ?? filtroAgente

    const [total, convertidos, perdidos] = await Promise.all([
      db.select({ count: count() }).from(leads).where(filtro),
      db.select({ count: count() }).from(leads).where(
        filtro ? and(filtro, eq(leads.estado, 'convertido')) : eq(leads.estado, 'convertido')
      ),
      db.select({ count: count() }).from(leads).where(
        filtro ? and(filtro, eq(leads.estado, 'perdido')) : eq(leads.estado, 'perdido')
      ),
    ])

    const totalCount = total[0].count
    const conversion = totalCount > 0
      ? Math.round((convertidos[0].count / totalCount) * 100)
      : 0

    // Métricas por agente
    const agentes = await db.select().from(usuarios).where(eq(usuarios.rol, 'televenta'))

    const porAgente = await Promise.all(
      agentes.map(async (agente) => {
        const filtroAgt = filtroFecha
          ? and(filtroFecha, eq(leads.asignadoAId, agente.id))
          : eq(leads.asignadoAId, agente.id)

        const [t, c, p] = await Promise.all([
          db.select({ count: count() }).from(leads).where(filtroAgt),
          db.select({ count: count() }).from(leads).where(and(filtroAgt, eq(leads.estado, 'convertido'))),
          db.select({ count: count() }).from(leads).where(and(filtroAgt, eq(leads.estado, 'perdido'))),
        ])

        return {
          id: agente.id,
          nombre: agente.nombre,
          total: t[0].count,
          convertidos: c[0].count,
          perdidos: p[0].count,
          conversion: t[0].count > 0 ? Math.round((c[0].count / t[0].count) * 100) : 0,
        }
      })
    )

    return NextResponse.json({
      total: totalCount,
      convertidos: convertidos[0].count,
      perdidos: perdidos[0].count,
      conversion,
      porAgente: agenteId ? [] : porAgente,
    })
  } catch (error) {
    console.error('Error en reportes manager:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}