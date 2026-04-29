import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { leads, usuarios, leadInteracciones, importacionesLeads } from '@/db/schema'
import { eq, and, notInArray, count, inArray } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

type FilaLead = {
  nombre: string
  telefono: string
  email?: string | null
  dni?: string | null
  mensaje?: string | null
}

async function obtenerAgentes() {
  const agentes = await db.select().from(usuarios).where(eq(usuarios.rol, 'televenta'))
  if (agentes.length === 0) return []

  const conActivos = await Promise.all(
    agentes.map(async (a) => {
      const [{ activos }] = await db
        .select({ activos: count() })
        .from(leads)
        .where(and(eq(leads.asignadoAId, a.id), notInArray(leads.estado, ['convertido', 'perdido'])))
      return { id: a.id, activos }
    })
  )
  conActivos.sort((a, b) => a.activos - b.activos)
  return conActivos
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const filas: FilaLead[] = body.filas
    const nombreArchivo: string = body.nombreArchivo

    if (!filas?.length) {
      return NextResponse.json({ error: 'Sin filas' }, { status: 400 })
    }

    // 1. Crear registro de importación
    const [importacion] = await db.insert(importacionesLeads).values({
      nombreArchivo,
      totalImportados: 0,
      totalDuplicados: 0,
      totalErrores: 0,
    }).returning()

    // 2. Detectar duplicados en una sola query
    const telefonos = filas.map(f => f.telefono)
    const existentes = await db.select({ telefono: leads.telefono })
      .from(leads)
      .where(inArray(leads.telefono, telefonos))
    const telefonosExistentes = new Set(existentes.map(e => e.telefono))

    const nuevas = filas.filter(f => !telefonosExistentes.has(f.telefono))
    const duplicados = filas.length - nuevas.length

    if (nuevas.length === 0) {
      await db.update(importacionesLeads)
        .set({ totalImportados: 0, totalDuplicados: duplicados, totalErrores: 0 })
        .where(eq(importacionesLeads.id, importacion.id))
      return NextResponse.json({ importados: 0, duplicados, errores: 0 })
    }

    // 3. Distribuir agentes en round-robin
    const agentes = await obtenerAgentes()
    const asignarAgente = (() => {
      let i = 0
      return () => agentes.length > 0 ? agentes[i++ % agentes.length].id : null
    })()

    // 4. Insertar todos los leads nuevos de una vez
    const leadsInsertados = await db.insert(leads).values(
      nuevas.map(f => ({
        nombre: f.nombre,
        telefono: f.telefono,
        email: f.email ?? null,
        dni: f.dni ?? null,
        mensaje: f.mensaje ?? null,
        origen: 'directo' as const,
        importacionId: importacion.id,
        asignadoAId: asignarAgente(),
      }))
    ).returning()

    // 5. Insertar todas las interacciones de una vez
    await db.insert(leadInteracciones).values(
      leadsInsertados.map(lead => ({
        leadId: lead.id,
        usuarioId: lead.asignadoAId,
        tipo: 'asignacion',
        descripcion: `Lead ingresado por importación masiva. ${lead.asignadoAId ? 'Asignado automáticamente.' : 'Sin agentes disponibles.'}`,
      }))
    )

    // 6. Actualizar totales
    await db.update(importacionesLeads)
      .set({ totalImportados: leadsInsertados.length, totalDuplicados: duplicados, totalErrores: 0 })
      .where(eq(importacionesLeads.id, importacion.id))

    revalidatePath('/dashboard', 'layout')
    return NextResponse.json({ importados: leadsInsertados.length, duplicados, errores: 0 })
  } catch (error) {
    console.error('Error en importación batch:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
