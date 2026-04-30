import { pgTable, uuid, text, timestamp, pgEnum, integer } from 'drizzle-orm/pg-core'
import { usuarios } from './usuarios'
import { veterinarias } from './veterinarias'

export const importacionesLeads = pgTable('importaciones_leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombreArchivo: text('nombre_archivo').notNull(),
  totalImportados: integer('total_importados').default(0).notNull(),
  totalDuplicados: integer('total_duplicados').default(0).notNull(),
  totalErrores: integer('total_errores').default(0).notNull(),
  creadoEn: timestamp('creado_en').defaultNow().notNull(),
})

export type ImportacionLead = typeof importacionesLeads.$inferSelect

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
  dni: text('dni'),
  mensaje: text('mensaje'),
  origen: text('origen').default('landing'),
  estado: estadoLeadEnum('estado').notNull().default('nuevo'),
  asignadoAId: uuid('asignado_a_id').references(() => usuarios.id),
  veterinariaId: uuid('veterinaria_id').references(() => veterinarias.id),
  importacionId: uuid('importacion_id').references(() => importacionesLeads.id, { onDelete: 'set null' }),
  pickupMethod: text('pickup_method'),
  notas: text('notas'),
  primerRespuestaEn: timestamp('primer_respuesta_en'),
  ultimaInteraccionEn: timestamp('ultima_interaccion_en'),
  creadoEn: timestamp('creado_en').defaultNow().notNull(),
  actualizadoEn: timestamp('actualizado_en').defaultNow().notNull(),
})

export const leadInteracciones = pgTable('lead_interacciones', {
  id: uuid('id').primaryKey().defaultRandom(),
  leadId: uuid('lead_id').notNull().references(() => leads.id),
  usuarioId: uuid('usuario_id').references(() => usuarios.id),
  tipo: text('tipo').notNull(),
  descripcion: text('descripcion').notNull(),
  creadoEn: timestamp('creado_en').defaultNow().notNull(),
})

export type Lead = typeof leads.$inferSelect
export type NuevoLead = typeof leads.$inferInsert
export type LeadInteraccion = typeof leadInteracciones.$inferSelect
export type NuevaLeadInteraccion = typeof leadInteracciones.$inferInsert