# Huellas de Paz — Instrucciones para Claude

## Contexto de negocio

Huellas de Paz es el primer crematorio de mascotas con habilitación formal en Rosario, Santa Fe, Argentina. Lleva más de 20 años en el rubro.

Desarrollado por **Ravenna** (Tomás Pinolini + Franco Zancocchia).

### El negocio

- Crematorio y cementerio parque de mascotas en Rosario
- Servicios: cremación individual, cremación comunitaria, entierro en parcela/nicho
- Planes de previsión: tres planes con cuotas mensuales y cobertura diferida
  - Cobertura: 0% meses 1-6, 50% meses 7-12, 100% desde mes 13
  - Mascota adicional: +50% sobre la cuota base
- Canal principal: WhatsApp
- Integración contable: Jaque Mate (exportación, no tiempo real)
- Pagos: Mercado Pago

### Roles en el sistema

| Rol | Acceso |
| --- | --- |
| `admin` | Todo el sistema |
| `manager` | Reportes, equipo, rendimiento |
| `contadora` | Reportes financieros, cobranzas |
| `televenta` | Leads, clientes, planes |
| `transporte` | Agenda, servicios asignados |
| `cremacion` | Servicios en cremación |
| `entrega` | Servicios listos para entregar |

### Fases del proyecto

| Fase | Descripción | Estado |
| --- | --- | --- |
| **Fase 0** | Landing + Cotizador | ✅ Live |
| **Fase 1a** | CRM Core (clientes, servicios, planes, leads) | ✅ Implementado |
| **Fase 1b** | Cobranzas, comunicación masiva, reportes | 🔄 En progreso |
| **Fase 2** | Portal cliente + memorial digital | 🔄 Parcialmente implementado |
| **Fase 3** | Portal B2B veterinarias | 📋 Planificado |
| **Fase 4** | Chatbot AI | 📋 Planificado (no antes de Fase 3) |

---

## Política de lenguaje

Todo texto visible al usuario en español rioplatense argentino.
Código, comentarios y documentación técnica en inglés.

---

## Stack de referencia

| Capa | Tool | Scope |
| --- | --- | --- |
| Landing | Astro 6 + TypeScript | `landing/` |
| Cotizador | React 18 + Vite | `cotizador/` |
| CRM | Next.js 15 App Router + TypeScript | `crm/` |
| Chatbot | Next.js 14 + Vercel AI SDK | `chatbot/` (vacío, Fase 4) |
| Styling | Tailwind CSS 4 | Todas |
| ORM | Drizzle ORM | `crm/` |
| Database | Supabase (PostgreSQL) | `crm/` |
| Auth | Supabase SSR | `crm/` |
| Email | Resend + Vercel Cron | `crm/` |
| Pagos | Mercado Pago SDK | `crm/` |
| AI | Vercel AI SDK + Claude claude-sonnet-4-6 | `chatbot/` |
| UI Components | shadcn/ui | `crm/` |
| Hosting | Vercel | Todas |
| Fonts | Playfair Display + DM Sans | `landing/` |
| Icons | Lucide React | Todas |
| PDF | PDFKit | `crm/` |
| Excel | XLSX | `crm/` |
| Drag & Drop | @hello-pangea/dnd | `crm/` |
| Forms | React Hook Form + Zod | `crm/` |
| Dates | date-fns | `crm/` |

---

## Landing (`landing/`)

**Stack:** Astro 6 + TypeScript + Tailwind CSS 4

### Componentes implementados

| Componente | Descripción |
| --- | --- |
| `Navbar.astro` | Navegación con links de ancla, botón WhatsApp (número placeholder) |
| `Hero.astro` | Hero con patas animadas |
| `Servicios.astro` | Sección de servicios |
| `Planes.astro` | Estructura lista, contenido pendiente del cliente |
| `Cotizador.astro` | CTA al cotizador |
| `Contacto.astro` | Formulario → envía leads al CRM (`POST /api/leads`) |
| `CTA.astro` | Call to action general |
| `Footer.astro` | Pie de página |

### Estado

- ✅ Estructura completa de la página
- ✅ Formulario de contacto integrado con CRM
- ⏳ Logo final pendiente (imágenes de placeholder activas)
- ⏳ Precios y nombres de planes pendientes del cliente
- ⏳ Fotos reales del lugar y testimonios pendientes

---

## Cotizador (`cotizador/`)

**Stack:** React 18 + Vite + Tailwind CSS 4

Cotizador embebible como iframe en Wix. Envía leads al CRM.

### Flujo de pasos (7-8 pasos)

1. Tipo de mascota
2. Tamaño/peso (si aplica)
3. Servicio (Huellitas, Compañeros, Siempre Juntos, Jardín del Recuerdo)
4. Método de retiro (domicilio / crematorio)
5. Entrega de cenizas (inmediata / diferida)
6. Zona de entrega (si eligió domicilio)
7. Datos de contacto (mascota, dueño, teléfono, email)
8. Confirmación / éxito

### Servicios y precios actuales (ARS)

| Servicio | Precio | Descripción |
| --- | --- | --- |
| Plan Huellitas | $90,000 | Cremación comunitaria, sin devolución de cenizas |
| Plan Compañeros | $120,000 | Cremación individual, entrega diferida |
| Plan Siempre Juntos | $140,000 | Cremación individual presencial |
| Jardín del Recuerdo | $110,000 | Entierro en cementerio parque |

### Integración

- `POST https://huellasde-paz.vercel.app/api/leads` (origen: `cotizador`)
- CORS habilitado para dominio del cotizador + localhost

---

## CRM (`crm/`)

**Stack:** Next.js 15 App Router + TypeScript + Drizzle ORM + Supabase + shadcn/ui + Tailwind CSS 4

### Base de datos (Supabase PostgreSQL)

#### Tablas principales

| Tabla | Descripción |
| --- | --- |
| `usuarios` | Equipo interno (rol, permisos) |
| `clientes` | Dueños de mascotas |
| `mascotas` | Mascotas de los clientes |
| `servicios` | Servicios de cremación/entierro con ciclo de vida de 9 estados |
| `planes` | Planes de previsión contratados |
| `planes_config` | Templates de planes configurables |
| `leads` | Prospectos del landing/cotizador/directo/veterinaria |
| `lead_interacciones` | Historial de interacciones con leads |
| `inventario` | Stock de urnas, bolsas, accesorios, insumos |
| `convenios` | Acuerdos B2B (veterinarias, petshops, refugios, clínicas) |
| `templates_msg` | Templates de mensajes WhatsApp/email por evento |
| `comunicaciones` | Log de comunicaciones enviadas |
| `configuracion_general` | Settings del sistema (clave/valor en JSONB) |

#### Estados de un servicio

```
ingresado → retiro_pendiente → en_transporte → recibido → en_cremacion → cremado → listo_entrega → entregado
                                                                                                  ↘ cancelado
```

#### Estados de un lead

```
nuevo → contactado → interesado → cotizado → convertido
                                           ↘ perdido
```

### Migraciones (Drizzle)

10 migraciones (0000–0009). La última (0009) renombró "veterinarias" a "convenios" y agregó el enum `tipo`.

### API Routes

**Leads**
- `POST /api/leads` — creación pública (desde cotizador/landing, con CORS)
- `GET /api/leads` — listado
- `GET|PATCH|DELETE /api/leads/[id]`
- `POST /api/leads/[id]/email`
- `POST /api/leads/convertir` — convierte lead en cliente

**Clientes / Mascotas / Servicios / Planes**
- CRUD estándar: `GET|POST /api/{recurso}`, `GET|PATCH|DELETE /api/{recurso}/[id]`

**Inventario**
- CRUD + `POST /api/storage/inventario` (upload de fotos)

**Convenios**
- `GET|POST /api/convenios`, `GET|PATCH /api/convenios/[id]`

**Configuración**
- `PATCH /api/configuracion/general`
- `GET|POST /api/configuracion/planes`, `PATCH /api/configuracion/planes/[id]`
- `GET|POST /api/configuracion/templates`

**Reportes**
- `GET /api/reportes/negocio` — métricas de negocio
- `GET /api/reportes/pdf` — generación de PDF con PDFKit
- `GET /api/manager/reportes` — reportes del equipo

**Otros**
- `PATCH /api/comunicaciones/[id]`
- `GET /api/cron/leads` — Vercel cron para automatización de leads
- `POST /api/portal/invitar` — envío de invitación al portal cliente
- `PATCH /api/usuarios/[id]/permisos`

### Páginas y rutas del CRM

**Autenticación**
- `/auth/login`

**Dashboard principal**
- `/dashboard` — KPIs (clientes, servicios, leads, cremaciones activas, stock bajo)

**Clientes**
- `/dashboard/clientes`, `/dashboard/clientes/nuevo`, `/dashboard/clientes/[id]`
- `/dashboard/clientes/[id]/mascotas/nueva`

**Servicios**
- `/dashboard/servicios`, `/dashboard/servicios/nuevo`

**Planes**
- `/dashboard/planes`, `/dashboard/planes/nuevo`
- `/dashboard/planes/[id]`, `/dashboard/planes/[id]/editar`

**Leads**
- `/dashboard/leads`, `/dashboard/leads/nuevo`, `/dashboard/leads/[id]`
- `/dashboard/mis-leads` (vista televenta)

**Agenda**
- `/dashboard/agenda` — calendario de servicios (filtrado por rol)

**Comunicación**
- `/dashboard/comunicacion` — templates de mensajes y envío masivo

**Inventario**
- `/dashboard/inventario`, `/dashboard/inventario/nuevo`, `/dashboard/inventario/[id]`

**Convenios B2B**
- `/dashboard/convenios`, `/dashboard/convenios/nueva`
- `/dashboard/convenios/[id]`, `/dashboard/convenios/editar`

**Reportes**
- `/dashboard/reportes`

**Manager (admin/manager)**
- `/dashboard/manager/agentes`, `/dashboard/manager/rendimiento`, `/dashboard/manager/reportes`
- `/dashboard/mi-rendimiento` (televenta)

**Configuración**
- `/dashboard/configuracion`
- `/dashboard/configuracion/importar-leads` — importación masiva desde Excel

**Portal cliente (Fase 2, parcialmente implementado)**
- `/portal/login`, `/portal/activar`
- `/portal/[token]` — home del portal
- `/portal/[token]/memorial/[mascotaId]` — memorial digital
- `/portal/[token]/memorial/[mascotaId]/editar` — editar dedicatoria y fotos

### Variables de entorno requeridas (CRM)

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
RESEND_API_KEY
MP_ACCESS_TOKEN
MP_PUBLIC_KEY
MP_WEBHOOK_SECRET
NEXT_PUBLIC_APP_URL
```

---

## Chatbot (`chatbot/`)

**Estado:** ❌ No implementado — Fase 4, bloqueado hasta completar Fases 0–3.

**Stack planificado:** Next.js 14 + Vercel AI SDK + Claude claude-sonnet-4-6 + Tailwind CSS 4

El directorio existe pero `src/` está vacío.

---

## Fuera de scope (prohibiciones v1)

- Sin integración chatbot ↔ CRM en v1
- Sin WhatsApp Business API en v1 del CRM (usa Make/n8n)
- Sin facturación electrónica ARCA
- Sin integración directa con Jaque Mate (solo exportación)
- El chatbot es Fase 4 completa, no antes

---

## Contenido pendiente del cliente

- [ ] Nombres y precios de los 3 planes de previsión
- [ ] Precio de cremación individual, comunitaria y entierro
- [ ] Dirección física del crematorio
- [ ] Número de WhatsApp de contacto
- [ ] Fotos del lugar y mascotas
- [ ] Logo final de Huellas de Paz
- [ ] Testimonios de clientes
