# CRM — Especificación técnica (estado actual)

> Documento actualizado al estado real del sistema implementado (Mayo 2026).

## Stack

| Capa | Tool | Versión |
|------|------|---------|
| Framework | Next.js App Router + TypeScript | 15.x |
| Styling | Tailwind CSS 4 + shadcn/ui + inline styles | 4.x |
| ORM | Drizzle ORM | latest |
| Database | Supabase (PostgreSQL) | — |
| Auth | Supabase SSR + 2FA email OTP | — |
| Email | Resend | — |
| Pagos | Mercado Pago SDK | pendiente |
| Hosting | Vercel | Pro |
| PDF | PDFKit | — |
| Excel | XLSX | — |
| Drag & Drop | @hello-pangea/dnd | — |
| Forms | React Hook Form + Zod | — |
| Dates | date-fns | — |
| AI | Vercel AI SDK + Claude Haiku | — |

---

## Autenticación

### CRM interno

1. **Supabase SSR** (`@supabase/ssr`) — sesión por cookie httpOnly
2. **2FA por email OTP** (opcional por usuario):
   - Código 6 dígitos, hash SHA-256(codigo+userId) en DB
   - Expiración: 10 minutos, máximo 3 intentos
   - Sesión MFA: cookie `mfa_s={userId}:{token}` — duración 8 horas
   - `requireAuth()` en `crm/src/lib/api-auth.ts` valida ambas capas

### Portal cliente
- `tokenPortal` (UUID en URL) — mecanismo principal, sin login
- Supabase Auth (email/password) — opcional, para features que requieran identidad

### Portal B2B convenios
- `tokenPortal` (UUID en URL) — acceso sin login
- Supabase Auth (email/password) — via invitación por email (`/api/portal/convenio/invitar`)

---

## Schema de base de datos

Ver `docs/proyecto/DOCS.md` sección "Base de datos" para la referencia completa y actualizada de todas las tablas.

### Enumeraciones del sistema

| Enum | Valores |
|------|---------|
| `rol` | admin · manager · contadora · televenta · transporte · cremacion · entrega |
| `estado_lead` | nuevo · contactado · interesado · cotizado · convertido · perdido |
| `estado_servicio` | pendiente · en_proceso · listo · entregado · cancelado |
| `tipo_servicio` | cremacion_individual · cremacion_comunitaria · entierro |
| `estado_plan` | activo · pausado · cancelado · utilizado · atrasado |
| `estado_convenio` | sin_convenio · en_negociacion · activo · pausado |
| `tipo_convenio` | veterinaria · petshop · refugio · clinica · otro |
| `categoria_inventario` | urna · bolsa · caja · accesorio · insumo · otro |

### Permisos adicionales (sobre el rol)

```typescript
const PERMISOS = [
  'gestion_equipo',  // ver agentes, rendimiento, reportes del equipo
  'ver_reportes',    // acceso a reportes generales
  'configuracion',   // acceso a /dashboard/configuracion
  'cobranzas',       // módulo de cobranzas (futuro)
] as const
```

---

## Convenciones del proyecto

### API routes

```typescript
// Todas las rutas protegidas usan requireAuth()
const auth = await requireAuth(['admin', 'manager'])
if (!auth.ok) return auth.response

// Rutas OTP: skipMfa para evitar chicken-and-egg
const auth = await requireAuth(undefined, { skipMfa: true })

// Rutas públicas con CORS (cotizador, landing)
const corsHeaders = getCorsHeaders(request.headers.get('origin'))
```

### Migraciones

No usar `drizzle-kit push` en producción. Para migraciones post-0009, usar scripts `.mjs` con `postgres.js`:

```js
import postgres from './node_modules/postgres/src/index.js'
const sql = postgres(process.env.DATABASE_URL_UNPOOLED)
await sql`ALTER TABLE usuarios ADD COLUMN ...`
await sql.end()
```

Los scripts van en `crm/scripts/migrate-XXXX.mjs`. No usan dotenv — leen `.env.local` manualmente con regex.

### Cron jobs (Vercel)

Configurados en `crm/vercel.json`:
- `/api/cron/leads` — cada hora — vencimiento de leads
- `/api/cron/planes` — diariamente — detección de planes atrasados

### Email (Resend)

Archivos de email en `crm/src/lib/email/`. Actualmente salen desde `onboarding@resend.dev` — pendiente configurar dominio propio.

### Storage (Supabase)

Bucket `portal` (público):
- `novedades/` — imágenes de noticias del cementerio
- `inventario/` — fotos de items de inventario
- `mascotas/` — fotos del memorial