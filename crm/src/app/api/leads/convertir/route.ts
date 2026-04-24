import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { clientes, servicios, planes, leads, leadInteracciones } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { leadId, nombre, apellido, telefono, email, localidad, tipo, tipoServicio, tipoPlan, notas, convenioId } = body

    // 1. Crear cliente
    const [cliente] = await db.insert(clientes).values({
      nombre: nombre ?? '',
      apellido: apellido ?? '',
      telefono: telefono ?? '',
      email: email ?? null,
      localidad: localidad ?? null,
      origen: 'cotizador',
      veterinariaId: convenioId || null,
    }).returning()

    // 2. Crear servicio o plan
    if (tipo === 'servicio' && tipoServicio) {
      await db.insert(servicios).values({
        numero: sql`nextval('servicios_numero_seq')`,
        clienteId: cliente.id,
        tipo: tipoServicio,
        estado: 'ingresado',
        notas: notas ?? null,
      })
    }

    if (tipo === 'plan' && tipoPlan) {
      await db.insert(planes).values({
        numero: sql`nextval('planes_numero_seq')`,
        clienteId: cliente.id,
        planConfigId: tipoPlan,
        cuotasMensual: '0',
        cuotasTotales: 12,
        cuotasPagadas: 0,
        porcentajeCobertura: '0',
        estado: 'activo',
        notas: notas ?? null,
      })
    }

    // 3. Registrar interacción en el lead
    if (leadId) {
      await db.insert(leadInteracciones).values({
        leadId,
        tipo: 'nota',
        descripcion: `Lead convertido a cliente. ${tipo === 'servicio' ? 'Servicio: ' + tipoServicio : 'Plan: ' + tipoPlan}. Cliente ID: ${cliente.id}`,
      })
    }

    return NextResponse.json({ ok: true, clienteId: cliente.id }, { status: 201 })
  } catch (error) {
    console.error('Error convirtiendo lead:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}