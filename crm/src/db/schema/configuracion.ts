import { pgTable, uuid, text, timestamp, numeric, integer, jsonb, boolean } from 'drizzle-orm/pg-core'
import { clientes } from './clientes'
import { servicios } from './servicios'

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

export const comunicaciones = pgTable('comunicaciones', {
  id: uuid('id').primaryKey().defaultRandom(),
  clienteId: uuid('cliente_id').notNull().references(() => clientes.id),
  servicioId: uuid('servicio_id').references(() => servicios.id),
  templateId: uuid('template_id').references(() => templatesMsg.id),
  canal: text('canal').notNull(),
  mensaje: text('mensaje').notNull(),
  estado: text('estado').notNull().default('pendiente'), // pendiente, enviado
  creadoEn: timestamp('creado_en').defaultNow().notNull(),
})

export type Comunicacion = typeof comunicaciones.$inferSelect
export type NuevaComunicacion = typeof comunicaciones.$inferInsert

export const configuracionGeneral = pgTable('configuracion_general', {
  id: uuid('id').primaryKey().defaultRandom(),
  clave: text('clave').notNull().unique(),
  valores: jsonb('valores').notNull(),
  descripcion: text('descripcion'),
  actualizadoEn: timestamp('actualizado_en').defaultNow().notNull(),
})

export type ConfiguracionGeneral = typeof configuracionGeneral.$inferSelect
export type NuevaConfiguracionGeneral = typeof configuracionGeneral.$inferInsert

export type PlanConfig = typeof planesConfig.$inferSelect
export type NuevoPlanConfig = typeof planesConfig.$inferInsert
export type TemplateMsg = typeof templatesMsg.$inferSelect
export type NuevoTemplateMsg = typeof templatesMsg.$inferInsert