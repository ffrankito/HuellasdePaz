import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const env = readFileSync(resolve(__dirname, '../.env.local'), 'utf8')

const dbUrl = env.match(/DATABASE_URL_UNPOOLED=(.+)/)?.[1]?.trim()
const supabaseUrl = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim()
const serviceKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim()

if (!dbUrl) throw new Error('DATABASE_URL_UNPOOLED no encontrado')
if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL no encontrado')
if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY no encontrado')

const { default: postgres } = await import('../node_modules/postgres/src/index.js')
const sql = postgres(dbUrl)

const EMAIL = 'zfi1811@gmail.com'
const NOMBRE = 'Franco Zancocchia'
const ROL = 'admin'
const PERMISOS = ['gestion_equipo', 'ver_reportes', 'configuracion', 'cobranzas']

// 1. Verificar si ya existe en tabla usuarios
const [existente] = await sql`SELECT id FROM usuarios WHERE email = ${EMAIL}`
if (existente) {
  console.log(`El usuario ya existe en DB con id ${existente.id}`)

  // Verificar si el Auth user existe
  const check = await fetch(`${supabaseUrl}/auth/v1/admin/users/${existente.id}`, {
    headers: { 'Authorization': `Bearer ${serviceKey}`, 'apikey': serviceKey },
  })
  if (check.ok) {
    console.log('✅ Auth user también existe — todo OK.')
    await sql.end()
    process.exit(0)
  }
  console.log('Auth user no existe — recreando...')

  // Recrear Auth user preservando el mismo UUID no es posible vía API.
  // Hay que borrar el registro viejo y crear uno nuevo.
  await sql`DELETE FROM usuarios WHERE email = ${EMAIL}`
  console.log('Registro viejo borrado de tabla usuarios')
}

// 2. Crear Auth user en Supabase
console.log(`\nCreando Auth user para ${EMAIL}...`)
const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${serviceKey}`,
    'apikey': serviceKey,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: EMAIL,
    email_confirm: true,
    // Contraseña temporal aleatoria — el usuario va a resetear desde el CRM
    password: 'Temp!' + Math.random().toString(36).slice(2, 10),
  }),
})

if (!createRes.ok) {
  const body = await createRes.text()
  console.error(`❌ Error al crear Auth user (${createRes.status}): ${body}`)
  await sql.end()
  process.exit(1)
}

const authUser = await createRes.json()
console.log(`✓ Auth user creado: ${authUser.id}`)

// 3. Insertar en tabla usuarios
await sql`
  INSERT INTO usuarios (id, nombre, email, rol, permisos)
  VALUES (${authUser.id}, ${NOMBRE}, ${EMAIL}, ${ROL}, ${PERMISOS})
`
console.log(`✓ Registro en tabla usuarios creado (rol: ${ROL}, permisos: ${PERMISOS.join(', ')})`)

await sql.end()
console.log(`\n✅ Listo. Ahora andá a /auth/login → "¿Olvidaste tu contraseña?" y reseteá desde ${EMAIL}`)