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

// ── Preview ───────────────────────────────────────────────────────────────────
const [{ count: cPlanes }] = await sql`SELECT count(*)::int AS count FROM planes`
const [{ count: cComunicaciones }] = await sql`SELECT count(*)::int AS count FROM comunicaciones`
const [{ count: cServicios }] = await sql`SELECT count(*)::int AS count FROM servicios`
const [{ count: cMascotas }] = await sql`SELECT count(*)::int AS count FROM mascotas`
const [{ count: cClientes }] = await sql`SELECT count(*)::int AS count FROM clientes`

console.log('\n━━━ PREVIEW — registros a borrar ━━━')
console.log(`  planes:              ${cPlanes}`)
console.log(`  comunicaciones:      ${cComunicaciones}`)
console.log(`  servicios:           ${cServicios}`)
console.log(`  mascotas:            ${cMascotas}`)
console.log(`  clientes:            ${cClientes}`)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
console.log('NOTA: leads y configuraciones NO se tocan.\n')

// ── 1. Planes ─────────────────────────────────────────────────────────────────
await sql`DELETE FROM planes`
console.log(`✓ Planes eliminados (${cPlanes})`)

// ── 2. Comunicaciones ─────────────────────────────────────────────────────────
await sql`DELETE FROM comunicaciones`
console.log(`✓ Comunicaciones eliminadas (${cComunicaciones})`)

// ── 4. Servicios ──────────────────────────────────────────────────────────────
await sql`DELETE FROM servicios`
console.log(`✓ Servicios eliminados (${cServicios})`)

// ── 5. Mascotas ───────────────────────────────────────────────────────────────
await sql`DELETE FROM mascotas`
console.log(`✓ Mascotas eliminadas (${cMascotas})`)

// ── 6. Clientes (+ Supabase Auth) ─────────────────────────────────────────────
const clientesConAuth = await sql`SELECT id, auth_user_id FROM clientes WHERE auth_user_id IS NOT NULL`
await sql`DELETE FROM clientes`
console.log(`✓ Clientes eliminados (${cClientes})`)

for (const cliente of clientesConAuth) {
  const res = await fetch(`${supabaseUrl}/auth/v1/admin/users/${cliente.auth_user_id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${serviceKey}`,
      'apikey': serviceKey,
    },
  })
  if (res.ok || res.status === 404) {
    console.log(`  ✓ Auth user ${cliente.auth_user_id} eliminado`)
  } else {
    const body = await res.text()
    console.warn(`  ⚠ Error al borrar Auth user (${res.status}): ${body}`)
  }
}

// ── 7. Usuario Fabian ─────────────────────────────────────────────────────────
const fabians = await sql`SELECT id, nombre, email FROM usuarios WHERE lower(nombre) LIKE '%fabian%' OR lower(nombre) LIKE '%fabián%'`
console.log(`\nUsuarios "Fabian" encontrados: ${fabians.length}`)

for (const fabian of fabians) {
  console.log(`  → ${fabian.nombre} <${fabian.email}> (${fabian.id})`)
  await sql`DELETE FROM usuarios WHERE id = ${fabian.id}`
  console.log(`  ✓ Borrado de tabla usuarios`)

  const res = await fetch(`${supabaseUrl}/auth/v1/admin/users/${fabian.id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${serviceKey}`,
      'apikey': serviceKey,
    },
  })
  if (res.ok || res.status === 404) {
    console.log(`  ✓ Borrado de Supabase Auth`)
  } else {
    const body = await res.text()
    console.warn(`  ⚠ Error al borrar de Auth (${res.status}): ${body}`)
  }
}

await sql.end()
console.log('\n✅ Limpieza completada.')