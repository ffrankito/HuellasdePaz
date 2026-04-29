import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

declare global {
  // eslint-disable-next-line no-var
  var __pgClient: ReturnType<typeof postgres> | undefined
}

// In dev, use the direct (unpooled) connection to bypass Supavisor's query_timeout.
// In production, use the transaction-mode pooler (required for serverless).
const isDev = process.env.NODE_ENV !== 'production'
const connectionString = isDev && process.env.DATABASE_URL_UNPOOLED
  ? process.env.DATABASE_URL_UNPOOLED
  : process.env.DATABASE_URL!

const client =
  globalThis.__pgClient ??
  postgres(connectionString, {
    prepare: isDev && !!process.env.DATABASE_URL_UNPOOLED, // pooler requires prepare:false
    max: isDev ? 5 : 10,
    idle_timeout: 20,
  })

if (process.env.NODE_ENV !== 'production') {
  globalThis.__pgClient = client
}

export const db = drizzle(client, { schema })
