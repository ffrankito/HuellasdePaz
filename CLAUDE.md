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
| **Fase 0** | Landing + Cotizador | ✅ Live (cotizador oculto hasta apertura del crematorio) |
| **Fase 1a** | CRM Core (clientes, servicios, planes, leads) | ✅ Implementado |
| **Fase 1b** | Cobranzas, comunicación, reportes | ✅ Implementado (falta integración Mercado Pago) |
| **Fase 2** | Portal cliente + memorial digital | ✅ Implementado |
| **Fase 3** | Portal B2B convenios (veterinarias, petshops, clínicas) | ✅ Implementado |
| **Fase 4** | Chatbot AI (WhatsApp + Instagram) | 📋 Planificado (no antes de Fase 3) |

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
| `Hero.astro` | Hero con slideshow de fotos (10 slides, fade cada 5s) + huellas flotantes animadas |
| `Servicios.astro` | Sección de servicios |
| `Planes.astro` | Estructura lista, contenido pendiente del cliente |
| `Cotizador.astro` | CTA al cotizador — **actualmente comentado** en `index.astro` hasta apertura del crematorio |
| `Contacto.astro` | Formulario → envía leads al CRM (`POST /api/leads`) |
| `Ubicacion.astro` | Sección de ubicación |
| `Convenios.astro` | Sección de convenios B2B |
| `Memoriales.astro` | Sección de memoriales públicos |
| `Footer.astro` | Pie de página |

### Estado

- ✅ Estructura completa de la página
- ✅ Formulario de contacto integrado con CRM
- ✅ Slideshow del hero con fotos reales en `public/hero/` (hero-1.png a hero-4.png)
- ⏳ Logo final pendiente (placeholder activo)
- ⏳ Precios y nombres de planes pendientes del cliente
- ⏳ Número de WhatsApp real pendiente (hoy es `5493XXXXXXXXX`)
- ⏳ Testimonios de clientes pendientes

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
| `clientes` | Dueños de mascotas — incluye `token_portal` (UUID único de acceso al portal) y `auth_user_id` (Supabase Auth, opcional) |
| `mascotas` | Mascotas — incluye `galeria` (jsonb array de URLs), `dedicatoria`, `memoria_publica` (boolean), `fecha_nacimiento`, `fecha_fallecimiento` |
| `servicios` | Servicios de cremación/entierro con ciclo de vida de 9 estados |
| `planes` | Planes de previsión contratados |
| `planes_config` | Templates de planes configurables |
| `leads` | Prospectos del landing/cotizador/directo/veterinaria |
| `lead_interacciones` | Historial de interacciones con leads |
| `inventario` | Stock de urnas, bolsas, accesorios, insumos |
| `convenios` | Acuerdos B2B (veterinarias, petshops, refugios, clínicas) — antes llamada "veterinarias" |
| `templates_msg` | Templates de mensajes WhatsApp/email por evento |
| `comunicaciones` | Log de comunicaciones enviadas |
| `configuracion_general` | Settings del sistema (clave/valor en JSONB) |
| `noticias_cementerio` | Novedades del cementerio visibles en el portal — incluye `publicada` (boolean, default true) y `destacada` (boolean, default false) |

#### Estados de un servicio

```
pendiente → en_proceso → listo → entregado
                               ↘ cancelado
```

El servicio tiene campos de fecha separados: `fecha_retiro`, `fecha_cremacion`, `fecha_entrega` y tres responsables: `responsable_transporte_id`, `responsable_cremacion_id`, `responsable_entrega_id`.

#### Estados de un lead

```
nuevo → contactado → interesado → cotizado → convertido
                                           ↘ perdido
```

### Migraciones (Drizzle)

Archivo de config: `crm/drizzle.config.ts` — output en `crm/supabase/migrations/`.

- Migraciones 0000–0009: generadas por drizzle-kit, registradas en `meta/_journal.json`
- Migraciones 0010–0012: aplicadas manualmente con SQL directo (no en el journal):
  - `0010`: agrega `fecha_ultimo_pago` a `planes`
  - `0011`: agrega `galeria` (jsonb) a `mascotas`
  - `0012`: agrega `publicada` y `destacada` a `noticias_cementerio`

Para aplicar migraciones manuales usar `postgres.js` directamente (el proyecto no tiene `pg` instalado):
```js
import postgres from './node_modules/postgres/src/index.js'
const sql = postgres(process.env.DATABASE_URL_UNPOOLED)
```

**Importante:** no usar `drizzle-kit push` — detecta columnas eliminadas en otras tablas y pide confirmación destructiva.

### API Routes

**Leads**
- `POST /api/leads` — creación pública (desde cotizador/landing, con CORS)
- `GET /api/leads` — listado (acepta `?misLeads=true` para filtrar por agente logueado)
- `GET|PATCH|DELETE /api/leads/[id]`
- `POST /api/leads/[id]/email`
- `POST /api/leads/convertir` — convierte lead en cliente + crea mascota si viene `mascotaNombre`
- `POST /api/leads/importar` — importación masiva desde Excel (detecta duplicados por teléfono)

**Usuarios**
- `GET /api/me` — devuelve el usuario logueado (id, nombre, rol)
- `GET /api/agentes` — lista agentes disponibles para traspaso y filtros del kanban
- `PATCH /api/usuarios/[id]/permisos`

**Clientes / Mascotas / Servicios / Planes**
- CRUD estándar: `GET|POST /api/{recurso}`, `GET|PATCH|DELETE /api/{recurso}/[id]`

**Inventario**
- CRUD + `POST /api/storage/inventario` (upload de fotos)

**Convenios**
- `GET|POST /api/convenios`, `GET|PATCH /api/convenios/[id]`
- `POST /api/portal/convenio/invitar` — envía invitación al socio B2B (crea usuario Supabase Auth)
- `GET /api/portal/convenio/mi-token` — resuelve el token del convenio post-login

**Configuración**
- `PATCH /api/configuracion/general`
- `GET|POST /api/configuracion/planes`, `PATCH /api/configuracion/planes/[id]`
- `GET /api/configuracion/servicios` — lista ServicioConfig activos
- `GET|POST /api/configuracion/templates`

**Novedades (solo admin)**
- `GET /api/noticias` — listado ordenado por `destacada DESC, creado_en DESC`
- `POST /api/noticias` — crear con imagen opcional (multipart/form-data), acepta `publicada`
- `PATCH /api/noticias/[id]` — edición completa (multipart) o toggle de `publicada`/`destacada` (JSON)
- `DELETE /api/noticias/[id]`

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
- `/dashboard/mis-leads` (vista televenta — incluye modal de conversión con campos de mascota)

**Agenda**
- `/dashboard/agenda` — calendario de servicios (filtrado por rol)

**Comunicación**
- `/dashboard/comunicacion` — templates de mensajes y envío individual por cliente

**Inventario**
- `/dashboard/inventario`, `/dashboard/inventario/nuevo`, `/dashboard/inventario/[id]`

**Convenios B2B**
- `/dashboard/convenios`, `/dashboard/convenios/nueva`
- `/dashboard/convenios/[id]`, `/dashboard/convenios/editar`

**Novedades**
- `/dashboard/novedades` — gestión de novedades del cementerio con borrador/publicado y pin

**Reportes**
- `/dashboard/reportes`

**Manager (admin/manager)**
- `/dashboard/manager/agentes`, `/dashboard/manager/rendimiento`, `/dashboard/manager/reportes`
- `/dashboard/mi-rendimiento` (televenta)

**Configuración**
- `/dashboard/configuracion`
- `/dashboard/configuracion/importar-leads` — importación masiva desde Excel

### Variables de entorno requeridas (CRM)

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
DATABASE_URL_UNPOOLED
RESEND_API_KEY
RESEND_FROM_EMAIL          # pendiente — cuando tengan dominio configurado en Resend
MP_ACCESS_TOKEN            # pendiente — integración Mercado Pago no implementada aún
MP_PUBLIC_KEY              # pendiente
MP_WEBHOOK_SECRET          # pendiente
NEXT_PUBLIC_APP_URL
CORS_ALLOWED_ORIGINS       # URLs de producción separadas por coma (cotizador, landing)
ANTHROPIC_API_KEY_ASISTENTE
ASISTENTE_MODELO
ASISTENTE_MAX_TOKENS
ASISTENTE_RATE_LIMIT_POR_MINUTO
ASISTENTE_PRESUPUESTO_USD
```

---

## Portal cliente (`/portal/`) — Fase 2

### Autenticación del portal

El portal usa **dos mecanismos de auth independientes**:

1. **`tokenPortal`** (URL): UUID único en la tabla `clientes`. Quien tenga la URL `/portal/[token]` puede ver el portal. Es el mecanismo principal — no requiere login.
2. **Supabase Auth** (`esClienteLogueado`): login explícito con email/password. Se detecta en el servidor y se pasa como prop. Actualmente reservado para features futuras que requieran identidad verificada.

### Rutas del portal

| Ruta | Descripción |
| --- | --- |
| `/portal/login` | Login con email/password + recupero de contraseña |
| `/portal/activar` | Activación de cuenta (link desde email de invitación) |
| `/portal/[token]` | Home del portal — tabs: Servicios, Planes, Memorial, Novedades |

### Tabs del portal (`PortalTabs`)

- **Servicios**: listado de servicios del cliente con estado
- **Planes**: cuotas pagadas, estado del plan
- **Memorial**: bottom sheet por mascota — foto, fechas, dedicatoria, galería — editable con `EditarMemorialInline` (accesible con solo el token, no requiere login de Supabase)
- **Novedades**: noticias del cementerio — solo muestra las `publicada = true`, ordenadas por `destacada DESC, creado_en DESC`

### Estética del portal

Misma paleta que el CRM:
- Fondo general: `#f5f2ee`
- Header: `#f0faf5` con borde `#d1ead9`
- Cards y sheets: `white`
- Verde acento: `#2d8a54`
- Texto principal: `#111827`
- No usar fondos oscuros fuera de heroes fotográficos

---

## Memorial público (`/memorial/`) — Fase 2

Páginas públicas sin autenticación para mascotas con `memoria_publica = true`.

| Ruta | Descripción |
| --- | --- |
| `/memorial` | Grilla pública de todos los memoriales activos |
| `/memorial/[mascotaId]` | Memorial individual — foto hero, fechas, dedicatoria, galería |

- Estética oscura (`#08080f`) — único lugar del sistema con fondo negro
- `generateMetadata` para SEO por mascota
- Filtro: solo mascotas con `memoria_publica = true`

---

## Novedades del cementerio

Gestionadas en `/dashboard/novedades` (solo admin).

### Características
- **Borrador/Publicado**: `publicada = false` oculta la novedad del portal. Se puede crear en borrador desde el formulario con un toggle.
- **Fijar arriba**: `destacada = true` ordena la novedad primero. El card muestra borde dorado y badge "★ Destacada".
- **Optimistic UI**: todos los toggles actualizan el estado visual del card instantáneamente sin esperar al servidor (`NovedadCard` es un Client Component con estado local).
- **Imágenes**: upload a Supabase Storage bucket `portal`, path `novedades/`.

### Componentes
| Componente | Descripción |
| --- | --- |
| `NovedadCard` | Card completo como Client Component — maneja `publicada`/`destacada` en estado local |
| `NuevaNovedadForm` | Modal de creación con toggle "Publicar ahora / Guardar como borrador" |
| `EditarNovedadBtn` | Modal de edición (texto + imagen) |
| `EliminarNovedadBtn` | Botón con confirm dialog |

---

## Asistente IA (CRM interno)

Existe un asistente IA funcional **dentro del CRM**, independiente del chatbot público de Fase 4.

- **Chat:** `POST /api/asistente/chat` — responde preguntas sobre el negocio usando Claude Haiku
- **Auditoría:** `/dashboard/asistente` (solo admin) — logs de uso, tokens consumidos y costo acumulado
- **Rate limiting:** configurable por env vars (`ASISTENTE_RATE_LIMIT_POR_MINUTO`, `ASISTENTE_PRESUPUESTO_USD`)
- **Presupuesto máximo:** $10 USD/mes (cap configurable)

---

## Chatbot (`chatbot/`)

**Estado:** ❌ No implementado — Fase 4, bloqueado hasta completar Fases 0–3.

**Stack planificado:** Next.js 14 + Vercel AI SDK + Claude claude-sonnet-4-6 + Tailwind CSS 4

El directorio existe pero `src/` está vacío.

---

## Infraestructura y costos mensuales

| Servicio | Plan | Costo |
| --- | --- | --- |
| Vercel | Pro | $20/mes |
| Supabase | Pro | $25/mes |
| Resend | Free (3.000 emails/mes) | $0 |
| Anthropic (Claude Haiku) | Pay-per-use, cap $10 | ~$10/mes máx |
| **Total** | | **~$55/mes** |

---

## Fuera de scope (prohibiciones v1)

- Sin integración chatbot ↔ CRM en v1
- Sin WhatsApp Business API en v1 del CRM (usa Make/n8n)
- Sin facturación electrónica ARCA
- Sin integración directa con Jaque Mate (solo exportación)
- El chatbot es Fase 4 completa, no antes

---

## Pendiente para lanzamiento

### Contenido del cliente
- [ ] Nombres y precios de los 3 planes de previsión
- [ ] Precio de cremación individual, comunitaria y entierro
- [ ] Dirección física del crematorio
- [ ] Número de WhatsApp de contacto (hoy es placeholder `5493XXXXXXXXX`)
- [ ] Fotos reales del lugar y mascotas (hoy hay fotos de stock en la landing)
- [ ] Logo final de Huellas de Paz
- [ ] Testimonios de clientes

### Técnico
- [ ] Configurar dominio propio en Resend y actualizar `from:` en los 4 archivos de email (`lib/email/invitacion.tsx`, `lib/email/estadoServicio.ts`, `lib/email/enviarEmailLead.ts`, `app/api/portal/recuperar/route.ts`) — hoy salen desde `onboarding@resend.dev`
- [ ] Integración Mercado Pago (pagos online de servicios y cuotas de planes)
- [ ] Activar cotizador en la landing cuando el crematorio esté operativo (hoy está comentado en `landing/src/pages/index.astro`)
