import { readFileSync } from 'fs'

const envFile = readFileSync('.env.local', 'utf8')
const dbUrl = envFile.match(/DATABASE_URL_UNPOOLED=(.+)/)?.[1]?.trim()

const postgres = (await import('./node_modules/postgres/src/index.js')).default
const sql = postgres(dbUrl)

const migration = readFileSync('./supabase/migrations/0013_importaciones_leads.sql', 'utf8')
await sql.unsafe(migration)
console.log('✅ Migración 0013 aplicada')
await sql.end()
