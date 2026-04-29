import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { clientes, servicios, leads, planes } from '@/db/schema'
import { and, gte, lt } from 'drizzle-orm'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const W = 595
const MARGEN = 50
const oscuro = '#111827'
const verde = '#2d8a54'
const gris = '#6b7280'
const grisClaroHex = '#f3f4f6'
const linea = '#e5e7eb'

const tipoLabel: Record<string, string> = {
  cremacion_individual: 'Cremación individual',
  cremacion_comunitaria: 'Cremación comunitaria',
  entierro: 'Entierro',
}

function fmtFecha(d: Date | string) {
  return new Date(d).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function fmtMoneda(n: number) {
  return `$${n.toLocaleString('es-AR')}`
}

export async function GET(req: NextRequest) {
  const PDFDocument = (await import('pdfkit')).default

  const { searchParams } = new URL(req.url)
  const desde = searchParams.get('desde') ? new Date(searchParams.get('desde')!) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const hasta = searchParams.get('hasta') ? new Date(searchParams.get('hasta')!) : new Date()

  const filtro = and(gte(clientes.creadoEn, desde), lt(clientes.creadoEn, hasta))
  const filtroS = and(gte(servicios.creadoEn, desde), lt(servicios.creadoEn, hasta))
  const filtroL = and(gte(leads.creadoEn, desde), lt(leads.creadoEn, hasta))

  const [clientesData, serviciosData, leadsData, planesData] = await Promise.all([
    db.select().from(clientes).where(filtro),
    db.select().from(servicios).where(filtroS),
    db.select().from(leads).where(filtroL),
    db.select().from(planes),
  ])

  // Financiero servicios
  const gananciaServicios = serviciosData.reduce((acc, s) => {
    if (!s.pagado) return acc
    return acc + (Number(s.precio ?? 0) - Number(s.descuento ?? 0))
  }, 0)
  const deudaServicios = serviciosData.reduce((acc, s) => {
    if (s.pagado || s.estado === 'cancelado') return acc
    return acc + Number(s.precio ?? 0)  // el cliente debe el precio completo
  }, 0)

  // Financiero planes
  const gananciaPlanes = planesData.reduce((acc, p) => acc + (Number(p.cuotasMensual) * (p.cuotasPagadas ?? 0)), 0)
  const deudaPlanes = planesData.reduce((acc, p) => {
    return acc + (Number(p.cuotasMensual) * (p.cuotasTotales - (p.cuotasPagadas ?? 0)))
  }, 0)
  const planesActivos = planesData.filter(p => p.estado === 'activo').length

  // Conversión
  const convertidos = leadsData.filter(l => l.estado === 'convertido').length
  const conversion = leadsData.length > 0 ? Math.round((convertidos / leadsData.length) * 100) : 0

  // Servicios por tipo
  const porTipo: Record<string, number> = {}
  serviciosData.forEach(s => { porTipo[s.tipo] = (porTipo[s.tipo] ?? 0) + 1 })

  // Leads por origen
  const porOrigen: Record<string, number> = {}
  leadsData.forEach(l => { const o = l.origen ?? 'directo'; porOrigen[o] = (porOrigen[o] ?? 0) + 1 })

  const chunks: Buffer[] = []

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: MARGEN, size: 'A4' })
    doc.on('data', (c: Buffer) => chunks.push(c))
    doc.on('end', resolve)
    doc.on('error', reject)

    let y = 0

    // ── HEADER ────────────────────────────────────────────────────────────────
    doc.rect(0, 0, W, 80).fill(oscuro)

    // Logo pata (SVG path → text aproximation)
    doc.fillColor(verde).fontSize(24).font('Helvetica-Bold').text('●', 50, 22)
    doc.fillColor('white').fontSize(20).font('Helvetica-Bold').text('Huellas de Paz', 72, 22)
    doc.fillColor('rgba(255,255,255,0.45)').fontSize(9).font('Helvetica')
      .text('Reporte de gestión · Rosario, Argentina', 72, 46)

    // Período
    const periodoText = `${fmtFecha(desde)} — ${fmtFecha(hasta)}`
    doc.fillColor('rgba(255,255,255,0.6)').fontSize(8).font('Helvetica')
      .text(periodoText, 0, 46, { align: 'right', width: W - MARGEN })

    y = 100

    // ── HELPERS ───────────────────────────────────────────────────────────────
    function checkPage(needed = 80) {
      if (y + needed > 800) { doc.addPage(); y = MARGEN }
    }

    function seccion(titulo: string) {
      checkPage(50)
      doc.moveTo(MARGEN, y).lineTo(W - MARGEN, y).strokeColor(linea).lineWidth(0.8).stroke()
      y += 12
      doc.fillColor(verde).fontSize(9).font('Helvetica-Bold')
        .text(titulo.toUpperCase(), MARGEN, y, { characterSpacing: 0.8 })
      y += 22
    }

    function miniCard(label: string, valor: string, x: number, yPos: number, cW: number, colorValor = oscuro) {
      doc.rect(x, yPos, cW - 6, 52).fill(grisClaroHex)
      doc.fillColor(gris).fontSize(7.5).font('Helvetica').text(label, x + 10, yPos + 9)
      doc.fillColor(colorValor).fontSize(18).font('Helvetica-Bold').text(valor, x + 10, yPos + 24)
    }

    function fila(cols: string[], anchos: number[], esHeader = false) {
      checkPage(28)
      const altFila = 22
      if (esHeader) doc.rect(MARGEN, y, W - MARGEN * 2, altFila).fill('#f0fdf4')
      let x = MARGEN
      cols.forEach((col, i) => {
        doc.fillColor(esHeader ? verde : oscuro)
          .fontSize(esHeader ? 7.5 : 8.5)
          .font(esHeader ? 'Helvetica-Bold' : 'Helvetica')
          .text(col, x + 5, y + 6, { width: anchos[i] - 8, ellipsis: true })
        x += anchos[i]
      })
      doc.moveTo(MARGEN, y + altFila).lineTo(W - MARGEN, y + altFila).strokeColor(grisClaroHex).lineWidth(0.5).stroke()
      y += altFila
    }

    // ── MÉTRICAS DEL PERÍODO ─────────────────────────────────────────────────
    seccion('Resumen del período')
    const cW4 = (W - MARGEN * 2) / 4
    miniCard('Clientes nuevos', String(clientesData.length), MARGEN + cW4 * 0, y, cW4)
    miniCard('Servicios', String(serviciosData.length), MARGEN + cW4 * 1, y, cW4)
    miniCard('Leads', String(leadsData.length), MARGEN + cW4 * 2, y, cW4)
    miniCard('Tasa conversión', `${conversion}%`, MARGEN + cW4 * 3, y, cW4)
    y += 68

    // ── FINANCIERO SERVICIOS ─────────────────────────────────────────────────
    seccion('Servicios — situación financiera')
    const cW2 = (W - MARGEN * 2) / 2
    miniCard('Ganancia cobrada', fmtMoneda(gananciaServicios), MARGEN, y, cW2, '#15803d')
    miniCard('Deuda pendiente', fmtMoneda(deudaServicios), MARGEN + cW2, y, cW2, '#dc2626')
    y += 68

    // ── FINANCIERO PLANES ────────────────────────────────────────────────────
    seccion('Planes — situación financiera')
    const cW3 = (W - MARGEN * 2) / 3
    miniCard('Ganancia cobrada', fmtMoneda(gananciaPlanes), MARGEN + cW3 * 0, y, cW3, '#15803d')
    miniCard('Deuda pendiente', fmtMoneda(deudaPlanes), MARGEN + cW3 * 1, y, cW3, '#dc2626')
    miniCard('Planes activos', String(planesActivos), MARGEN + cW3 * 2, y, cW3)
    y += 68

    // ── SERVICIOS POR TIPO ───────────────────────────────────────────────────
    if (Object.keys(porTipo).length > 0) {
      seccion('Servicios por tipo')
      const total = serviciosData.length
      Object.entries(porTipo).forEach(([tipo, cant]) => {
        const pct = total > 0 ? Math.round((cant / total) * 100) : 0
        const barW = W - MARGEN * 2 - 160
        checkPage(32)
        doc.fillColor(oscuro).fontSize(9).font('Helvetica').text(tipoLabel[tipo] ?? tipo, MARGEN, y + 3)
        doc.fillColor(gris).fontSize(9).text(`${cant}`, MARGEN + 160, y + 3)
        doc.rect(MARGEN + 185, y + 4, barW, 10).fill(grisClaroHex)
        doc.rect(MARGEN + 185, y + 4, Math.round(barW * pct / 100), 10).fill(oscuro)
        doc.fillColor(gris).fontSize(8).text(`${pct}%`, MARGEN + 185 + barW + 6, y + 3)
        y += 22
      })
      y += 8
    }

    // ── LEADS POR ORIGEN ─────────────────────────────────────────────────────
    if (Object.keys(porOrigen).length > 0) {
      seccion('Leads por origen')
      const totalL = leadsData.length
      Object.entries(porOrigen).forEach(([origen, cant]) => {
        const pct = totalL > 0 ? Math.round((cant / totalL) * 100) : 0
        const barW = W - MARGEN * 2 - 160
        checkPage(32)
        const label = origen.charAt(0).toUpperCase() + origen.slice(1)
        doc.fillColor(oscuro).fontSize(9).font('Helvetica').text(label, MARGEN, y + 3)
        doc.fillColor(gris).fontSize(9).text(`${cant}`, MARGEN + 160, y + 3)
        doc.rect(MARGEN + 185, y + 4, barW, 10).fill(grisClaroHex)
        doc.rect(MARGEN + 185, y + 4, Math.round(barW * pct / 100), 10).fill(verde)
        doc.fillColor(gris).fontSize(8).text(`${pct}%`, MARGEN + 185 + barW + 6, y + 3)
        y += 22
      })
      y += 8
    }

    // ── TABLA SERVICIOS ──────────────────────────────────────────────────────
    if (serviciosData.length > 0) {
      seccion(`Detalle de servicios (${serviciosData.length})`)
      const aS = [140, 130, 90, 90, 95]
      fila(['TIPO', 'ESTADO', 'PRECIO', 'PAGADO', 'FECHA'], aS, true)
      serviciosData.slice(0, 25).forEach(s => {
        fila([
          tipoLabel[s.tipo] ?? s.tipo,
          s.estado.replace(/_/g, ' '),
          s.precio ? fmtMoneda(Number(s.precio)) : '—',
          s.pagado ? 'Sí' : 'No',
          fmtFecha(s.creadoEn),
        ], aS)
      })
      if (serviciosData.length > 25) {
        y += 4
        doc.fillColor(gris).fontSize(7.5).font('Helvetica')
          .text(`+ ${serviciosData.length - 25} servicios más en el período`, MARGEN, y)
        y += 16
      }
      y += 12
    }

    // ── TABLA LEADS ──────────────────────────────────────────────────────────
    if (leadsData.length > 0) {
      seccion(`Detalle de leads (${leadsData.length})`)
      const aL = [150, 100, 90, 90, 115]
      fila(['NOMBRE', 'TELÉFONO', 'ORIGEN', 'ESTADO', 'FECHA'], aL, true)
      leadsData.slice(0, 25).forEach(l => {
        fila([
          l.nombre,
          l.telefono,
          l.origen ?? '—',
          l.estado,
          fmtFecha(l.creadoEn),
        ], aL)
      })
      if (leadsData.length > 25) {
        y += 4
        doc.fillColor(gris).fontSize(7.5).font('Helvetica')
          .text(`+ ${leadsData.length - 25} leads más en el período`, MARGEN, y)
      }
    }

    // ── FOOTER ────────────────────────────────────────────────────────────────
    const pageHeight = 842
    doc.moveTo(MARGEN, pageHeight - 40).lineTo(W - MARGEN, pageHeight - 40).strokeColor(linea).lineWidth(0.8).stroke()
    doc.fillColor(gris).fontSize(7.5).font('Helvetica')
      .text('Huellas de Paz · Rosario, Argentina', MARGEN, pageHeight - 28)
      .text(`Generado el ${fmtFecha(new Date())}`, 0, pageHeight - 28, { align: 'right', width: W - MARGEN })

    doc.end()
  })

  const pdfBuffer = Buffer.concat(chunks)
  const nombre = `reporte-${desde.toISOString().split('T')[0]}_${hasta.toISOString().split('T')[0]}.pdf`

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${nombre}"`,
      'Content-Length': String(pdfBuffer.length),
    },
  })
}
