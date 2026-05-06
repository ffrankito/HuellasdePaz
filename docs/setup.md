# Setup Guide

## Prerequisites

- Node.js 20+
- pnpm
- Supabase CLI (for migrations)

## Apps

This is a monorepo with 4 independent apps. Each has its own `package.json` and runs separately.

| App | Port | Command |
|---|---|---|
| `crm/` | 3000 | `pnpm dev` |
| `landing/` | 4321 | `pnpm dev` |
| `cotizador/` | 5173 | `pnpm dev` |
| `chatbot/` | 3001 | `pnpm dev` |

## CRM Setup

```bash
cd crm
cp .env.example .env.local   # fill in values below
pnpm install
pnpm dev
```

### Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `DATABASE_URL` | Supabase pooled connection string |
| `DATABASE_URL_UNPOOLED` | Supabase direct connection (for migrations) |
| `RESEND_API_KEY` | Resend API key for transactional email |
| `RESEND_FROM_EMAIL` | Verified sender email (pending domain setup) |
| `NEXT_PUBLIC_APP_URL` | Full URL of the CRM (e.g. `https://crm.huellasde-paz.com`) |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of origins (cotizador, landing) |
| `ANTHROPIC_API_KEY_ASISTENTE` | Claude API key for internal AI assistant |
| `ASISTENTE_MODELO` | Claude model to use |
| `ASISTENTE_MAX_TOKENS` | Max tokens per request |
| `ASISTENTE_RATE_LIMIT_POR_MINUTO` | Rate limit for assistant |
| `ASISTENTE_PRESUPUESTO_USD` | Monthly budget cap in USD |
| `MP_ACCESS_TOKEN` | Mercado Pago access token (pending) |
| `MP_PUBLIC_KEY` | Mercado Pago public key (pending) |
| `MP_WEBHOOK_SECRET` | Mercado Pago webhook secret (pending) |

### Running Migrations

Drizzle is used for schema management. Migrations live in `crm/supabase/migrations/`.

**Do not use `drizzle-kit push`** — it detects deleted columns in other tables and prompts for destructive confirmation.

For manual migrations (0010+), use `postgres.js` directly:

```js
import postgres from './node_modules/postgres/src/index.js'
const sql = postgres(process.env.DATABASE_URL_UNPOOLED)
await sql`ALTER TABLE ...`
await sql.end()
```

Generated migrations (0000–0009) are tracked in `meta/_journal.json`.
Manual migrations (0010+) are applied directly via SQL and not tracked in the journal.

## Landing Setup

```bash
cd landing
cp .env.example .env        # set VITE_CRM_URL
pnpm install
pnpm dev
```

The landing posts leads to `POST /api/leads` on the CRM. Set `VITE_CRM_URL` to the CRM's base URL.

## Cotizador Setup

```bash
cd cotizador
pnpm install
pnpm dev
```

The cotizador is an embeddable iframe for Wix. It posts leads to `https://huellasde-paz.vercel.app/api/leads`.
