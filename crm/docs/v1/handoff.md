# CRM — Handoff

## Estado general

| Fase | Estado |
|------|--------|
| Fase 0 — Landing + Cotizador | ✅ Deployado |
| Fase 1a — CRM Core | ✅ Implementado |
| Fase 1b — Comunicación, Reportes | ✅ Implementado |
| Fase 2 — Portal Cliente + Memorial | ✅ Implementado |
| Fase 3 — Portal B2B Convenios | ✅ Implementado |
| Seguridad — 2FA por email OTP | ✅ Implementado |

---

## Checklist de entrega técnica

### Infraestructura
- [x] Código en repositorio privado (`github.com/ffrankito/HuellasdePaz`)
- [x] Vercel deployado con dominio provisional
- [x] Variables de entorno configuradas en Vercel
- [x] Supabase en producción con schema completo (migraciones 0000–0015)
- [x] Supabase Storage con bucket `portal` (fotos memorial, novedades, inventario)
- [x] Vercel Cron activo (`/api/cron/leads` cada hora)
- [ ] Dominio propio configurado y apuntado a Vercel
- [ ] Dominio verificado en Resend (hoy sale desde `onboarding@resend.dev`)
- [ ] Mercado Pago webhook configurado (env vars `MP_*` pendientes)

### Contenido del sistema
- [x] Servicios cargados en `servicios_config` (4 servicios)
- [ ] Planes cargados en `planes_config` con nombres y precios reales del cliente
- [ ] Templates de mensajes WhatsApp/email revisados y aprobados
- [ ] Usuarios del equipo creados con sus roles
- [ ] Inventario con stock inicial cargado

### Contenido del cliente (pendiente)
- [ ] Número de WhatsApp real (hoy es placeholder `5493XXXXXXXXX`)
- [ ] Logo final de Huellas de Paz
- [ ] Fotos del lugar y mascotas (hoy hay fotos de stock)
- [ ] Testimonios de clientes
- [ ] Activar cotizador cuando el crematorio esté operativo (`index.astro` línea ~20)

---

## Qué puede hacer el equipo sin ayuda técnica

- Crear y gestionar clientes, mascotas, servicios, planes
- Gestionar leads en el kanban (asignar, avanzar, convertir)
- Editar templates de mensajes
- Modificar servicios config (precios, nombres)
- Modificar planes config (cuota, beneficios)
- Gestionar inventario (alta, baja, precios, stock)
- Administrar convenios B2B (estados, descuentos)
- Publicar novedades del cementerio (borrador, publicar, fijar)
- Administrar usuarios y roles
- Generar y descargar reportes
- Ver asistente IA (todos los roles)
- Activar/desactivar 2FA por usuario desde Mi cuenta

---

## Qué requiere intervención de Ravenna

- Nuevos módulos o funcionalidades
- Cambios estructurales en la base de datos
- Nuevas integraciones (Mercado Pago, WhatsApp Business API)
- Configuración de dominio en Resend
- Fase 4 — Chatbot IA

---

## Qué NO es responsabilidad de Ravenna

- Carga de datos y contenido
- Gestión del hosting y dominio (Vercel, Supabase)
- Cuenta de WhatsApp Business (para Fase 4)
- Cuenta de Mercado Pago
- Configuración del dominio de emails

---

## Período de garantía

15 días post-entrega por fase.
- **Error:** el sistema no hace lo que la spec dice → se corrige sin costo
- **Cambio de alcance:** algo nuevo no incluido en la spec → se cotiza aparte

---

## Archivos clave para referencia

| Archivo | Descripción |
|---------|-------------|
| `crm/src/db/schema/` | Schema de la base de datos (fuente de verdad) |
| `crm/src/lib/api-auth.ts` | Helper de autenticación y 2FA |
| `crm/src/lib/cors.ts` | CORS para endpoints públicos |
| `crm/scripts/migrate-0015.mjs` | Última migración aplicada (2FA) |
| `docs/proyecto/DOCS.md` | Documentación técnica completa |
| `crm/docs/diagramas-uml.md` | Diagramas UML del sistema |