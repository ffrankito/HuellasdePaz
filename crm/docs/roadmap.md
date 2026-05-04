# Huellas de Paz — Roadmap

## Estado actual (Mayo 2026)

Todas las fases 0–3 están implementadas y en producción.

---

## v1 — Sistema operativo (Fases 1a + 1b) ✅

### Módulos implementados

| Módulo | Descripción | Estado |
|--------|-------------|--------|
| M1 — Clientes | Dueños + mascotas, historial, origen | ✅ |
| M2 — Servicios | Cremación individual/comunitaria, entierro. 5 estados. 3 responsables. | ✅ |
| M3 — Planes | Cobertura escalonada 0%/50%/100%. Mascota adicional +50%. | ✅ |
| M4 — Agenda | Calendario operativo con vista por rol | ✅ |
| M5 — Roles | 7 roles: admin, manager, contadora, televenta, transporte, cremacion, entrega | ✅ |
| M6 — Inventario | Stock con alertas de bajo stock, foto, categorías | ✅ |
| M7 — Dashboard | KPIs en tiempo real | ✅ |
| M8 — Comunicación | WhatsApp link + email via Resend, templates editables | ✅ |
| M9 — Leads | Kanban, importación masiva Excel, cron de vencimiento | ✅ |
| M10 — Convenios | Estados, descuentos, servicios cubiertos, portal B2B | ✅ |
| M11 — Reportes | Métricas de negocio, rendimiento del equipo | ✅ |
| M12 — Novedades | Borrador/publicado/destacado visible en portal cliente | ✅ |
| M13 — Asistente IA | Claude Haiku interno con rate limit y cap de presupuesto | ✅ |
| M14 — 2FA OTP | Autenticación en dos factores por email (por usuario, opcional) | ✅ |

---

## v2 — Portales externos (Fases 2 + 3) ✅

### Fase 2 — Portal Cliente

| Feature | Descripción | Estado |
|---------|-------------|--------|
| P1 | Acceso por token en URL (sin login requerido) | ✅ |
| P2 | Tabs: Servicios · Planes · Memorial · Novedades | ✅ |
| P3 | Memorial editable: dedicatoria + galería de fotos | ✅ |
| P4 | Memorial público en /memorial/[mascotaId] | ✅ |
| P5 | Novedades del cementerio (publicadas y destacadas) | ✅ |
| P6 | Login opcional con Supabase Auth | ✅ |
| P7 | Logout desde el portal | ✅ |

**Pendiente:** Certificado de cremación PDF (PDFKit integrado, diseño final pendiente). Mercado Pago para pago de cuotas online.

### Fase 3 — Portal B2B Convenios

| Feature | Descripción | Estado |
|---------|-------------|--------|
| V1 | Portal por tokenPortal — sin login obligatorio | ✅ |
| V2 | Envío de leads desde el portal con datos del cliente | ✅ |
| V3 | Login con Supabase Auth (invitación por email) | ✅ |
| V4 | Servicios cubiertos configurables por convenio | ✅ |
| V5 | Historial de leads enviados por el convenio | ✅ |
| V6 | Logout desde el portal B2B | ✅ |

**Pendiente:** Notificación al socio cuando cambia el estado de su lead. Paginación en tabla de leads.

---

## v3 — Módulos opcionales (Fase 4) 📋

| Módulo | Descripción | Estimación |
|--------|-------------|------------|
| E1 — Chatbot IA | WhatsApp + Instagram con Claude — captura leads automáticamente | Desde USD 1.200 |
| E2 — Referidos | Sistema de referidos con tracking | Desde USD 800 |
| E3 — QR memorial | Placa física con QR → memorial digital | Desde USD 500 |
| E4 — Campañas | Envío masivo segmentado | Desde USD 1.000 |
| E5 — Mercado Pago | Pago online de cuotas y servicios (env vars ya presentes) | Desde USD 600 |

---

## Deuda técnica conocida

- `veterinarias` como alias de `convenios` — limpiar en v2 de schema
- `clientes.veterinariaId` apunta a `convenios.id` — nombre legacy
- Comunicación masiva en `/dashboard/comunicacion` — UI lista, funcionalidad de envío pendiente
- Emails salen desde `onboarding@resend.dev` — pendiente dominio propio en Resend