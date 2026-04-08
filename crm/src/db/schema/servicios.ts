import { pgTable, uuid, text, timestamp, numeric, pgEnum } from 'drizzle-orm/pg-core'
import { clientes } from './clientes'
import { mascotas } from './mascotas'
import { usuarios } from './usuarios'

export const estadoServicioEnum = pgEnum('estado_servicio', [
  'ingresado',
  'retiro_pendiente',
  'en_transporte',
  'recibido',
  'en_cremacion',
  'cremado',
  'listo_entrega',
  'entregado',
  'cancelado',
])

export const tipoServicioEnum = pgEnum('tipo_servicio', [
  'cremacion_individual',
  'cremacion_comunitaria',
  'entierro',
])

export const servicios = pgTable('servicios', {
  id: uuid('id').primaryKey().defaultRandom(),
  clienteId: uuid('cliente_id').notNull().references(() => clientes.id),
  mascotaId: uuid('mascota_id').notNull().references(() => mascotas.id),
  tipo: tipoServicioEnum('tipo').notNull(),
  estado: estadoServicioEnum('estado').notNull().default('ingresado'),
  precio: numeric('precio', { precision: 10, scale: 2 }),
  descuento: numeric('descuento', { precision: 10, scale: 2 }).default('0'),
  responsableTransporteId: uuid('responsable_transporte_id').references(() => usuarios.id),
  responsableCremacionId: uuid('responsable_cremacion_id').references(() => usuarios.id),
  responsableEntregaId: uuid('responsable_entrega_id').references(() => usuarios.id),
  fechaRetiro: timestamp('fecha_retiro'),
  fechaCremacion: timestamp('fecha_cremacion'),
  fechaEntrega: timestamp('fecha_entrega'),
  notas: text('notas'),
  creadoEn: timestamp('creado_en').defaultNow().notNull(),
  actualizadoEn: timestamp('actualizado_en').defaultNow().notNull(),
})

export type Servicio = typeof servicios.$inferSelect
export type NuevoServicio = typeof servicios.$inferInsert