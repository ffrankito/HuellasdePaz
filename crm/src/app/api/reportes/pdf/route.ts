import { NextResponse } from 'next/server'
import { db } from '@/db'
import { clientes, servicios, leads, planes } from '@/db/schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const PDFDocument = (await import('pdfkit')).default

  const [clientesData, serviciosData, leadsData, planesData] = await Promise.all([
    db.select().from(clientes),
    db.select().from(servicios),
    db.select().from(leads),
    db.select().from(planes),
  ])

  const chunks: Buffer[] = []

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' })

    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', resolve)
    doc.on('error', reject)

    const W = 595
    const gris = '#6b7280'
    const oscuro = '#111827'
    const linea = '#f3f4f6'
    const fecha = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })

    // Header
    doc.rect(0, 0, W, 90).fill(oscuro)
    doc.fillColor('white').fontSize(22).font('Helvetica-Bold').text('Huellas de Paz', 50, 28)
    doc.fillColor('#9ca3af').fontSize(10).font('Helvetica').text('Reporte de gestión', 50, 54)
    doc.fillColor('#9ca3af').fontSize(10).text(fecha, 0, 54, { align: 'right', width: W - 50 })
    doc.fillColor(oscuro)

    let y = 110

    function seccion(titulo: string) {
      if (y > 720) { doc.addPage(); y = 50 }
      doc.moveTo(50, y).lineTo(W - 50, y).strokeColor('#e5e7eb').lineWidth(1).stroke()
      y += 14
      doc.fillColor(oscuro).fontSize(13).font('Helvetica-Bold').text(titulo, 50, y)
      y += 26
    }

    function fila(cols: string[], anchos: number[], esHeader = false) {
      if (y > 750) { doc.addPage(); y = 50 }
      const altFila = 24
      if (esHeader) doc.rect(50, y, W - 100, altFila).fill('#f9fafb')
      let x = 50
      cols.forEach((col, i) => {
        doc.fillColor(esHeader ? '#6b7280' : oscuro)
          .fontSize(esHeader ? 8 : 9)
          .font(esHeader ? 'Helvetica-Bold' : 'Helvetica')
          .text(col, x + 6, y + 7, { width: anchos[i] - 10, ellipsis: true })
        x += anchos[i]
      })
      doc.moveTo(50, y + altFila).lineTo(W - 50, y + altFila).strokeColor(linea).lineWidth(0.5).stroke()
      y += altFila
    }

    // Métricas resumen
    seccion('Resumen general')

    const gananciaTotalPlanes = planesData.reduce((acc, p) => {
      return acc + (Number(p.cuotasMensual) * (p.cuotasPagadas ?? 0))
    }, 0)

    const deudaTotalPlanes = planesData.reduce((acc, p) => {
      const restantes = p.cuotasTotales - (p.cuotasPagadas ?? 0)
      return acc + (Number(p.cuotasMensual) * restantes)
    }, 0)

    const metricas = [
      { label: 'Clientes', valor: String(clientesData.length) },
      { label: 'Servicios', valor: String(serviciosData.length) },
      { label: 'Leads', valor: String(leadsData.length) },
      { label: 'Planes activos', valor: String(planesData.filter(p => p.estado === 'activo').length) },
    ]

    const mW = (W - 100) / 4
    metricas.forEach((m, i) => {
      const mx = 50 + i * mW
      doc.rect(mx, y, mW - 8, 56).fill('#f9fafb')
      doc.fillColor(gris).fontSize(8).font('Helvetica').text(m.label, mx + 12, y + 10)
      doc.fillColor(oscuro).fontSize(22).font('Helvetica-Bold').text(m.valor, mx + 12, y + 24)
    })
    y += 72

    // Planes financiero
    seccion('Planes — estado financiero')

    const mW2 = (W - 100) / 3
    const financiero = [
      { label: 'Ganancia cobrada', valor: `$${gananciaTotalPlanes.toLocaleString('es-AR')}` },
      { label: 'Deuda pendiente', valor: `$${deudaTotalPlanes.toLocaleString('es-AR')}` },
      { label: 'Planes activos', valor: String(planesData.filter(p => p.estado === 'activo').length) },
    ]
    financiero.forEach((m, i) => {
      const mx = 50 + i * mW2
      doc.rect(mx, y, mW2 - 8, 56).fill('#f9fafb')
      doc.fillColor(gris).fontSize(8).font('Helvetica').text(m.label, mx + 12, y + 10)
      doc.fillColor(oscuro).fontSize(16).font('Helvetica-Bold').text(m.valor, mx + 12, y + 26)
    })
    y += 72

    // Clientes
    seccion('Clientes')
    const anchosCli = [140, 110, 110, 90, 95]
    fila(['NOMBRE', 'TELÉFONO', 'EMAIL', 'LOCALIDAD', 'ORIGEN'], anchosCli, true)
    clientesData.slice(0, 20).forEach(c => {
      fila([`${c.nombre} ${c.apellido}`, c.telefono, c.email ?? '—', c.localidad ?? '—', c.origen ?? '—'], anchosCli)
    })
    if (clientesData.length > 20) {
      y += 4
      doc.fillColor(gris).fontSize(8).font('Helvetica').text(`+ ${clientesData.length - 20} clientes más`, 50, y)
      y += 16
    }
    y += 16

    // Servicios
    seccion('Servicios')
    const anchosServ = [160, 160, 110, 115]
    fila(['TIPO', 'ESTADO', 'FECHA RETIRO', 'FECHA ENTREGA'], anchosServ, true)
    serviciosData.slice(0, 20).forEach(s => {
      fila([
        s.tipo.replace(/_/g, ' '),
        s.estado.replace(/_/g, ' '),
        s.fechaRetiro ? new Date(s.fechaRetiro).toLocaleDateString('es-AR') : '—',
        s.fechaEntrega ? new Date(s.fechaEntrega).toLocaleDateString('es-AR') : '—',
      ], anchosServ)
    })
    y += 16

    // Leads
    seccion('Leads')
    const anchosLead = [140, 110, 100, 100, 95]
    fila(['NOMBRE', 'TELÉFONO', 'ORIGEN', 'ESTADO', 'FECHA'], anchosLead, true)
    leadsData.slice(0, 20).forEach(l => {
      fila([
        l.nombre,
        l.telefono,
        l.origen ?? '—',
        l.estado,
        new Date(l.creadoEn).toLocaleDateString('es-AR'),
      ], anchosLead)
    })

    // Footer
    const pageHeight = 842
    doc.moveTo(50, pageHeight - 50).lineTo(W - 50, pageHeight - 50).strokeColor('#e5e7eb').lineWidth(1).stroke()
    doc.fillColor(gris).fontSize(8).font('Helvetica')
      .text('Huellas de Paz · Rosario, Argentina', 50, pageHeight - 36)
      .text(`Generado el ${fecha}`, 0, pageHeight - 36, { align: 'right', width: W - 50 })

    doc.end()
  })

  const pdfBuffer = Buffer.concat(chunks)

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="reporte-huellas-de-paz-${new Date().toISOString().split('T')[0]}.pdf"`,
      'Content-Length': String(pdfBuffer.length),
    },
  })
}