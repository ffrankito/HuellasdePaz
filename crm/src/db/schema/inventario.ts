import { pgTable, uuid, text, timestamp, integer, numeric, boolean, pgEnum } from 'drizzle-orm/pg-core'

export const categoriaInventarioEnum = pgEnum('categoria_inventario', [
  'urna',
  'bolsa',
  'caja',
  'accesorio',
  'insumo',
  'otro',
])

export const inventario = pgTable('inventario', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre').notNull(),
  descripcion: text('descripcion'),
  categoria: categoriaInventarioEnum('categoria').notNull(),
  stockActual: integer('stock_actual').notNull().default(0),
  stockMinimo: integer('stock_minimo').notNull().default(5),
  precioUnitario: numeric('precio_unitario', { precision: 10, scale: 2 }),
  proveedor: text('proveedor'),
  foto: text('foto'),
  notas: text('notas'),
  paraVenta: boolean('para_venta').notNull().default(false),
  creadoEn: timestamp('creado_en').defaultNow().notNull(),
  actualizadoEn: timestamp('actualizado_en').defaultNow().notNull()
  
})

export type ItemInventario = typeof inventario.$inferSelect
export type NuevoItemInventario = typeof inventario.$inferInsert