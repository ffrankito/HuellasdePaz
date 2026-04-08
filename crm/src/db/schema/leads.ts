import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { usuarios } from './usuarios'

export const estadoLeadEnum = pgEnum('estado_lead', [
  'nuevo',
  'contactado',
  'interesado',
  'cotizado',
  'convertido',
  'perdido',
])

export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre').notNull(),
  telefono: text('telefono').notNull(),
  email: text('email'),
  mensaje: text('mensaje'),
  origen: text('origen').default('landing'), // landing, whatsapp, veterinaria, referido
  estado: estadoLeadEnum('estado').notNull().default('nuevo'),
  asignadoAId: uuid('asignado_a_id').references(() => usuarios.id),
  notas: text('notas'),
  creadoEn: timestamp('creado_en').defaultNow().notNull(),
  actualizadoEn: timestamp('actualizado_en').defaultNow().notNull(),
})

export type Lead = typeof leads.$inferSelect
export type NuevoLead = typeof leads.$inferInsert