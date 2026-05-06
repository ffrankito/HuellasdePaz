/**
 * Auto-generate the ERD from the Drizzle schema and write it into the
 * Obsidian vault under `wiki/architecture/erd.md`.
 *
 * Walks every `pgTable` exported from `src/db/schema`, partitions them by
 * the explicit DOMAIN_MAP below, and emits one Mermaid `erDiagram` block per
 * domain. Cross-domain foreign keys render the parent as a stub (PK only).
 *
 * Output is stamped with `<!-- schema-hash: ... -->` so `check-erd.ts`
 * can detect drift between the schema source and the committed diagram.
 *
 * Vault location:
 *   - `OBSIDIAN_VAULT_PATH` env var, OR
 *   - default `~/ObsidianVaults/huellas-de-paz`
 *
 * The script ERRORS (does not auto-create) if the vault root doesn't exist —
 * a missing vault on someone else's machine should be a clear "set the env
 * var or create the vault first" message, not silently materialize a folder
 * structure they didn't ask for.
 */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { is } from 'drizzle-orm'
import { PgTable, getTableConfig } from 'drizzle-orm/pg-core'

import * as schema from '../src/db/schema/index.ts'

// ---------------------------------------------------------------------------
// Domain map — single source of truth for ERD partitioning.
// Tables not listed here trigger a warning so new tables can't slip through.
// ---------------------------------------------------------------------------
const DOMAIN_MAP: Record<string, string[]> = {
  comercial: [
    'leads',
    'lead_interacciones',
    'planes',
    'planes_config',
    'importaciones_leads',
  ],
  'clientes-mascotas': ['clientes', 'mascotas'],
  operaciones: ['servicios', 'servicios_config', 'inventario'],
  infraestructura: [
    'usuarios',
    'convenios',
    'configuracion_general',
    'templates_msg',
    'comunicaciones',
    'noticias_cementerio',
    'asistente_log',
  ],
}

const DOMAIN_TITLES: Record<string, string> = {
  comercial: 'Comercial — pipeline de ventas',
  'clientes-mascotas': 'Clientes y mascotas',
  operaciones: 'Operaciones — servicios e inventario',
  infraestructura: 'Infraestructura — usuarios, convenios, comunicación, contenido',
}

const DOMAIN_DESCRIPTIONS: Record<string, string> = {
  comercial:
    'Captura de prospectos, conversión a clientes, planes de previsión contratados y configuración de planes.',
  'clientes-mascotas':
    'Núcleo del dominio: dueños y mascotas. Eje sobre el que giran servicios, planes y memoriales.',
  operaciones:
    'Ciclo de vida de un servicio (ingreso → cremación → entrega) e inventario de insumos.',
  infraestructura:
    'Equipo interno, convenios B2B, plantillas/log de comunicaciones, novedades del cementerio, configuración global y auditoría del asistente IA.',
}

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const SCHEMA_DIR = resolve(__dirname, '../src/db/schema')

const VAULT_PATH =
  process.env.OBSIDIAN_VAULT_PATH ?? join(homedir(), 'ObsidianVaults', 'huellas-de-paz')
const OUTPUT_PATH = join(VAULT_PATH, 'wiki', 'architecture', 'erd.md')

// ---------------------------------------------------------------------------
// Schema hash — deterministic across files, sorted by basename
// ---------------------------------------------------------------------------
function computeSchemaHash(): string {
  const files = readdirSync(SCHEMA_DIR)
    .filter((f) => f.endsWith('.ts'))
    .sort()

  const hash = createHash('sha256')
  for (const file of files) {
    hash.update(file)
    hash.update('\0')
    hash.update(readFileSync(join(SCHEMA_DIR, file)))
    hash.update('\0')
  }
  return hash.digest('hex')
}

// ---------------------------------------------------------------------------
// Schema introspection
// ---------------------------------------------------------------------------
type ColumnInfo = {
  name: string
  type: string
  primary: boolean
  isFk: boolean
  notNull: boolean
}

type ForeignKeyInfo = {
  fromColumn: string
  toTable: string
  toColumn: string
}

type TableInfo = {
  name: string
  columns: ColumnInfo[]
  foreignKeys: ForeignKeyInfo[]
}

function normalizeType(column: { dataType: string; columnType: string }): string {
  // dataType is human-readable ('string', 'number', 'date', 'json', 'boolean').
  // For uuid/text/jsonb we want the SQL flavor instead, so peek at columnType.
  const ct = column.columnType
  if (ct === 'PgUUID') return 'uuid'
  if (ct === 'PgText') return 'text'
  if (ct === 'PgVarchar') return 'varchar'
  if (ct === 'PgInteger') return 'int'
  if (ct === 'PgBigInt53' || ct === 'PgBigInt64') return 'bigint'
  if (ct === 'PgNumeric') return 'numeric'
  if (ct === 'PgBoolean') return 'bool'
  if (ct === 'PgTimestamp') return 'timestamp'
  if (ct === 'PgDate') return 'date'
  if (ct === 'PgJsonb') return 'jsonb'
  if (ct === 'PgJson') return 'json'
  return column.dataType
}

function collectTables(): TableInfo[] {
  // Dedupe by underlying table identity. The schema re-exports the same
  // pgTable under multiple aliases for backwards-compat (e.g. `convenios`
  // and `veterinarias` are the same table).
  const seen = new Set<unknown>()
  const tables: TableInfo[] = []

  for (const value of Object.values(schema)) {
    if (!is(value, PgTable)) continue
    if (seen.has(value)) continue
    seen.add(value)
    const config = getTableConfig(value)

    const fkColumnNames = new Set<string>()
    const foreignKeys: ForeignKeyInfo[] = []

    for (const fk of config.foreignKeys) {
      const ref = fk.reference()
      const fromColumn = ref.columns[0]?.name
      const targetTable = ref.foreignTable
      const toColumn = ref.foreignColumns[0]?.name
      if (!fromColumn || !targetTable || !toColumn) continue
      const targetName = getTableConfig(targetTable).name
      fkColumnNames.add(fromColumn)
      foreignKeys.push({ fromColumn, toTable: targetName, toColumn })
    }

    const columns: ColumnInfo[] = config.columns.map((col) => ({
      name: col.name,
      type: normalizeType(col),
      primary: col.primary,
      isFk: fkColumnNames.has(col.name),
      notNull: col.notNull,
    }))

    tables.push({ name: config.name, columns, foreignKeys })
  }

  return tables.sort((a, b) => a.name.localeCompare(b.name))
}

// ---------------------------------------------------------------------------
// Mermaid rendering
// ---------------------------------------------------------------------------
function renderEntity(table: TableInfo, isStub: boolean): string {
  const lines = [`  ${table.name} {`]

  if (isStub) {
    const pk = table.columns.find((c) => c.primary)
    if (pk) {
      lines.push(`    ${pk.type} ${pk.name} PK "stub: defined in another domain"`)
    }
  } else {
    for (const col of table.columns) {
      const markers: string[] = []
      if (col.primary) markers.push('PK')
      if (col.isFk) markers.push('FK')
      const suffix = markers.length ? ' ' + markers.join(' ') : ''
      lines.push(`    ${col.type} ${col.name}${suffix}`)
    }
  }

  lines.push('  }')
  return lines.join('\n')
}

function renderDomainDiagram(
  domain: string,
  tables: TableInfo[],
  byName: Map<string, TableInfo>,
  domainOf: Map<string, string>,
): string {
  const inDomain = new Set(tables.map((t) => t.name))

  // External tables referenced via FK from any table in this domain.
  const stubs = new Set<string>()
  for (const t of tables) {
    for (const fk of t.foreignKeys) {
      if (!inDomain.has(fk.toTable)) stubs.add(fk.toTable)
    }
  }

  const lines: string[] = ['```mermaid', 'erDiagram']

  for (const t of tables) lines.push(renderEntity(t, false))
  for (const stubName of stubs) {
    const stubTable = byName.get(stubName)
    if (stubTable) lines.push(renderEntity(stubTable, true))
  }

  // Relationships: parent ||--o{ child : "fk_column"
  for (const t of tables) {
    for (const fk of t.foreignKeys) {
      lines.push(`  ${fk.toTable} ||--o{ ${t.name} : "${fk.fromColumn}"`)
    }
  }

  lines.push('```')

  // Outbound cross-domain note
  const outbound = new Set<string>()
  for (const t of tables) {
    for (const fk of t.foreignKeys) {
      if (!inDomain.has(fk.toTable)) {
        const otherDomain = domainOf.get(fk.toTable) ?? '(no domain)'
        outbound.add(`${t.name}.${fk.fromColumn} → ${fk.toTable} (${otherDomain})`)
      }
    }
  }
  if (outbound.size > 0) {
    lines.push('')
    lines.push('**Referencias a otros dominios:**')
    for (const ref of [...outbound].sort()) lines.push(`- ${ref}`)
  }

  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  if (!existsSync(VAULT_PATH)) {
    console.error(`✗ Vault not found at: ${VAULT_PATH}`)
    console.error(`  Either:`)
    console.error(`    - set OBSIDIAN_VAULT_PATH to the right location, or`)
    console.error(`    - create the vault directory first.`)
    console.error(`  Refusing to auto-create — that's not your script's call to make.`)
    process.exit(1)
  }

  const tables = collectTables()
  const byName = new Map(tables.map((t) => [t.name, t]))

  // Domain assignment + warnings
  const domainOf = new Map<string, string>()
  for (const [domain, tableNames] of Object.entries(DOMAIN_MAP)) {
    for (const name of tableNames) domainOf.set(name, domain)
  }

  const unassigned = tables.map((t) => t.name).filter((n) => !domainOf.has(n))
  if (unassigned.length > 0) {
    console.warn(
      `⚠ Tables not assigned to any domain (add to DOMAIN_MAP in scripts/generate-erd.ts):\n  - ${unassigned.join(
        '\n  - ',
      )}`,
    )
  }

  const phantom: string[] = []
  for (const tableNames of Object.values(DOMAIN_MAP)) {
    for (const name of tableNames) if (!byName.has(name)) phantom.push(name)
  }
  if (phantom.length > 0) {
    console.warn(
      `⚠ DOMAIN_MAP references tables that don't exist in the schema:\n  - ${phantom.join(
        '\n  - ',
      )}`,
    )
  }

  const hash = computeSchemaHash()
  const generatedAt = new Date().toISOString()

  const sections: string[] = []
  // YAML frontmatter (Obsidian reads this)
  sections.push('---')
  sections.push('title: Huellas de Paz — Schema ERD')
  sections.push('description: Auto-generated entity-relationship diagrams partitioned by domain.')
  sections.push(`generated: ${generatedAt}`)
  sections.push('generator: crm/scripts/generate-erd.ts')
  sections.push('---')
  sections.push(`<!-- schema-hash: ${hash} -->`)
  sections.push('<!-- DO NOT EDIT — regenerate with `npm run db:erd` from crm/ -->')
  sections.push('')
  sections.push('# Modelo de datos (ERD)')
  sections.push('')
  sections.push('Auto-generado desde `crm/src/db/schema/`. **No editar a mano** — los cambios se sobrescriben en la próxima regeneración.')
  sections.push('')
  sections.push('> [!info] Mantenimiento')
  sections.push('> - **Regenerar:** `cd crm && npm run db:erd`')
  sections.push('> - **Detector de drift:** `cd crm && npm run db:erd:check` (sale 1 si schema y ERD están desincronizados)')
  sections.push(`> - **Última generación:** ${generatedAt}`)
  sections.push(`> - **Tablas:** ${tables.length}`)
  sections.push('')
  sections.push('> [!warning] Sobre la partición de dominios')
  sections.push('> La división en dominios de abajo está bajo discusión. Ver [[wiki/decisions/2026-04-30-domain-partition]] para el detalle de la propuesta y las opciones consideradas.')
  sections.push('')
  sections.push(`Particionado en **${Object.keys(DOMAIN_MAP).length}** dominios. Las foreign keys que cruzan dominios se dibujan contra un stub de la tabla destino — la definición completa está en la sección del dominio correspondiente.`)
  sections.push('')
  sections.push('## Índice')
  sections.push('')
  for (const domain of Object.keys(DOMAIN_MAP)) {
    sections.push(`- [${DOMAIN_TITLES[domain]}](#${domain})`)
  }
  sections.push('')
  sections.push('---')
  sections.push('')

  for (const [domain, tableNames] of Object.entries(DOMAIN_MAP)) {
    const domainTables = tableNames
      .map((n) => byName.get(n))
      .filter((t): t is TableInfo => t !== undefined)

    sections.push(`## <a id="${domain}"></a>${DOMAIN_TITLES[domain]}`)
    sections.push('')
    sections.push(DOMAIN_DESCRIPTIONS[domain])
    sections.push('')
    sections.push(`Tablas: ${domainTables.map((t) => `\`${t.name}\``).join(', ')}.`)
    sections.push('')
    sections.push(renderDomainDiagram(domain, domainTables, byName, domainOf))
    sections.push('')
  }

  if (unassigned.length > 0) {
    sections.push('## ⚠ Tablas sin dominio asignado')
    sections.push('')
    sections.push('Estas tablas existen en el schema pero no están en `DOMAIN_MAP`:')
    sections.push('')
    for (const name of unassigned) sections.push(`- \`${name}\``)
    sections.push('')
  }

  const output = sections.join('\n') + '\n'

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
  writeFileSync(OUTPUT_PATH, output, 'utf8')

  console.log(`✓ Wrote ${OUTPUT_PATH}`)
  console.log(`  schema-hash: ${hash}`)
  console.log(`  tables: ${tables.length}, domains: ${Object.keys(DOMAIN_MAP).length}`)
  if (unassigned.length > 0) console.log(`  unassigned tables: ${unassigned.length} (see warning above)`)
}

main()
