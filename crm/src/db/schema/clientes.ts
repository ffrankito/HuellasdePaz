import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { veterinarias } from './veterinarias'

export const clientes = pgTable('clientes', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre').notNull(),
  apellido: text('apellido').notNull(),
  email: text('email'),
  dni: text('dni'),
  telefono: text('telefono').notNull(),
  direccion: text('direccion'),
  localidad: text('localidad'),
  provincia: text('provincia').default('Santa Fe'),
  origen: text('origen'),
  notas: text('notas'),
  tokenPortal: text('token_portal').unique(),
  authUserId: text('auth_user_id').unique(),
  creadoEn: timestamp('creado_en').defaultNow().notNull(),
  actualizadoEn: timestamp('actualizado_en').defaultNow().notNull(),
  veterinariaId: uuid('veterinaria_id').references(() => veterinarias.id),
})

export type Cliente = typeof clientes.$inferSelect
export type NuevoCliente = typeof clientes.$inferInsert