import { db } from '@/db'
import { leads, usuarios, leadInteracciones } from '@/db/schema'
import { eq, and, notInArray, count } from 'drizzle-orm'

export type OrigenLead =
  | 'landing'
  | 'whatsapp'
  | 'instagram'
  | 'cotizador'
  | 'veterinaria'
  | 'directo'
  | 'chatbot'

export type DatosLead = {
  nombre: string
  telefono: string
  email?: string
  dni?: string
  mensaje?: string
  origen: OrigenLead
  pickupMethod?: string
  veterinariaId?: string
  importacionId?: string
}

// ── Round-robin ──────────────────────────────────────────────────────────────

async function asignarAgente(): Promise<string | null> {
  const agentes = await db
    .select()
    .from(usuarios)
    .where(eq(usuarios.rol, 'televenta'))

  if (agentes.length === 0) return null

  // Contar leads activos por agente
  const conActivos = await Promise.all(
    agentes.map(async (a) => {
      const [{ activos }] = await db
        .select({ activos: count() })
        .from(leads)
        .where(
          and(
            eq(leads.asignadoAId, a.id),
            notInArray(leads.estado, ['convertido', 'perdido'])
          )
        )
      return { id: a.id, activos }
    })
  )

  // Preferir agentes sin leads activos
  const disponibles = conActivos.filter(a => a.activos === 0)

  if (disponibles.length > 0) {
    // Entre disponibles, el que tiene menos leads históricos (round-robin justo)
    const conTotal = await Promise.all(
      disponibles.map(async (a) => {
        const [{ total }] = await db
          .select({ total: count() })
          .from(leads)
          .where(eq(leads.asignadoAId, a.id))
        return { id: a.id, total }
      })
    )
    conTotal.sort((a, b) => a.total - b.total)
    return conTotal[0].id
  }

  // Todos ocupados — asignar al que tiene menos activos
  conActivos.sort((a, b) => a.activos - b.activos)
  return conActivos[0].id
}

// ── Función principal ────────────────────────────────────────────────────────

export async function crearLeadAutomatico(datos: DatosLead) {
  // Verificar si ya existe un lead con ese teléfono
  const existente = await db.query.leads.findFirst({
    where: eq(leads.telefono, datos.telefono),
  })

  if (existente) {
    // Lead duplicado — registrar nueva interacción y actualizar timestamp
    await db
      .update(leads)
      .set({
        ultimaInteraccionEn: new Date(),
        actualizadoEn: new Date(),
      })
      .where(eq(leads.id, existente.id))

    await db.insert(leadInteracciones).values({
      leadId: existente.id,
      usuarioId: existente.asignadoAId,
      tipo: 'nota',
      descripcion: `Nuevo contacto por ${datos.origen}${datos.mensaje ? `: "${datos.mensaje}"` : ''}`,
    })

    return { lead: existente, esNuevo: false }
  }

  // Lead nuevo — asignar agente y crear
  const asignadoAId = await asignarAgente()

  const [lead] = await db.insert(leads).values({
    nombre: datos.nombre,
    telefono: datos.telefono,
    email: datos.email ?? null,
    dni: datos.dni ?? null,
    mensaje: datos.mensaje ?? null,
    origen: datos.origen,
    pickupMethod: datos.pickupMethod ?? null,
    asignadoAId,
    veterinariaId: datos.veterinariaId ?? null,
    importacionId: datos.importacionId ?? null,
  }).returning()

  // Registrar interacción inicial
  await db.insert(leadInteracciones).values({
    leadId: lead.id,
    usuarioId: asignadoAId,
    tipo: 'asignacion',
    descripcion: `Lead ingresado por ${datos.origen}. ${asignadoAId ? 'Asignado automáticamente por round-robin.' : 'Sin agentes disponibles.'}`,
  })

  return { lead, esNuevo: true }
}