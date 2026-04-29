import { NextResponse } from 'next/server'
import { db } from '@/db'
import { planes } from '@/db/schema'
import { eq, or } from 'drizzle-orm'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function mesesTranscurridos(desde: Date, hasta: Date): number {
  return (
    (hasta.getFullYear() - desde.getFullYear()) * 12 +
    (hasta.getMonth() - desde.getMonth())
  )
}

export async function GET(request: Request) {
  const secret = request.headers.get('authorization')
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const ahora = new Date()

    // Only check activo and atrasado plans — pausado/cancelado/utilizado are excluded
    const planesActivos = await db
      .select()
      .from(planes)
      .where(or(eq(planes.estado, 'activo'), eq(planes.estado, 'atrasado')))

    let marcadosAtrasados = 0
    let reactivados = 0

    for (const plan of planesActivos) {
      const meses = mesesTranscurridos(plan.creadoEn, ahora)
      const pagadas = plan.cuotasPagadas ?? 0
      const estaAtrasado = meses > pagadas

      if (estaAtrasado && plan.estado === 'activo') {
        await db
          .update(planes)
          .set({ estado: 'atrasado', actualizadoEn: ahora })
          .where(eq(planes.id, plan.id))
        marcadosAtrasados++
      }

      if (!estaAtrasado && plan.estado === 'atrasado') {
        await db
          .update(planes)
          .set({ estado: 'activo', actualizadoEn: ahora })
          .where(eq(planes.id, plan.id))
        reactivados++
      }
    }

    return NextResponse.json({
      ok: true,
      ejecutadoEn: ahora.toISOString(),
      marcadosAtrasados,
      reactivados,
    })
  } catch (error) {
    console.error('Error en cron de planes:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
