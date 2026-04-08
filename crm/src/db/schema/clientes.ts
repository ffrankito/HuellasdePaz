import { pgTable, uuid, text, timestamp, date } from 'drizzle-orm/pg-core'

export const clientes = pgTable('clientes', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre').notNull(),
  apellido: text('apellido').notNull(),
  email: text('email'),
  telefono: text('telefono').notNull(),
  direccion: text('direccion'),
  localidad: text('localidad'),
  provincia: text('provincia').default('Santa Fe'),
  origen: text('origen'), // referido, veterinaria, redes, web, etc
  notas: text('notas'),
  creadoEn: timestamp('creado_en').defaultNow().notNull(),
  actualizadoEn: timestamp('actualizado_en').defaultNow().notNull(),
})

export type Cliente = typeof clientes.$inferSelect
export type NuevoCliente = typeof clientes.$inferInsert