import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const env = readFileSync(resolve(__dirname, '../.env.local'), 'utf8')
const dbUrl = env.match(/DATABASE_URL_UNPOOLED=(.+)/)?.[1]?.trim()
if (!dbUrl) throw new Error('DATABASE_URL_UNPOOLED no encontrado en .env.local')

const { default: postgres } = await import('../node_modules/postgres/src/index.js')
const sql = postgres(dbUrl)

console.log('Aplicando migración 0015 — 2FA por email OTP...')

await sql`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS mfa_email_activo BOOLEAN NOT NULL DEFAULT FALSE`
console.log('✓ usuarios.mfa_email_activo')

await sql`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS otp_codigo TEXT`
console.log('✓ usuarios.otp_codigo')

await sql`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS otp_expira_en TIMESTAMP`
console.log('✓ usuarios.otp_expira_en')

await sql`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS otp_intentos INTEGER DEFAULT 0`
console.log('✓ usuarios.otp_intentos')

await sql`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS mfa_sesion_token TEXT`
console.log('✓ usuarios.mfa_sesion_token')

await sql`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS mfa_sesion_expira_en TIMESTAMP`
console.log('✓ usuarios.mfa_sesion_expira_en')

await sql.end()
console.log('Migración 0015 aplicada.')
