import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { clientes, mascotas, servicios } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit')

const tipoLabel: Record<string, string> = {
  cremacion_individual: 'Cremación Individual',
  cremacion_comunitaria: 'Cremación Comunitaria',
  entierro: 'Entierro en Jardín del Recuerdo',
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ servicioId: string }> }
) {
  try {
    const { servicioId } = await params
    const token = request.nextUrl.searchParams.get('token')

    if (!token) return NextResponse.json({ error: 'Token requerido' }, { status: 400 })

    const cliente = await db.query.clientes.findFirst({
      where: eq(clientes.tokenPortal, token),
    })
    if (!cliente) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

    const servicio = await db.query.servicios.findFirst({
      where: and(eq(servicios.id, servicioId), eq(servicios.clienteId, cliente.id)),
    })
    if (!servicio) return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })

    const mascota = servicio.mascotaId
      ? await db.query.mascotas.findFirst({ where: eq(mascotas.id, servicio.mascotaId) })
      : null

    const pdfBuffer = await generarCertificado({ cliente, servicio, mascota: mascota ?? null })

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificado-${mascota?.nombre ?? 'servicio'}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generando certificado:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

function generarCertificado({
  cliente,
  servicio,
  mascota,
}: {
  cliente: { nombre: string; apellido: string }
  servicio: { tipo: string; fechaCremacion: Date | null; fechaEntrega: Date | null; creadoEn: Date; numero: number }
  mascota: { nombre: string; especie: string; raza: string | null; fechaFallecimiento: string | null } | null
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 60 })
    const chunks: Buffer[] = []

    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const verde = '#2d8a54'
    const negro = '#111827'
    const gris = '#6b7280'
    const grisClaroHex = '#f3f4f6'

    // ── Encabezado ──────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 120).fill(negro)

    doc.fontSize(22).font('Helvetica-Bold').fillColor('white')
      .text('Huellas de Paz', 60, 38)

    doc.fontSize(10).font('Helvetica').fillColor('rgba(255,255,255,0.5)')
      .text('Crematorio y cementerio parque de mascotas · Rosario, Argentina', 60, 66)

    // ── Título del certificado ──────────────────────────────────────────────
    doc.rect(0, 120, doc.page.width, 80).fill(verde)

    doc.fontSize(18).font('Helvetica-Bold').fillColor('white')
      .text('CERTIFICADO DE CREMACIÓN', 0, 142, { align: 'center' })

    // ── Cuerpo ──────────────────────────────────────────────────────────────
    const y0 = 240

    // N° de servicio
    doc.fontSize(10).font('Helvetica').fillColor(gris)
      .text(`N° de servicio: ${String(servicio.numero).padStart(5, '0')}`, 60, y0)

    doc.moveTo(60, y0 + 20).lineTo(doc.page.width - 60, y0 + 20).stroke(grisClaroHex)

    // Datos de la mascota
    if (mascota) {
      seccion(doc, 'Datos de la mascota', y0 + 36, verde)
      fila(doc, 'Nombre', mascota.nombre, y0 + 62, negro, gris)
      fila(doc, 'Especie', capitalizar(mascota.especie), y0 + 84, negro, gris)
      if (mascota.raza) fila(doc, 'Raza', mascota.raza, y0 + 106, negro, gris)
      if (mascota.fechaFallecimiento) {
        fila(doc, 'Fecha de fallecimiento', formatDate(mascota.fechaFallecimiento), y0 + 128, negro, gris)
      }
    }

    const y1 = mascota ? y0 + 168 : y0 + 36

    // Datos del servicio
    seccion(doc, 'Servicio realizado', y1, verde)
    fila(doc, 'Tipo', tipoLabel[servicio.tipo] ?? servicio.tipo, y1 + 26, negro, gris)
    if (servicio.fechaCremacion) {
      fila(doc, 'Fecha de cremación', formatDate(servicio.fechaCremacion.toISOString().split('T')[0]), y1 + 48, negro, gris)
    }
    if (servicio.fechaEntrega) {
      fila(doc, 'Fecha de entrega', formatDate(servicio.fechaEntrega.toISOString().split('T')[0]), y1 + 70, negro, gris)
    }

    const y2 = y1 + 110

    // Datos del titular
    seccion(doc, 'Titular', y2, verde)
    fila(doc, 'Nombre', `${cliente.nombre} ${cliente.apellido}`, y2 + 26, negro, gris)

    // ── Texto de certificación ───────────────────────────────────────────────
    const y3 = y2 + 90
    doc.rect(60, y3, doc.page.width - 120, 80).fillAndStroke('#f9fafb', grisClaroHex)
    doc.fontSize(10).font('Helvetica').fillColor(gris)
      .text(
        `Huellas de Paz certifica que el servicio de ${tipoLabel[servicio.tipo] ?? servicio.tipo.replace(/_/g, ' ')} fue realizado conforme a los más altos estándares de dignidad y respeto, en cumplimiento de la normativa vigente en la provincia de Santa Fe, Argentina.`,
        76,
        y3 + 16,
        { width: doc.page.width - 152, align: 'justify' }
      )

    // ── Pie de página ────────────────────────────────────────────────────────
    const yFoot = doc.page.height - 80
    doc.moveTo(60, yFoot).lineTo(doc.page.width - 60, yFoot).stroke(grisClaroHex)
    doc.fontSize(9).font('Helvetica').fillColor(gris)
      .text('www.huellasdepaz.com.ar', 60, yFoot + 12)
    doc.text(
      `Emitido el ${new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      0,
      yFoot + 12,
      { align: 'right', width: doc.page.width - 60 }
    )

    doc.end()
  })
}

function seccion(doc: typeof PDFDocument, titulo: string, y: number, color: string) {
  doc.fontSize(11).font('Helvetica-Bold').fillColor(color).text(titulo, 60, y)
}

function fila(doc: typeof PDFDocument, label: string, value: string, y: number, colorVal: string, colorLabel: string) {
  doc.fontSize(10).font('Helvetica').fillColor(colorLabel).text(label + ':', 60, y)
  doc.fontSize(10).font('Helvetica-Bold').fillColor(colorVal).text(value, 200, y)
}

function capitalizar(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
}
