import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { leads, usuarios, leadInteracciones } from '@/db/schema'
import { eq, gte, lt, and, asc, inArray, sql } from 'drizzle-orm'
import { requireAuth } from '@/lib/api-auth'
import * as XLSX from 'xlsx'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ORIGEN_LABEL: Record<string, string> = {
  cotizador:   'Cotizador',
  landing:     'Landing',
  whatsapp:    'WhatsApp',
  instagram:   'Instagram',
  directo:     'Directo',
  veterinaria: 'Convenio',
}

const ESTADO_LABEL: Record<string, string> = {
  nuevo:      'Nuevo',
  contactado: 'Contactado',
  interesado: 'Interesado',
  cotizado:   'Cotizado',
  convertido: 'Convertido',
  perdido:    'Perdido',
}

const TIPO_LABEL: Record<string, string> = {
  nota:             'Nota',
  estado_cambio:    'Cambio de estado',
  asignacion:       'Asignación',
  seguimiento:      'Seguimiento programado',
  traspaso:         'Traspaso',
  email:            'Email enviado',
  seguimiento_24hs: 'Alerta 24hs sin contacto',
  seguimiento_48hs: 'Alerta 48hs sin contacto',
}

function fmtFecha(d: Date | string | null): string {
  if (!d) return ''
  return new Date(d).toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function rangoDelDia(fechaParam: string | null): { inicio: Date; fin: Date; label: string } {
  // Argentina = UTC-3 fijo (sin horario de verano)
  // Medianoche en Argentina = 03:00 UTC
  let hoyART: string

  if (fechaParam && /^\d{4}-\d{2}-\d{2}$/.test(fechaParam)) {
    hoyART = fechaParam
  } else {
    const ahoraUTC = new Date()
    // Restar 3 horas para obtener la hora argentina
    const ahoraART = new Date(ahoraUTC.getTime() - 3 * 60 * 60 * 1000)
    hoyART = ahoraART.toISOString().slice(0, 10)
  }

  const inicio = new Date(`${hoyART}T03:00:00.000Z`)
  const fin    = new Date(inicio.getTime() + 24 * 60 * 60 * 1000)

  const [anio, mes, dia] = hoyART.split('-')
  const label = `${dia}-${mes}-${anio}`

  return { inicio, fin, label }
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(['admin', 'manager'])
  if (!auth.ok) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const { inicio, fin, label } = rangoDelDia(searchParams.get('fecha'))

    // ── 1. Leads del día con nombre del agente ───────────────────────────────
    const leadsDelDia = await db
      .select({
        id:                leads.id,
        nombre:            leads.nombre,
        telefono:          leads.telefono,
        email:             leads.email,
        dni:               leads.dni,
        origen:            leads.origen,
        estado:            leads.estado,
        agenteNombre:      usuarios.nombre,
        seguimientoEn:     leads.seguimientoEn,
        primerRespuestaEn: leads.primerRespuestaEn,
        creadoEn:          leads.creadoEn,
        ultimaNotaDesc: sql<string | null>`(
          SELECT li.descripcion
          FROM lead_interacciones li
          WHERE li.lead_id = leads.id
            AND li.tipo NOT IN ('asignacion', 'seguimiento_24hs', 'seguimiento_48hs')
          ORDER BY li.creado_en DESC
          LIMIT 1
        )`,
      })
      .from(leads)
      .leftJoin(usuarios, eq(leads.asignadoAId, usuarios.id))
      .where(and(gte(leads.creadoEn, inicio), lt(leads.creadoEn, fin)))
      .orderBy(asc(leads.creadoEn))

    if (leadsDelDia.length === 0) {
      return NextResponse.json(
        { error: 'No hay leads para la fecha indicada' },
        { status: 404 }
      )
    }

    // ── 2. Interacciones de todos los leads en una sola query ────────────────
    const leadIds = leadsDelDia.map(l => l.id)

    const todasLasInteracciones = await db
      .select({
        leadId:       leadInteracciones.leadId,
        tipo:         leadInteracciones.tipo,
        descripcion:  leadInteracciones.descripcion,
        creadoEn:     leadInteracciones.creadoEn,
        usuarioNombre: usuarios.nombre,
      })
      .from(leadInteracciones)
      .leftJoin(usuarios, eq(leadInteracciones.usuarioId, usuarios.id))
      .where(inArray(leadInteracciones.leadId, leadIds))
      .orderBy(asc(leadInteracciones.creadoEn))

    const interaccionesPorLead: Record<string, typeof todasLasInteracciones> = {}
    for (const i of todasLasInteracciones) {
      if (!interaccionesPorLead[i.leadId]) interaccionesPorLead[i.leadId] = []
      interaccionesPorLead[i.leadId].push(i)
    }

    // ── 3. Sheet "Leads" ─────────────────────────────────────────────────────
    const cabLeads = [
      'Nombre', 'Teléfono', 'Email', 'DNI', 'Origen', 'Estado',
      'Agente asignado', 'Ingresó a las', 'Primer contacto', 'Seguimiento programado',
      'Última nota', 'Cant. interacciones',
    ]

    const filasLeads = leadsDelDia.map(l => [
      l.nombre,
      l.telefono,
      l.email             ?? '',
      l.dni               ?? '',
      ORIGEN_LABEL[l.origen ?? ''] ?? (l.origen ?? ''),
      ESTADO_LABEL[l.estado]       ?? l.estado,
      l.agenteNombre      ?? 'Sin asignar',
      fmtFecha(l.creadoEn),
      fmtFecha(l.primerRespuestaEn),
      fmtFecha(l.seguimientoEn),
      l.ultimaNotaDesc    ?? '',
      (interaccionesPorLead[l.id] ?? []).length,
    ])

    const wsLeads = XLSX.utils.aoa_to_sheet([cabLeads, ...filasLeads])
    wsLeads['!cols'] = [
      { wch: 24 }, { wch: 16 }, { wch: 28 }, { wch: 12 },
      { wch: 14 }, { wch: 14 }, { wch: 22 }, { wch: 18 },
      { wch: 18 }, { wch: 18 }, { wch: 44 }, { wch: 10 },
    ]

    // Estilo negrita en la fila de cabecera
    const rangoLeads = XLSX.utils.decode_range(wsLeads['!ref'] ?? 'A1')
    for (let c = rangoLeads.s.c; c <= rangoLeads.e.c; c++) {
      const celda = XLSX.utils.encode_cell({ r: 0, c })
      if (!wsLeads[celda]) continue
      wsLeads[celda].s = { font: { bold: true } }
    }

    // ── 4. Sheet "Actividad" ─────────────────────────────────────────────────
    const cabActividad = [
      'Lead', 'Teléfono', 'Estado actual', 'Tipo de interacción',
      'Descripción', 'Fecha y hora', 'Usuario',
    ]

    const filasActividad: (string | number)[][] = []
    for (const lead of leadsDelDia) {
      const ints = interaccionesPorLead[lead.id] ?? []
      if (ints.length === 0) {
        filasActividad.push([
          lead.nombre, lead.telefono,
          ESTADO_LABEL[lead.estado] ?? lead.estado,
          '', 'Sin actividad registrada', '', '',
        ])
      } else {
        for (const int of ints) {
          filasActividad.push([
            lead.nombre,
            lead.telefono,
            ESTADO_LABEL[lead.estado] ?? lead.estado,
            TIPO_LABEL[int.tipo]      ?? int.tipo,
            int.descripcion,
            fmtFecha(int.creadoEn),
            int.usuarioNombre ?? '',
          ])
        }
      }
    }

    const wsActividad = XLSX.utils.aoa_to_sheet([cabActividad, ...filasActividad])
    wsActividad['!cols'] = [
      { wch: 24 }, { wch: 16 }, { wch: 14 },
      { wch: 22 }, { wch: 54 }, { wch: 18 }, { wch: 22 },
    ]

    const rangoAct = XLSX.utils.decode_range(wsActividad['!ref'] ?? 'A1')
    for (let c = rangoAct.s.c; c <= rangoAct.e.c; c++) {
      const celda = XLSX.utils.encode_cell({ r: 0, c })
      if (!wsActividad[celda]) continue
      wsActividad[celda].s = { font: { bold: true } }
    }

    // ── 5. Armar workbook y devolver ─────────────────────────────────────────
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, wsLeads,    'Leads')
    XLSX.utils.book_append_sheet(wb, wsActividad, 'Actividad')

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="leads-${label}.xlsx"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Error exportando leads:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
