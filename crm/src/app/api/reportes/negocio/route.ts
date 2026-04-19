import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { clientes, servicios, leads, planes } from '@/db/schema'
import { count, eq, and, gte, lt, sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const desde = searchParams.get('desde')
    ? new Date(searchParams.get('desde')!)
    : new Date(new Date().getFullYear(), new Date().getMonth(), 1)

  const hasta = searchParams.get('hasta')
    ? new Date(searchParams.get('hasta')!)
    : new Date()

  // Período anterior (misma duración)
  const duracion = hasta.getTime() - desde.getTime()
  const desdeAnterior = new Date(desde.getTime() - duracion)
  const hastaAnterior = new Date(desde.getTime())

  const [
    // Período actual
    clientesActual,
    serviciosActual,
    serviciosEntregadosActual,
    leadsActual,
    leadsConvertidosActual,
    serviciosPorTipo,
    leadsPorOrigen,
    leadsPorEstado,
    // Período anterior (para comparación)
    clientesAnterior,
    serviciosAnterior,
    leadsAnterior,
    leadsConvertidosAnterior,
    // Planes (sin filtro de fecha — estado actual)
    planesData,
  ] = await Promise.all([
    db.select({ count: count() }).from(clientes).where(and(gte(clientes.creadoEn, desde), lt(clientes.creadoEn, hasta))),
    db.select({ count: count() }).from(servicios).where(and(gte(servicios.creadoEn, desde), lt(servicios.creadoEn, hasta))),
    db.select({ count: count() }).from(servicios).where(and(gte(servicios.creadoEn, desde), lt(servicios.creadoEn, hasta), eq(servicios.estado, 'entregado'))),
    db.select({ count: count() }).from(leads).where(and(gte(leads.creadoEn, desde), lt(leads.creadoEn, hasta))),
    db.select({ count: count() }).from(leads).where(and(gte(leads.creadoEn, desde), lt(leads.creadoEn, hasta), eq(leads.estado, 'convertido'))),
    db.select({ tipo: servicios.tipo, count: count() }).from(servicios).where(and(gte(servicios.creadoEn, desde), lt(servicios.creadoEn, hasta))).groupBy(servicios.tipo),
    db.select({ origen: leads.origen, count: count() }).from(leads).where(and(gte(leads.creadoEn, desde), lt(leads.creadoEn, hasta))).groupBy(leads.origen),
    db.select({ estado: leads.estado, count: count() }).from(leads).where(and(gte(leads.creadoEn, desde), lt(leads.creadoEn, hasta))).groupBy(leads.estado),
    db.select({ count: count() }).from(clientes).where(and(gte(clientes.creadoEn, desdeAnterior), lt(clientes.creadoEn, hastaAnterior))),
    db.select({ count: count() }).from(servicios).where(and(gte(servicios.creadoEn, desdeAnterior), lt(servicios.creadoEn, hastaAnterior))),
    db.select({ count: count() }).from(leads).where(and(gte(leads.creadoEn, desdeAnterior), lt(leads.creadoEn, hastaAnterior))),
    db.select({ count: count() }).from(leads).where(and(gte(leads.creadoEn, desdeAnterior), lt(leads.creadoEn, hastaAnterior), eq(leads.estado, 'convertido'))),
    db.select().from(planes),
  ])

  const planesActivos = planesData.filter(p => p.estado === 'activo')
  const gananciaCobrada = planesData.reduce((acc, p) => acc + (Number(p.cuotasMensual) * (p.cuotasPagadas ?? 0)), 0)
  const deudaPendiente = planesData.reduce((acc, p) => {
    const restantes = p.cuotasTotales - (p.cuotasPagadas ?? 0)
    return acc + (Number(p.cuotasMensual) * restantes)
  }, 0)

  const conversionActual = leadsActual[0].count > 0
    ? Math.round((leadsConvertidosActual[0].count / leadsActual[0].count) * 100) : 0
  const conversionAnterior = leadsAnterior[0].count > 0
    ? Math.round((leadsConvertidosAnterior[0].count / leadsAnterior[0].count) * 100) : 0

  function delta(actual: number, anterior: number) {
    if (anterior === 0) return actual > 0 ? 100 : 0
    return Math.round(((actual - anterior) / anterior) * 100)
  }

  return NextResponse.json({
    periodo: { desde: desde.toISOString(), hasta: hasta.toISOString() },
    metricas: {
      clientes: { valor: clientesActual[0].count, delta: delta(clientesActual[0].count, clientesAnterior[0].count) },
      servicios: { valor: serviciosActual[0].count, delta: delta(serviciosActual[0].count, serviciosAnterior[0].count) },
      serviciosEntregados: { valor: serviciosEntregadosActual[0].count, delta: 0 },
      leads: { valor: leadsActual[0].count, delta: delta(leadsActual[0].count, leadsAnterior[0].count) },
      leadsConvertidos: { valor: leadsConvertidosActual[0].count, delta: delta(leadsConvertidosActual[0].count, leadsConvertidosAnterior[0].count) },
      conversion: { valor: conversionActual, delta: delta(conversionActual, conversionAnterior) },
    },
    planes: {
      activos: planesActivos.length,
      gananciaCobrada,
      deudaPendiente,
    },
    serviciosPorTipo,
    leadsPorOrigen,
    leadsPorEstado,
  })
}