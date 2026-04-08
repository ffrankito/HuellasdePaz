# Huellas de Paz — CRM

Sistema operativo interno. Gestiona clientes, mascotas, servicios, planes, agenda, cobranzas, inventario y comunicación automatizada.

## Stack

| Capa | Tool |
| --- | --- |
| Framework | Next.js 16 App Router + TypeScript |
| Styling | Tailwind CSS 4 + shadcn/ui |
| ORM | Drizzle ORM |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase SSR |
| Email | Resend + Vercel Cron |
| Pagos | Mercado Pago SDK |
| Hosting | Vercel |

## Setup local

```bash
npm install
cp .env.example .env.local   # completar con credenciales de Supabase
npm run db:migrate
npm run dev                   # http://localhost:3000
```

## Roles

| Rol | Acceso |
| --- | --- |
| admin | Todo |
| televenta | Clientes, leads, planes, comunicación |
| transporte | Agenda (sus retiros y entregas) |
| cremacion | Agenda (su carga del día), trazabilidad |
| entrega | Agenda (entregas), inventario |

## Docs

| Archivo | Contenido |
| --- | --- |
| docs/roadmap.md | Roadmap v1/v2/v3 completo |
| docs/v1/charter.md | Scope y criterios de éxito |
| docs/v1/technical-spec.md | Schema, API routes, integraciones |
| docs/v1/development-plan.md | Plan semana a semana |
| docs/v1/handoff.md | Checklist de entrega |
| docs/v2/charter.md | Portal cliente + B2B veterinarias |
