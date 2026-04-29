import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core'

export const asistenteLog = pgTable('asistente_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  usuarioId: uuid('usuario_id'),
  rol: text('rol'),
  pregunta: text('pregunta').notNull(),
  screenContext: text('screen_context'),
  tokensInput: integer('tokens_input').default(0),
  tokensOutput: integer('tokens_output').default(0),
  creadoEn: timestamp('creado_en').defaultNow().notNull(),
})
