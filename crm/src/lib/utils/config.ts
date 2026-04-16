import { db } from '@/db'
import { configuracionGeneral } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function getConfig(clave: string): Promise<string[]> {
  const config = await db.query.configuracionGeneral.findFirst({
    where: eq(configuracionGeneral.clave, clave),
  })
  if (!config) return []
  return config.valores as string[]
}

export async function getTiposServicio() {
  return getConfig('tipos_servicio')
}

export async function getOriginesLead() {
  return getConfig('origenes_lead')
}

export async function getEspeciesMascota() {
  return getConfig('especies_mascota')
}