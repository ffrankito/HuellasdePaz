import { pgTable, uuid, text, timestamp, numeric, pgEnum } from 'drizzle-orm/pg-core'

export const estadoConvenioEnum = pgEnum('estado_convenio', [
  'sin_convenio',
  'en_negociacion',
  'activo',
  'pausado',
])

export const tipoConvenioEnum = pgEnum('tipo_convenio', [
  'veterinaria',
  'petshop',
  'refugio',
  'clinica',
  'otro',
])

export const convenios = pgTable('convenios', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre').notNull(),
  tipo: tipoConvenioEnum('tipo').notNull().default('veterinaria'),
  direccion: text('direccion'),
  telefono: text('telefono'),
  email: text('email'),
  responsable: text('responsable'),
  instagram: text('instagram'),
  web: text('web'),
  estadoConvenio: estadoConvenioEnum('estado_convenio').notNull().default('sin_convenio'),
  descuentoPorcentaje: numeric('descuento_porcentaje', { precision: 5, scale: 2 }).default('0'),
  beneficioDescripcion: text('beneficio_descripcion'),
  fechaInicioConvenio: timestamp('fecha_inicio_convenio'),
  fechaVencimientoConvenio: timestamp('fecha_vencimiento_convenio'),
  notas: text('notas'),
  creadoEn: timestamp('creado_en').defaultNow().notNull(),
  actualizadoEn: timestamp('actualizado_en').defaultNow().notNull(),
})

export type Convenio = typeof convenios.$inferSelect
export type NuevoConvenio = typeof convenios.$inferInsert

// Alias para compatibilidad con código existente
export const veterinarias = convenios
export type Veterinaria = Convenio
export type NuevaVeterinaria = NuevoConvenio