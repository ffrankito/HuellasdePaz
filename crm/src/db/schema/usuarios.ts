import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const rolEnum = pgEnum('rol', [
  'admin',
  'manager',
  'contadora',
  'televenta',
  'transporte',
  'cremacion',
  'entrega',
])

// Permisos adicionales independientes del rol.
// Permiten extender accesos sin cambiar el rol operativo.
// Ej: un admin puede tener 'gestion_equipo' para ver secciones de manager.
export const PERMISOS = [
  'gestion_equipo',  // ver agentes, rendimiento y reportes del equipo
  'ver_reportes',    // acceso a reportes generales
  'configuracion',   // acceso a configuración del sistema
  'cobranzas',       // acceso al módulo de cobranzas
] as const

export type Permiso = typeof PERMISOS[number]

export const usuarios = pgTable('usuarios', {
  id: uuid('id').primaryKey(),
  nombre: text('nombre').notNull(),
  email: text('email').notNull().unique(),
  rol: rolEnum('rol').notNull().default('televenta'),
  permisos: text('permisos').array().notNull().default([]),
  creadoEn: timestamp('creado_en').defaultNow().notNull(),
  actualizadoEn: timestamp('actualizado_en').defaultNow().notNull(),
})

export type Usuario = typeof usuarios.$inferSelect
export type NuevoUsuario = typeof usuarios.$inferInsert