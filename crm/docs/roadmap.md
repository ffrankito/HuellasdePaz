# Huellas de Paz — Roadmap

## Estado actual (Mayo 2026)

Todas las fases 0–3 están implementadas y en producción. Hay 24 issues abiertos — ver checklist de entrega más abajo.

---

## Fase 0 — Landing + Cotizador ✅

### Landing

| Item | Estado |
|------|--------|
| Estructura completa de la página | ✅ |
| Formulario de contacto integrado con CRM | ✅ |
| Slideshow hero con fotos reales | ✅ |
| Reemplazar número WhatsApp placeholder | 🔴 [HDP-8](https://linear.app/ravennarosario/issue/HDP-8) — bloqueado cliente |
| Activar cotizador cuando abra el crematorio | 🟠 [HDP-9](https://linear.app/ravennarosario/issue/HDP-9) — bloqueado cliente |
| Dirección real en el footer | 🔵 [HDP-21](https://linear.app/ravennarosario/issue/HDP-21) |

### Cotizador

| Item | Estado |
|------|--------|
| Flujo completo 7-8 pasos + envío de leads | ✅ |
| Reemplazar número WhatsApp y teléfono placeholder | 🔴 [HDP-19](https://linear.app/ravennarosario/issue/HDP-19) — bloqueado cliente |
| Corregir URL del header (apunta a dominio de preview) | 🟠 [HDP-20](https://linear.app/ravennarosario/issue/HDP-20) |

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
| M8 — Comunicación | WhatsApp link + templates editables. Email individual y masivo pendiente ([HDP-10](https://linear.app/ravennarosario/issue/HDP-10), [HDP-24](https://linear.app/ravennarosario/issue/HDP-24)) | ⚠️ |
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

**Pendiente:** Certificado de cremación PDF — diseño final pendiente con Lucía ([HDP-18](https://linear.app/ravennarosario/issue/HDP-18)). Mercado Pago para pago de cuotas online ([HDP-7](https://linear.app/ravennarosario/issue/HDP-7)).

### Fase 3 — Portal B2B Convenios

| Feature | Descripción | Estado |
|---------|-------------|--------|
| V1 | Portal por tokenPortal — sin login obligatorio | ✅ |
| V2 | Envío de leads desde el portal con datos del cliente | ✅ |
| V3 | Login con Supabase Auth (invitación por email) | ✅ |
| V4 | Servicios cubiertos configurables por convenio | ✅ |
| V5 | Historial de leads enviados por el convenio | ✅ |
| V6 | Logout desde el portal B2B | ✅ |

**Pendiente:** Notificación al socio cuando cambia el estado de su lead ([HDP-15](https://linear.app/ravennarosario/issue/HDP-15)). Paginación en tabla de leads ([HDP-14](https://linear.app/ravennarosario/issue/HDP-14)).

### Features post-lanzamiento

| Feature | Descripción | Estado |
|---------|-------------|--------|
| C1 | Plan Plus — cargo adicional perros >25kg | 📋 [HDP-2](https://linear.app/ravennarosario/issue/HDP-2) |
| C2 | Exportación mensual para Jaque Mate (.xlsx) | 📋 [HDP-4](https://linear.app/ravennarosario/issue/HDP-4) |
| C3 | Prioridad alta para leads B2B en cola de agentes | 📋 [HDP-3](https://linear.app/ravennarosario/issue/HDP-3) |
| C4 | Motivo obligatorio al reasignar lead entre agentes | 📋 [HDP-6](https://linear.app/ravennarosario/issue/HDP-6) |

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

## Checklist de entrega (pre-handoff)

Estos ítems deben estar resueltos antes de entregar el sistema al cliente. Algunos son bugs en producción hoy.

| # | Item | Issue | Bloqueado por |
|---|------|-------|---------------|
| 🔴 | Verificar que `/api/convenios/postulacion` existe y funciona (formulario B2B landing) | [HDP-22](https://linear.app/ravennarosario/issue/HDP-22) | Dev |
| 🔴 | Corregir URL hardcodeada en recupero de contraseña del portal | [HDP-16](https://linear.app/ravennarosario/issue/HDP-16) | Dev |
| 🔴 | Ocultar asistente IA del CRM hasta decisión del cliente | [HDP-13](https://linear.app/ravennarosario/issue/HDP-13) | Dev |
| 🔴 | Verificar CORS bloqueado a dominios de producción | [HDP-12](https://linear.app/ravennarosario/issue/HDP-12) | Dev |
| 🔴 | Campos obligatorios en alta de clientes: DNI, domicilio, mascota | [HDP-5](https://linear.app/ravennarosario/issue/HDP-5) | Dev |
| 🔴 | Agregar loading/error boundaries en `/portal` y `/memorial` | [HDP-11](https://linear.app/ravennarosario/issue/HDP-11) | Dev |
| 🔴 | Escribir runbooks operativos (deploy, reset password, backup) | [HDP-17](https://linear.app/ravennarosario/issue/HDP-17) | Dev |
| 🟠 | Reemplazar número WhatsApp placeholder (landing) | [HDP-8](https://linear.app/ravennarosario/issue/HDP-8) | Cliente |
| 🟠 | Reemplazar número WhatsApp placeholder (cotizador) | [HDP-19](https://linear.app/ravennarosario/issue/HDP-19) | Cliente |
| 🟠 | Configurar dominio propio en Resend | [HDP-1](https://linear.app/ravennarosario/issue/HDP-1) | Cliente |
| 🟠 | Dirección real en footer de la landing | [HDP-21](https://linear.app/ravennarosario/issue/HDP-21) | Cliente |

---

## Deuda técnica conocida

- `veterinarias` como alias de `convenios` — limpiar schema y columna `clientes.veterinaria_id` ([HDP-23](https://linear.app/ravennarosario/issue/HDP-23))
- Comunicación masiva en `/dashboard/comunicacion` — UI lista, funcionalidad de envío pendiente ([HDP-24](https://linear.app/ravennarosario/issue/HDP-24))
- Emails salen desde `onboarding@resend.dev` — pendiente dominio propio en Resend ([HDP-1](https://linear.app/ravennarosario/issue/HDP-1))
