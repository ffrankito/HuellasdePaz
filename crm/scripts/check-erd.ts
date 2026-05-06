/**
 * Drift detector for the auto-generated ERD living in the Obsidian vault.
 *
 * Computes the same schema hash as `generate-erd.ts` and compares it to the
 * `<!-- schema-hash: ... -->` stamp at the top of `wiki/architecture/erd.md`
 * inside the vault.
 *
 * Vault location:
 *   - `OBSIDIAN_VAULT_PATH` env var, OR
 *   - default `~/ObsidianVaults/huellas-de-paz`
 *
 * Exit codes:
 *   0 — hashes match, OR the vault / erd.md doesn't exist (graceful skip so a
 *       fresh clone or a CI environment without the vault target doesn't false-fail).
 *   1 — hashes don't match. The schema was edited but the ERD wasn't regenerated.
 *       Run `npm run db:erd` and commit the regenerated file.
 */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const SCHEMA_DIR = resolve(__dirname, '../src/db/schema')

const VAULT_PATH =
  process.env.OBSIDIAN_VAULT_PATH ?? join(homedir(), 'ObsidianVaults', 'huellas-de-paz')
const ERD_PATH = join(VAULT_PATH, 'wiki', 'architecture', 'erd.md')

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

function extractStampedHash(filePath: string): string | null {
  const content = readFileSync(filePath, 'utf8')
  const match = content.match(/<!--\s*schema-hash:\s*([0-9a-f]{64})\s*-->/)
  return match?.[1] ?? null
}

function main() {
  if (!existsSync(VAULT_PATH)) {
    console.log(`ℹ Vault not found at ${VAULT_PATH} — skipping drift check.`)
    console.log(`  Set OBSIDIAN_VAULT_PATH or create the vault to enable this check.`)
    process.exit(0)
  }

  if (!existsSync(ERD_PATH)) {
    console.log(`ℹ ${ERD_PATH} does not exist — skipping drift check.`)
    console.log(`  Run \`npm run db:erd\` to generate it.`)
    process.exit(0)
  }

  const expected = computeSchemaHash()
  const actual = extractStampedHash(ERD_PATH)

  if (actual === null) {
    console.error(`✗ ${ERD_PATH} exists but has no \`<!-- schema-hash: ... -->\` stamp.`)
    console.error(`  Regenerate with \`npm run db:erd\`.`)
    process.exit(1)
  }

  if (actual !== expected) {
    console.error(`✗ ERD is out of date.`)
    console.error(`  Expected schema-hash: ${expected}`)
    console.error(`  Found in erd.md:      ${actual}`)
    console.error(`  Regenerate with \`npm run db:erd\` and commit the result.`)
    process.exit(1)
  }

  console.log(`✓ ERD is up to date (schema-hash: ${expected.slice(0, 12)}…).`)
}

main()
