import { pgTable, uuid, text, timestamp, numeric, integer, boolean, pgEnum } from 'drizzle-orm/pg-core'
import { clientes } from './clientes'
import { mascotas } from './mascotas'

export const estadoPlanEnum = pgEnum('estado_plan', [
  'activo',
  'pausado',
  'cancelado',
  'utilizado',
])

export const planes = pgTable('planes', {
  id: uuid('id').primaryKey().defaultRandom(),
  numero: integer('numero').notNull(),
  clienteId: uuid('cliente_id').notNull().references(() => clientes.id),
  mascotaId: uuid('mascota_id').references(() => mascotas.id),
  planConfigId: uuid('plan_config_id').notNull(),
  estado: estadoPlanEnum('estado').notNull().default('activo'),
  cuotasMensual: numeric('cuota_mensual', { precision: 10, scale: 2 }).notNull(),
  cuotasPagadas: integer('cuotas_pagadas').default(0).notNull(),
  cuotasTotales: integer('cuotas_totales').notNull(),
  porcentajeCobertura: numeric('porcentaje_cobertura', { precision: 5, scale: 2 }).default('0'),
  mascotaAdicional: boolean('mascota_adicional').default(false).notNull(),
  notas: text('notas'),
  creadoEn: timestamp('creado_en').defaultNow().notNull(),
  actualizadoEn: timestamp('actualizado_en').defaultNow().notNull(),
})

export type Plan = typeof planes.$inferSelect
export type NuevoPlan = typeof planes.$inferInsert