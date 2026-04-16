import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const rolEnum = pgEnum('rol', [
  'admin',
  'manager',
  'contadora',
  'televenta',
  'transporte',
  'cremacion',
  'entrega',
])

export const usuarios = pgTable('usuarios', {
  id: uuid('id').primaryKey(),
  nombre: text('nombre').notNull(),
  email: text('email').notNull().unique(),
  rol: rolEnum('rol').notNull(),
  activo: text('activo').notNull().default('true'),
  creadoEn: timestamp('creado_en').defaultNow().notNull(),
  actualizadoEn: timestamp('actualizado_en').defaultNow().notNull(),
})

export type Usuario = typeof usuarios.$inferSelect
export type NuevoUsuario = typeof usuarios.$inferInsert