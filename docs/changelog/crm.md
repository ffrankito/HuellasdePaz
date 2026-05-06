# CRM Changelog

Format: `## [milestone] — YYYY-MM-DD` with Linear milestone refs where applicable.

---

## [Fase 3 — Portal B2B] — 2025

- Portal B2B para convenios (veterinarias, petshops, refugios)
- Invitación de socios vía email (Supabase Auth)
- Gestión de convenios: `/dashboard/convenios`

## [Fase 2 — Portal Cliente] — 2025

- Portal cliente vía token UUID (`/portal/[token]`)
- Memorial digital por mascota: foto, galería, dedicatoria
- Memoriales públicos: `/memorial` y `/memorial/[mascotaId]`
- Novedades del cementerio con borrador/publicado y pin
- Login opcional con Supabase Auth

## [Fase 1b — CRM Extendido] — 2025

- Cobranzas y seguimiento de cuotas de planes
- Templates de mensajes WhatsApp/email
- Reportes de negocio y financieros (PDF + Excel)
- Asistente IA interno (Claude Haiku)
- Cron de automatización de leads (Vercel)

## [Fase 1a — CRM Core] — 2025

- Autenticación con Supabase SSR
- Clientes, mascotas, servicios, planes
- Kanban de leads con búsqueda y filtros por origen/prioridad
- Agenda de servicios por rol
- Inventario con fotos
- Gestión de convenios B2B
- Importación masiva de leads desde Excel
- Dashboard con KPIs
