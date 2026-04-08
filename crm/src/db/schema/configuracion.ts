import { pgTable, uuid, text, timestamp, numeric, integer, jsonb, boolean } from 'drizzle-orm/pg-core'

export const planesConfig = pgTable('planes_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre').notNull(),
  descripcion: text('descripcion'),
  cuotaMensual: numeric('cuota_mensual', { precision: 10, scale: 2 }).notNull(),
  cuotasTotales: integer('cuotas_totales').notNull(),
  beneficios: jsonb('beneficios'), // lista de beneficios configurables
  coberturaEscalonada: jsonb('cobertura_escalonada'), // { cuota: porcentaje }
  activo: boolean('activo').default(true).notNull(),
  creadoEn: timestamp('creado_en').defaultNow().notNull(),
  actualizadoEn: timestamp('actualizado_en').defaultNow().notNull(),
})

export const templatesMsg = pgTable('templates_msg', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre').notNull(),
  canal: text('canal').notNull(), // whatsapp, email
  evento: text('evento').notNull(), // bienvenida, recordatorio_pago, servicio_listo, etc
  contenido: text('contenido').notNull(),
  activo: boolean('activo').default(true).notNull(),
  creadoEn: timestamp('creado_en').defaultNow().notNull(),
  actualizadoEn: timestamp('actualizado_en').defaultNow().notNull(),
})

export type PlanConfig = typeof planesConfig.$inferSelect
export type NuevoPlanConfig = typeof planesConfig.$inferInsert
export type TemplateMsg = typeof templatesMsg.$inferSelect
export type NuevoTemplateMsg = typeof templatesMsg.$inferInsert