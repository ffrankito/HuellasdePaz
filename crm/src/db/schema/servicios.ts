import { pgTable, uuid, text, timestamp, numeric, integer, boolean, pgEnum } from 'drizzle-orm/pg-core'
import { clientes } from './clientes'
import { mascotas } from './mascotas'
import { usuarios } from './usuarios'
import { convenios } from './veterinarias'
import { inventario } from './inventario'

export const estadoServicioEnum = pgEnum('estado_servicio', [
  'pendiente',
  'en_proceso',
  'listo',
  'entregado',
  'cancelado',
])

export const tipoServicioEnum = pgEnum('tipo_servicio', [
  'cremacion_individual',
  'cremacion_comunitaria',
  'entierro',
])

export const serviciosConfig = pgTable('servicios_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre').notNull(),
  tipo: tipoServicioEnum('tipo').notNull(),
  precio: numeric('precio', { precision: 10, scale: 2 }),
  descripcion: text('descripcion'),
  activo: boolean('activo').default(true).notNull(),
  creadoEn: timestamp('creado_en').defaultNow().notNull(),
  actualizadoEn: timestamp('actualizado_en').defaultNow().notNull(),
})

export type ServicioConfig = typeof serviciosConfig.$inferSelect
export type NuevoServicioConfig = typeof serviciosConfig.$inferInsert

export const servicios = pgTable('servicios', {
  id: uuid('id').primaryKey().defaultRandom(),
  numero: integer('numero').notNull(),
  clienteId: uuid('cliente_id').notNull().references(() => clientes.id),
  mascotaId: uuid('mascota_id').references(() => mascotas.id),
  tipo: tipoServicioEnum('tipo').notNull(),
  estado: estadoServicioEnum('estado').notNull().default('pendiente'),
  precio: numeric('precio', { precision: 10, scale: 2 }),
  descuento: numeric('descuento', { precision: 10, scale: 2 }).default('0'),
  responsableTransporteId: uuid('responsable_transporte_id').references(() => usuarios.id),
  responsableCremacionId: uuid('responsable_cremacion_id').references(() => usuarios.id),
  responsableEntregaId: uuid('responsable_entrega_id').references(() => usuarios.id),
  fechaRetiro: timestamp('fecha_retiro'),
  fechaCremacion: timestamp('fecha_cremacion'),
  fechaEntrega: timestamp('fecha_entrega'),
  convenioId: uuid('convenio_id').references(() => convenios.id),
  servicioConfigId: uuid('servicio_config_id').references(() => serviciosConfig.id),
  inventarioItemId: uuid('inventario_item_id').references(() => inventario.id),
  modalidadRetiro: text('modalidad_retiro'),
  pagado: boolean('pagado').default(false).notNull(),
  notas: text('notas'),
  creadoEn: timestamp('creado_en').defaultNow().notNull(),
  actualizadoEn: timestamp('actualizado_en').defaultNow().notNull(),
})

export type Servicio = typeof servicios.$inferSelect
export type NuevoServicio = typeof servicios.$inferInsert