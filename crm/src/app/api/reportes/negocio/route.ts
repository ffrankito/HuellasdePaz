import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { clientes, servicios, leads, planes } from '@/db/schema'
import { count, and, gte, lt, sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const desde = searchParams.get('desde')
    ? new Date(searchParams.get('desde')!)
    : new Date(new Date().getFullYear(), new Date().getMonth(), 1)

  const hasta = searchParams.get('hasta')
    ? new Date(searchParams.get('hasta')!)
    : new Date()

  const duracion   = hasta.getTime() - desde.getTime()
  const desdeAnt   = new Date(desde.getTime() - duracion)
  const hastaAnt   = new Date(desde.getTime())

  const enPeriodo    = and(gte(servicios.creadoEn, desde),    lt(servicios.creadoEn, hasta))
  const enPeriodoAnt = and(gte(servicios.creadoEn, desdeAnt), lt(servicios.creadoEn, hastaAnt))

  const [
    [cliActual],   // clientes período actual
    [svcActual],   // servicios período actual (con agregaciones financieras)
    [ldActual],    // leads período actual
    [cliAnt],      // clientes período anterior
    [svcAnt],      // servicios período anterior
    [ldAnt],       // leads período anterior
    [statsPlanes], // planes: todo en SQL
    serviciosPorTipo,
    leadsPorOrigen,
    leadsPorEstado,
  ] = await Promise.all([

    db.select({ total: count() })
      .from(clientes)
      .where(and(gte(clientes.creadoEn, desde), lt(clientes.creadoEn, hasta))),

    db.select({
      total:           count(),
      entregados:      sql<number>`count(*) filter (where ${servicios.estado} = 'entregado')`,
      // gananciaCobrada = precio - comision (ingreso neto real de Huellas)
      gananciaCobrada: sql<number>`coalesce(sum((coalesce(${servicios.precio},0)::numeric - coalesce(${servicios.descuento},0)::numeric)) filter (where ${servicios.pagado} = true), 0)`,
      // deudaPendiente = precio completo que el cliente debe (antes de deducir comisión del convenio)
      deudaPendiente:  sql<number>`coalesce(sum(coalesce(${servicios.precio},0)::numeric) filter (where ${servicios.pagado} = false and ${servicios.estado} != 'cancelado'), 0)`,
    }).from(servicios).where(enPeriodo),

    db.select({
      total:      count(),
      convertidos: sql<number>`count(*) filter (where ${leads.estado} = 'convertido')`,
    }).from(leads).where(and(gte(leads.creadoEn, desde), lt(leads.creadoEn, hasta))),

    db.select({ total: count() })
      .from(clientes)
      .where(and(gte(clientes.creadoEn, desdeAnt), lt(clientes.creadoEn, hastaAnt))),

    db.select({ total: count() })
      .from(servicios).where(enPeriodoAnt),

    db.select({
      total:       count(),
      convertidos: sql<number>`count(*) filter (where ${leads.estado} = 'convertido')`,
    }).from(leads).where(and(gte(leads.creadoEn, desdeAnt), lt(leads.creadoEn, hastaAnt))),

    // Planes: COUNT + SUM en SQL — sin traer ninguna fila
    db.select({
      activos:         sql<number>`count(*) filter (where ${planes.estado} = 'activo')`,
      gananciaCobrada: sql<number>`coalesce(sum(coalesce(${planes.cuotasMensual},0)::numeric * coalesce(${planes.cuotasPagadas},0)), 0)`,
      deudaPendiente:  sql<number>`coalesce(sum(coalesce(${planes.cuotasMensual},0)::numeric * (${planes.cuotasTotales} - coalesce(${planes.cuotasPagadas},0))), 0)`,
    }).from(planes),

    db.select({ tipo: servicios.tipo, count: count() })
      .from(servicios).where(enPeriodo).groupBy(servicios.tipo),

    db.select({ origen: leads.origen, count: count() })
      .from(leads).where(and(gte(leads.creadoEn, desde), lt(leads.creadoEn, hasta))).groupBy(leads.origen),

    db.select({ estado: leads.estado, count: count() })
      .from(leads).where(and(gte(leads.creadoEn, desde), lt(leads.creadoEn, hasta))).groupBy(leads.estado),
  ])

  function delta(actual: number, anterior: number) {
    if (anterior === 0) return actual > 0 ? 100 : 0
    return Math.round(((actual - anterior) / anterior) * 100)
  }

  const convActual  = ldActual.total  > 0 ? Math.round((Number(ldActual.convertidos)  / ldActual.total)  * 100) : 0
  const convAnterior = ldAnt.total    > 0 ? Math.round((Number(ldAnt.convertidos)      / ldAnt.total)     * 100) : 0

  return NextResponse.json({
    periodo: { desde: desde.toISOString(), hasta: hasta.toISOString() },
    metricas: {
      clientes:           { valor: cliActual.total,            delta: delta(cliActual.total,            cliAnt.total) },
      servicios:          { valor: svcActual.total,            delta: delta(svcActual.total,            svcAnt.total) },
      serviciosEntregados:{ valor: Number(svcActual.entregados), delta: 0 },
      leads:              { valor: ldActual.total,             delta: delta(ldActual.total,             ldAnt.total) },
      leadsConvertidos:   { valor: Number(ldActual.convertidos), delta: delta(Number(ldActual.convertidos), Number(ldAnt.convertidos)) },
      conversion:         { valor: convActual,                 delta: delta(convActual, convAnterior) },
    },
    planes: {
      activos:         Number(statsPlanes.activos),
      gananciaCobrada: Number(statsPlanes.gananciaCobrada),
      deudaPendiente:  Number(statsPlanes.deudaPendiente),
    },
    serviciosFinancieros: {
      gananciaCobrada: Number(svcActual.gananciaCobrada),
      deudaPendiente:  Number(svcActual.deudaPendiente),
    },
    serviciosPorTipo,
    leadsPorOrigen,
    leadsPorEstado,
  })
}
