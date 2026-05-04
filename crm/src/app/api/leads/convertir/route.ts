import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { clientes, mascotas, servicios, planes, leadInteracciones, serviciosConfig, planesConfig, convenios, inventario } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import { requireAuth } from '@/lib/api-auth'

export async function POST(request: NextRequest) {
  const auth = await requireAuth(['admin', 'manager', 'televenta'])
  if (!auth.ok) return auth.response

  try {
    const body = await request.json()
    const { leadId, nombre, apellido, telefono, email, dni, localidad, tipo, servicioConfigId, tipoPlan, notas, convenioId, mascotaNombre, mascotaEspecie, inventarioItemId, fechaRetiro, modalidadRetiro } = body

    // 1. Crear cliente
    const [cliente] = await db.insert(clientes).values({
      nombre: nombre ?? '',
      apellido: apellido ?? '',
      telefono: telefono ?? '',
      email: email ?? null,
      dni: dni ?? null,
      localidad: localidad ?? null,
      origen: 'lead',
      veterinariaId: convenioId || null,
    }).returning()

    // 2. Crear mascota si se proporcionó
    let mascotaId: string | null = null
    if (mascotaNombre?.trim()) {
      const [mascota] = await db.insert(mascotas).values({
        clienteId: cliente.id,
        nombre: mascotaNombre.trim(),
        especie: mascotaEspecie?.trim() || 'perro',
      }).returning()
      mascotaId = mascota.id
    }

    // 3. Crear servicio o plan
    if (tipo === 'servicio' && servicioConfigId) {
      const [config, convenio] = await Promise.all([
        db.query.serviciosConfig.findFirst({ where: eq(serviciosConfig.id, servicioConfigId) }),
        convenioId
          ? db.query.convenios.findFirst({ where: eq(convenios.id, convenioId) })
          : Promise.resolve(null),
      ])

      const precioBase = config?.precio ? Number(config.precio) : null
      const cubiertos = convenio?.serviciosCubiertos as string[] | null
      const convenioAplica = !cubiertos || cubiertos.length === 0 || cubiertos.includes(servicioConfigId)
      const descuentoPct = convenioAplica && convenio?.descuentoPorcentaje ? Number(convenio.descuentoPorcentaje) : 0
      const descuentoMonto = precioBase ? Math.round(precioBase * descuentoPct / 100) : 0

      await db.insert(servicios).values({
        numero: sql`nextval('servicios_numero_seq')`,
        clienteId: cliente.id,
        mascotaId,
        tipo: config?.tipo ?? 'cremacion_individual',
        servicioConfigId,
        convenioId: convenioId || null,
        inventarioItemId: inventarioItemId || null,
        precio: precioBase !== null ? String(precioBase) : null,
        descuento: String(descuentoMonto),
        estado: 'pendiente',
        fechaRetiro: fechaRetiro ? new Date(fechaRetiro) : null,
        modalidadRetiro: modalidadRetiro || null,
        notas: notas ?? null,
      })

      if (inventarioItemId) {
        await db.update(inventario)
          .set({ stockActual: sql`${inventario.stockActual} - 1` })
          .where(eq(inventario.id, inventarioItemId))
      }
    }

    if (tipo === 'plan' && tipoPlan) {
      const config = await db.query.planesConfig.findFirst({ where: eq(planesConfig.id, tipoPlan) })

      await db.insert(planes).values({
        numero: sql`nextval('planes_numero_seq')`,
        clienteId: cliente.id,
        mascotaId,
        planConfigId: tipoPlan,
        cuotasMensual: config?.cuotaMensual ?? '0',
        cuotasTotales: config?.cuotasTotales ?? 12,
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
        descripcion: `Lead convertido a cliente. ${tipo === 'servicio' ? 'Servicio config ID: ' + servicioConfigId : 'Plan config ID: ' + tipoPlan}. Cliente ID: ${cliente.id}`,
      })
    }

    revalidatePath('/dashboard', 'layout')
    return NextResponse.json({ ok: true, clienteId: cliente.id }, { status: 201 })
  } catch (error) {
    console.error('Error convirtiendo lead:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}