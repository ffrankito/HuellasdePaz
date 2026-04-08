import { pgTable, uuid, text, timestamp, date } from 'drizzle-orm/pg-core'
import { clientes } from './clientes'

export const mascotas = pgTable('mascotas', {
  id: uuid('id').primaryKey().defaultRandom(),
  clienteId: uuid('cliente_id').notNull().references(() => clientes.id),
  nombre: text('nombre').notNull(),
  especie: text('especie').notNull(), // perro, gato, conejo, etc
  raza: text('raza'),
  color: text('color'),
  fechaNacimiento: date('fecha_nacimiento'),
  fechaFallecimiento: date('fecha_fallecimiento'),
  foto: text('foto'), // URL
  notas: text('notas'),
  creadoEn: timestamp('creado_en').defaultNow().notNull(),
  actualizadoEn: timestamp('actualizado_en').defaultNow().notNull(),
})

export type Mascota = typeof mascotas.$inferSelect
export type NuevaMascota = typeof mascotas.$inferInsert