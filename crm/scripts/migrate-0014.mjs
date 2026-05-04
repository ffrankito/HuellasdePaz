import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const env = readFileSync(resolve(__dirname, '../.env.local'), 'utf8')
const dbUrl = env.match(/DATABASE_URL_UNPOOLED=(.+)/)?.[1]?.trim()
if (!dbUrl) throw new Error('DATABASE_URL_UNPOOLED no encontrado en .env.local')

const { default: postgres } = await import('../node_modules/postgres/src/index.js')
const sql = postgres(dbUrl)

console.log('Aplicando migración 0014...')

await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS seguimiento_en TIMESTAMP`
console.log('✓ leads.seguimiento_en')

await sql.end()
console.log('Migración 0014 aplicada.')
