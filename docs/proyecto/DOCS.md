# Huellas de Paz — Documentación técnica

## Índice

1. [Visión general](#visión-general)
2. [Arquitectura del sistema](#arquitectura-del-sistema)
3. [Proyectos](#proyectos)
4. [Base de datos](#base-de-datos)
5. [API Routes](#api-routes)
6. [Páginas del CRM](#páginas-del-crm)
7. [Componentes relevantes](#componentes-relevantes)
8. [Flujos principales](#flujos-principales)
9. [Pendientes](#pendientes)
10. [Reglas de desarrollo](#reglas-de-desarrollo)

---

## Visión general

Huellas de Paz es el primer crematorio de mascotas con habilitación formal en Rosario, Argentina. El sistema está compuesto por tres proyectos públicos y un CRM interno, todos deployados en Vercel y conectados a una base de datos Supabase.

**Desarrollado por Ravenna** — Tomás Pinolini + Franco Zancocchia

### Fases del proyecto

| Fase | Descripción | Estado |
|------|-------------|--------|
| Fase 0 | Landing + Cotizador | ✅ Live |
| Fase 1a | CRM Core (clientes, servicios, planes, leads) | ✅ Implementado |
| Fase 1b | Cobranzas, comunicación, reportes | ✅ Implementado (falta MP) |
| Fase 2 | Portal cliente + memorial digital | ✅ Implementado |
| Fase 3 | Portal B2B convenios (veterinarias, petshops) | ✅ Implementado |
| Fase 4 | Chatbot AI (WhatsApp + Instagram) | 📋 Planificado |

---

## Arquitectura del sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        INTERNET                             │
└──────────┬──────────────┬───────────────┬───────────────────┘
           │              │               │
    ┌──────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
    │   LANDING   │ │ COTIZADOR  │ │    CRM     │
    │  Astro 6    │ │ React+Vite │ │ Next.js 15 │
    │  Vercel     │ │  Vercel    │ │  Vercel    │
    └──────┬──────┘ └─────┬──────┘ └─────┬──────┘
           │              │               │
           └──────────────┴───────────────┘
                          │
                   ┌──────▼──────┐
                   │  SUPABASE   │
                   │ PostgreSQL  │
                   │    Auth     │
                   │   Storage   │
                   └─────────────┘
```

### URLs de producción

| Proyecto | URL |
|----------|-----|
| CRM | https://huellasde-paz.vercel.app |
| Landing | https://huellasde-paz-pl2f.vercel.app |
| Cotizador | https://huellasde-paz-cotizador.vercel.app |

### Repositorio

```
github.com/ffrankito/HuellasdePaz (privado)

HuellasDePaz/
├── crm/          → CRM interno (Next.js 15)
├── landing/      → Landing page pública (Astro 6)
├── cotizador/    → Cotizador online (React + Vite)
├── chatbot/      → Chatbot IA (vacío — Fase 4)
├── docs/         → Documentación técnica
└── CLAUDE.md     → Instrucciones para IA
```

---

## Proyectos

### 1. CRM (`crm/`)

Sistema de gestión interno para el equipo de Huellas de Paz.

**Stack:**
- Next.js 15 (App Router + TypeScript)
- Drizzle ORM + Supabase (PostgreSQL)
- Supabase SSR Auth + 2FA por email OTP
- Resend (emails transaccionales)
- PDFKit (generación de certificados)
- XLSX (exportación/importación Excel)
- @hello-pangea/dnd (drag & drop en agenda)
- Tailwind CSS 4 + inline styles + shadcn/ui

**Variables de entorno:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://ictjxquzsyftmgghjblc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=postgresql://...
DATABASE_URL_UNPOOLED=postgresql://...
NEXT_PUBLIC_APP_URL=https://huellasde-paz.vercel.app
CORS_ALLOWED_ORIGINS=https://cotizador...,https://landing...
RESEND_API_KEY=re_...
MP_ACCESS_TOKEN=...         # pendiente
MP_PUBLIC_KEY=...           # pendiente
MP_WEBHOOK_SECRET=...       # pendiente
ANTHROPIC_API_KEY_ASISTENTE=...
ASISTENTE_MODELO=claude-haiku-4-5-20251001
ASISTENTE_MAX_TOKENS=1000
ASISTENTE_RATE_LIMIT_POR_MINUTO=5
ASISTENTE_PRESUPUESTO_USD=10
```

**Comandos:**
```bash
cd crm
npm install
npm run dev        # desarrollo en localhost:3000
npm run build      # build de producción
npm run db:migrate # aplicar migraciones Drizzle
```

---

### 2. Landing (`landing/`)

Página pública con información de servicios, planes y formulario de contacto.

**Stack:** Astro 6 + TypeScript + Tailwind CSS 4

**Secciones:**
- `Hero.astro` — slideshow de fotos (10 slides, fade cada 5s) + huellas flotantes
- `Servicios.astro` — cremación individual, comunitaria, entierro
- `Planes.astro` — estructura lista, precios pendientes del cliente
- `Memoriales.astro` — galería de memoriales públicos desde el CRM
- `Convenios.astro` — formulario de postulación para veterinarias/petshops
- `Contacto.astro` — formulario → POST /api/leads al CRM
- `Ubicacion.astro` — mapas de las dos sedes
- `Navbar.astro` — nav con dropdown "Ingresar" (Mi portal + Portal socios)
- `Footer.astro`

**Datos pendientes del cliente:**
- Número de WhatsApp real (actualmente `5493XXXXXXXXX`)
- Precios y nombres finales de los planes
- Logo final

**Comandos:**
```bash
cd landing
npm install
npm run dev   # localhost:4321
npm run build
```

---

### 3. Cotizador (`cotizador/`)

Herramienta de cotización online embebida en la landing vía iframe. Actualmente comentado en `index.astro` hasta apertura del crematorio.

**Stack:** React 18 + Vite + Tailwind CSS 4

**Flujo de pasos:**
```
Paso 1: Tipo de mascota (canino/felino/otro)
        ├── Canino → Paso 2 (tamaño)
        └── Felino / Otro → Paso 3 directamente
Paso 2: Tamaño (solo caninos)
Paso 3: Servicio (precios cargados dinámicamente desde /api/configuracion/servicios)
        ├── Plan Huellitas     — cremación comunitaria
        ├── Plan Compañeros    — cremación individual diferida
        ├── Plan Siempre Juntos — cremación individual presencial
        └── Jardín del Recuerdo — entierro
Paso 4: Método de retiro (domicilio / crematorio)
Paso 5: Entrega de cenizas (inmediata / diferida)
Paso 6: Zona (solo si eligió domicilio)
Paso 7: Datos de contacto → POST /api/leads (origen: cotizador)
Paso 8: Pantalla de éxito
```

**Precios:** Cargados dinámicamente desde `GET /api/configuracion/servicios` (CORS habilitado). Fallback a valores hardcodeados si la API falla.

**Mascotas sin talla:** `felino`, `mamifero-pequeno`, `reptil`, `ave-pez`

**Comandos:**
```bash
cd cotizador
npm install
npm run dev   # localhost:5173
npm run build
```

---

## Base de datos

**Motor:** Supabase (PostgreSQL). ORM: Drizzle. Schema en `crm/src/db/schema/`.

### Tablas

#### `usuarios`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | UUID del usuario en Supabase Auth |
| nombre | text | |
| email | text unique | |
| rol | enum | admin, manager, contadora, televenta, transporte, cremacion, entrega |
| permisos | text[] | gestion_equipo, ver_reportes, configuracion, cobranzas |
| mfaEmailActivo | boolean | Default: false — 2FA por OTP activado |
| otpCodigo | text | Hash SHA-256(codigo+userId) — nulo cuando no hay OTP activo |
| otpExpiraEn | timestamp | Expira a los 10 minutos |
| otpIntentos | integer | Default: 0 — máximo 3 intentos |
| mfaSesionToken | text | Token de sesión MFA (se invalida al expirar) |
| mfaSesionExpiraEn | timestamp | 8 horas desde la verificación exitosa |
| creadoEn | timestamp | |
| actualizadoEn | timestamp | |

#### `clientes`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| nombre | text | |
| apellido | text | |
| email | text | |
| telefono | text | |
| direccion | text | |
| localidad | text | |
| provincia | text | Default: 'Santa Fe' |
| origen | text | De dónde vino el cliente |
| notas | text | |
| tokenPortal | text unique | Token para acceso al portal cliente (UUID) |
| authUserId | text unique | UUID del user en Supabase Auth (portal) |
| veterinariaId | uuid FK → convenios.id | Convenio de referencia del cliente |
| creadoEn | timestamp | |
| actualizadoEn | timestamp | |

#### `mascotas`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| clienteId | uuid FK → clientes.id | |
| nombre | text | |
| especie | text | perro, gato, conejo, etc. (de configuracion_general) |
| raza | text | |
| color | text | |
| fechaNacimiento | date | |
| fechaFallecimiento | date | |
| foto | text | URL de foto principal |
| galeria | jsonb (string[]) | Array de URLs para el memorial |
| dedicatoria | text | Texto del memorial |
| memoriaPublica | boolean | Default: false — visible en /memorial |
| notas | text | |
| creadoEn | timestamp | |
| actualizadoEn | timestamp | |

#### `servicios`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| numero | integer | Autonumérico (secuencia en DB) |
| clienteId | uuid FK → clientes.id | |
| mascotaId | uuid FK → mascotas.id | |
| tipo | enum | cremacion_individual, cremacion_comunitaria, entierro |
| estado | enum | **Ver estados abajo** |
| precio | numeric(10,2) | Precio base del servicio |
| descuento | numeric(10,2) | Monto de descuento por convenio |
| convenioId | uuid FK → convenios.id | Convenio aplicado al servicio |
| servicioConfigId | uuid FK → servicios_config.id | Config de servicio usada |
| inventarioItemId | uuid FK → inventario.id | Urna asignada |
| responsableTransporteId | uuid FK → usuarios.id | |
| responsableCremacionId | uuid FK → usuarios.id | |
| responsableEntregaId | uuid FK → usuarios.id | |
| modalidadRetiro | text | domicilio / crematorio |
| fechaRetiro | timestamp | |
| fechaCremacion | timestamp | |
| fechaEntrega | timestamp | |
| pagado | boolean | Default: false |
| notas | text | |
| creadoEn | timestamp | |
| actualizadoEn | timestamp | |

**Estados del servicio (5 estados):**
```
pendiente → en_proceso → listo → entregado
                               ↘ cancelado
```

#### `servicios_config`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| nombre | text | Ej: "Plan Huellitas", "Jardín del Recuerdo" |
| tipo | enum | cremacion_individual, cremacion_comunitaria, entierro |
| precio | numeric(10,2) | NULL = "Consultar" |
| descripcion | text | |
| activo | boolean | Default: true |
| creadoEn | timestamp | |
| actualizadoEn | timestamp | |

**Registros cargados:**
- Plan Huellitas — cremacion_comunitaria — $90.000
- Plan Compañeros — cremacion_individual — $120.000
- Plan Siempre Juntos — cremacion_individual — $140.000
- Jardín del Recuerdo — entierro — NULL (Consultar)

#### `planes`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| numero | integer | Autonumérico |
| clienteId | uuid FK → clientes.id | |
| mascotaId | uuid FK → mascotas.id | |
| planConfigId | uuid FK → planes_config.id | |
| estado | enum | activo, pausado, cancelado, utilizado, atrasado |
| cuotaMensual | numeric(10,2) | |
| cuotasPagadas | integer | Default: 0 |
| cuotasTotales | integer | |
| porcentajeCobertura | numeric(5,2) | Calculado automáticamente |
| mascotaAdicional | boolean | +50% sobre cuota base |
| fechaUltimoPago | timestamp | |
| notas | text | |
| creadoEn | timestamp | |
| actualizadoEn | timestamp | |

**Cobertura escalonada:**
- Cuotas 1-6 → 0%
- Cuotas 7-12 → 50%
- Cuota 13+ → 100%

#### `planes_config`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| nombre | text | |
| descripcion | text | |
| cuotaMensual | numeric(10,2) | |
| cuotasTotales | integer | |
| beneficios | jsonb | Lista de beneficios |
| coberturaEscalonada | jsonb | `{ cuota: porcentaje }` |
| activo | boolean | Default: true |
| creadoEn | timestamp | |
| actualizadoEn | timestamp | |

#### `leads`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| nombre | text | |
| telefono | text | |
| email | text | |
| dni | text | Requerido para leads B2B (portal convenio) |
| mensaje | text | |
| origen | text | landing, cotizador, directo, base_propia, veterinaria |
| estado | enum | nuevo, contactado, interesado, cotizado, convertido, perdido |
| asignadoAId | uuid FK → usuarios.id | |
| veterinariaId | uuid FK → convenios.id | |
| importacionId | uuid FK → importaciones_leads.id | |
| pickupMethod | text | domicilio / crematorio (desde cotizador) |
| notas | text | |
| seguimientoEn | timestamp | Fecha/hora programada para retomar el contacto |
| primerRespuestaEn | timestamp | |
| ultimaInteraccionEn | timestamp | |
| creadoEn | timestamp | |
| actualizadoEn | timestamp | |

#### `lead_interacciones`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| leadId | uuid FK → leads.id | |
| usuarioId | uuid FK → usuarios.id | |
| tipo | text | nota, llamada, email, whatsapp, seguimiento, convertido, etc. |
| descripcion | text | |
| creadoEn | timestamp | |

#### `importaciones_leads`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| nombreArchivo | text | |
| totalImportados | integer | |
| totalDuplicados | integer | |
| totalErrores | integer | |
| creadoEn | timestamp | |

#### `convenios`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| nombre | text | |
| tipo | enum | veterinaria, petshop, refugio, clinica, otro |
| direccion | text | |
| telefono | text | |
| email | text | |
| responsable | text | |
| instagram | text | |
| web | text | |
| estadoConvenio | enum | sin_convenio, en_negociacion, activo, pausado |
| descuentoPorcentaje | numeric(5,2) | Default: 0 |
| beneficioDescripcion | text | |
| serviciosCubiertos | jsonb (string[]) | Tipos de servicio incluidos en el convenio |
| fechaInicioConvenio | timestamp | |
| fechaVencimientoConvenio | timestamp | |
| notas | text | |
| tokenPortal | uuid | Token único de acceso al portal B2B |
| portalActivo | boolean | Default: false |
| authUserId | text | UUID del socio en Supabase Auth (si fue invitado) |
| creadoEn | timestamp | |
| actualizadoEn | timestamp | |

**Alias:** `veterinarias = convenios` en el código (compatibilidad legado). `clientes.veterinariaId` apunta a `convenios.id`.

#### `inventario`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| nombre | text | |
| descripcion | text | |
| categoria | enum | urna, bolsa, caja, accesorio, insumo, otro |
| stockActual | integer | Default: 0 |
| stockMinimo | integer | Default: 5 |
| precioUnitario | numeric(10,2) | |
| proveedor | text | |
| foto | text | URL |
| notas | text | |
| creadoEn | timestamp | |
| actualizadoEn | timestamp | |

#### `templates_msg`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| nombre | text | |
| canal | text | whatsapp, email |
| evento | text | bienvenida, recordatorio_pago, servicio_listo, etc. |
| contenido | text | |
| activo | boolean | Default: true |
| creadoEn | timestamp | |
| actualizadoEn | timestamp | |

#### `comunicaciones`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| clienteId | uuid FK → clientes.id | |
| servicioId | uuid FK → servicios.id | |
| templateId | uuid FK → templates_msg.id | |
| canal | text | whatsapp, email |
| mensaje | text | |
| estado | text | pendiente, enviado |
| creadoEn | timestamp | |

#### `noticias_cementerio`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| titulo | text | |
| contenido | text | |
| imagen | text | URL en Supabase Storage (`portal/novedades/`) |
| creadoPorId | uuid FK → usuarios.id | |
| publicada | boolean | Default: true — false = borrador |
| destacada | boolean | Default: false — aparece primero |
| creadoEn | timestamp | |

#### `configuracion_general`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| clave | text unique | tipos_servicio, origenes_lead, especies_mascota, tipos_convenio |
| valores | jsonb | Array de strings |
| descripcion | text | |
| actualizadoEn | timestamp | |

#### `asistente_log`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| usuarioId | uuid FK → usuarios.id | |
| rol | text | Rol del usuario al momento de la consulta |
| pregunta | text | |
| screenContext | text | Contexto de pantalla opcional |
| tokensInput | integer | |
| tokensOutput | integer | |
| creadoEn | timestamp | |

### Migraciones

| Migración | Método | Descripción |
|-----------|--------|-------------|
| 0000–0009 | drizzle-kit | Schema inicial, tablas core |
| 0010 | SQL directo | Agrega `fecha_ultimo_pago` a `planes` |
| 0011 | SQL directo | Agrega `galeria` (jsonb) a `mascotas` |
| 0012 | SQL directo | Agrega `publicada` y `destacada` a `noticias_cementerio` |
| 0013 | Script Node.js | Tablas `servicios_config` y `noticias_cementerio` |
| 0014 | Script Node.js | Columnas B2B en `convenios`: `servicios_cubiertos`, `portal_activo`, `token_portal`, `auth_user_id` |
| 0015 | Script Node.js | Columnas 2FA en `usuarios`: `mfa_email_activo`, `otp_codigo`, `otp_expira_en`, `otp_intentos`, `mfa_sesion_token`, `mfa_sesion_expira_en` |

**Scripts de migración:** `crm/scripts/migrate-0014.mjs`, `crm/scripts/migrate-0015.mjs`

**Importante:** No usar `drizzle-kit push` — detecta columnas eliminadas en otras tablas y pide confirmación destructiva. Para migraciones manuales usar `postgres.js` directamente.

---

## API Routes

### Públicas (sin autenticación, CORS habilitado)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/leads` | Crear lead (desde cotizador/landing) |
| GET | `/api/configuracion/servicios` | Listar servicios activos (usado por cotizador para precios) |
| POST | `/api/convenios/postulacion` | Postulación pública de veterinarias desde landing |

### Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/me` | Devuelve el usuario logueado (id, nombre, rol) |
| POST | `/api/auth/otp/enviar` | Envía OTP por email (skipMfa — no requiere MFA activo) |
| POST | `/api/auth/otp/verificar` | Verifica OTP y setea cookie `mfa_s` (skipMfa) |
| GET | `/api/auth/destino` | Resuelve redirect post-login según rol |
| GET | `/api/agentes` | Lista agentes (televenta) para asignación de leads |

### Leads

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/leads` | Listar leads (acepta `?misLeads=true`) |
| GET/PATCH/DELETE | `/api/leads/[id]` | Ver / editar / eliminar lead |
| POST | `/api/leads/[id]/email` | Enviar email al lead (Resend) |
| POST | `/api/leads/convertir` | Convertir lead → cliente + mascota + plan/servicio |
| POST | `/api/leads/importar` | Importación masiva desde Excel |

### Clientes y mascotas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/clientes` | Listar / crear clientes |
| GET/PATCH/DELETE | `/api/clientes/[id]` | Ver / editar / eliminar cliente |
| GET/POST | `/api/mascotas` | Listar / crear mascotas |
| GET/PATCH/DELETE | `/api/mascotas/[id]` | Ver / editar / eliminar mascota |

### Servicios

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/servicios` | Listar / crear servicios |
| GET/PATCH | `/api/servicios/[id]` | Ver / actualizar servicio |

### Planes

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/planes` | Listar / crear planes |
| GET/PATCH | `/api/planes/[id]` | Ver / actualizar plan |

### Convenios

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/convenios` | Listar / crear convenios |
| GET/PATCH | `/api/convenios/[id]` | Ver / actualizar convenio |
| POST | `/api/portal/convenio/invitar` | Envía invitación al socio B2B (crea Supabase Auth user) |
| GET | `/api/portal/convenio/mi-token` | Resuelve el token del convenio post-login |

### Configuración

| Método | Ruta | Descripción |
|--------|------|-------------|
| PATCH | `/api/configuracion/general` | Actualizar listas configurables |
| GET/POST | `/api/configuracion/planes` | Listar / crear planes config |
| PATCH | `/api/configuracion/planes/[id]` | Editar plan config |
| GET/POST | `/api/configuracion/servicios` | Listar / crear servicios config (GET es público/CORS) |
| PATCH | `/api/configuracion/servicios/[id]` | Editar servicio config |
| GET/POST | `/api/configuracion/templates` | Listar / crear templates de mensajes |

### Inventario

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/inventario` | Listar / crear items |
| GET/PATCH | `/api/inventario/[id]` | Ver / editar item |
| POST | `/api/storage/inventario` | Upload de foto a Supabase Storage |

### Comunicaciones

| Método | Ruta | Descripción |
|--------|------|-------------|
| PATCH | `/api/comunicaciones/[id]` | Actualizar estado de comunicación |

### Novedades (solo admin)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/noticias` | Listar / crear noticias (`publicada`, `destacada`) |
| PATCH | `/api/noticias/[id]` | Editar o toggle publicada/destacada |
| DELETE | `/api/noticias/[id]` | Eliminar noticia |

### Reportes

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/reportes/negocio` | Métricas generales del negocio |
| GET | `/api/reportes/pdf` | Generar PDF con PDFKit |
| GET | `/api/manager/reportes` | Reportes de rendimiento del equipo |

### Usuarios

| Método | Ruta | Descripción |
|--------|------|-------------|
| PATCH | `/api/usuarios/[id]/permisos` | Actualizar permisos adicionales de un usuario |

### Portal cliente

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/portal/invitar` | Enviar invitación al portal con token único |
| PATCH | `/api/portal/mascotas/[id]` | Editar mascota desde portal (dedicatoria, galería) |
| GET | `/api/portal/certificado/[servicioId]` | Descargar certificado de cremación (PDF) |

### Cron (Vercel Cron Jobs)

| Método | Ruta | Frecuencia | Descripción |
|--------|------|------------|-------------|
| GET | `/api/cron/leads` | Cada hora | Vencimiento de leads: nuevo +72hs → perdido, interesado +48hs → perdido, perdido +10 días → eliminado |
| GET | `/api/cron/planes` | Diaria | Detección de planes atrasados |

### Asistente IA

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/asistente/chat` | Chat con Claude Haiku — con rate limiting y cap de presupuesto |

---

## Páginas del CRM

### Autenticación
- `/auth/login` — Login con Supabase SSR
- `/auth/verificar-mfa` — Verificación OTP cuando 2FA está activo
- `/acceso` — Selector de portal (Mi portal / Portal socios) — para usuarios externos

### Dashboard
- `/dashboard` — KPIs: servicios activos, leads nuevos, planes activos, clientes totales, cremaciones en curso, stock bajo

### Clientes
- `/dashboard/clientes` — Lista con búsqueda
- `/dashboard/clientes/nuevo` — Formulario de creación
- `/dashboard/clientes/[id]` — Ficha: datos, mascotas, servicios, planes, novedades del cementerio
- `/dashboard/clientes/[id]/mascotas/nueva` — Nueva mascota para el cliente

### Servicios
- `/dashboard/servicios` — Lista: #, mascota, cliente, tipo, convenio, pago, estado, fecha retiro
- `/dashboard/servicios/nuevo` — Formulario con selector de servicios config + convenio + cálculo automático de precio
- `/dashboard/servicios/[id]` — Detalle: barra de progreso, datos, cambio de estado, pago

### Planes
- `/dashboard/planes` — Lista: #, plan, cliente, mascota, cobertura, estado
- `/dashboard/planes/nuevo` — Formulario de creación
- `/dashboard/planes/[id]` — Detalle con cobertura escalonada y registro de pagos
- `/dashboard/planes/[id]/editar` — Editar plan

### Leads
- `/dashboard/leads` — Lista completa con filtros por estado y origen
- `/dashboard/leads/nuevo` — Crear lead manual
- `/dashboard/leads/[id]` — Detalle con historial de interacciones

### Mis Leads (agente televenta)
- `/dashboard/mis-leads` — Vista de trabajo un lead a la vez con cronómetro, WhatsApp popup, email integrado, modal de conversión

### Agenda
- `/dashboard/agenda` — Calendario de servicios filtrado por rol

### Comunicación
- `/dashboard/comunicacion` — Templates de mensajes y envío individual

### Inventario
- `/dashboard/inventario` — Lista con alertas de stock bajo
- `/dashboard/inventario/nuevo` — Crear item
- `/dashboard/inventario/[id]` — Detalle y edición

### Convenios B2B
- `/dashboard/convenios` — Lista de convenios con estados y métricas
- `/dashboard/convenios/nueva` — Crear convenio
- `/dashboard/convenios/[id]` — Detalle: datos, leads derivados, clientes
- `/dashboard/convenios/editar` — Editar convenio

### Novedades (solo admin)
- `/dashboard/novedades` — Gestión de novedades: borrador/publicado, pin destacado

### Reportes
- `/dashboard/reportes` — Métricas de negocio con gráficos

### Mi cuenta
- `/dashboard/perfil` — Mi cuenta: cambio de contraseña, 2FA, apariencia (dark mode)

### Asistente IA
- `/dashboard/asistente` — Auditoría del asistente IA (solo admin): logs, tokens, costo

### Manager (admin/manager)
- `/dashboard/manager/agentes` — Estado del equipo
- `/dashboard/manager/rendimiento` — Métricas por agente
- `/dashboard/manager/reportes` — Reportes del equipo
- `/dashboard/mi-rendimiento` — Vista de rendimiento personal (televenta)

### Configuración
- `/dashboard/configuracion` — Servicios config, planes config, templates, listas, usuarios y permisos
- `/dashboard/configuracion/importar-leads` — Importación masiva desde Excel

### Portal cliente (Fase 2)
- `/portal/login` — Login con email/password
- `/portal/activar` — Activación de cuenta con token
- `/portal/[token]` — Home del portal: tabs Servicios · Planes · Memorial · Novedades

### Memorial público (Fase 2)
- `/memorial` — Grilla pública de memoriales activos (`memoria_publica = true`)
- `/memorial/[mascotaId]` — Memorial individual con foto, fechas, dedicatoria, galería

### Portal B2B convenios (Fase 3)
- `/portal/convenio/login` — Login del socio B2B
- `/portal/convenio/[token]` — Portal del socio: leads enviados, tabla de historial

---

## Componentes relevantes

### Seguridad / Auth

| Componente | Descripción |
|------------|-------------|
| `LoginForm` | Formulario de login con step 'otp' para 2FA (input de 6 dígitos, reenviar countdown) |
| `Configuracion2FA` | Activa/desactiva 2FA desde Mi cuenta — requiere OTP para ambas acciones |

### Formularios principales

| Componente | Descripción |
|------------|-------------|
| `NuevoServicioForm` | Selector de servicios config, convenio, cálculo automático de precio |
| `NuevoPlanForm` | Selector de plan config, cliente, mascota |
| `NuevoClienteForm` | Datos del cliente |
| `NuevoLeadForm` | Crear lead manual |
| `NuevoConvenioForm` | Crear convenio B2B |
| `CambiarEstadoLeadForm` | Cambio de estado con validación de permisos |

### Servicios

| Componente | Descripción |
|------------|-------------|
| `ServicioEstadoForm` | Select de 5 estados → PATCH /api/servicios/[id] |
| `ServicioPagoForm` | Toggle de pago |

### Configuración

| Componente | Descripción |
|------------|-------------|
| `EditarServicioConfigInline` | Card editable de servicio config |
| `NuevoServicioConfigForm` | Formulario para crear servicio config |
| `EditarPlanConfigInline` | Card editable de plan config |
| `GestionPermisosUsuario` | Toggle de permisos adicionales por usuario |

### Novedades

| Componente | Descripción |
|------------|-------------|
| `NovedadCard` | Client Component — optimistic UI para publicada/destacada |
| `NuevaNovedadForm` | Modal de creación con toggle borrador/publicado |
| `EditarNovedadBtn` | Modal de edición |
| `EliminarNovedadBtn` | Botón con confirm dialog |

### Portal cliente

| Componente | Descripción |
|------------|-------------|
| `PortalTabs` | Tabs: Servicios · Planes · Memorial · Novedades |
| `EditarMemorialInline` | Edición de dedicatoria y galería — accesible solo con token |
| `LogoutBtn` | Botón de salida para portales (cliente y convenio) |
| `CertificadoDescarga` | Botón para descargar certificado PDF |

### Asistente IA

| Componente | Descripción |
|------------|-------------|
| `AsistenteChat` | Chat flotante en el dashboard |

---

## Flujos principales

### Flujo de leads

```
ORIGEN DEL LEAD
│
├── Cotizador online → POST /api/leads (origen: cotizador, pickupMethod)
├── Formulario landing → POST /api/leads (origen: landing)
├── Portal convenio (B2B) → POST /api/leads (origen: veterinaria, veterinariaId, dni)
└── Importación Excel → POST /api/leads/importar (origen: base_propia)

crearLeadAutomatico()
├── ¿Teléfono duplicado? → actualizar ultimaInteraccionEn + agregar nota
└── Lead nuevo → asignarAgente() round-robin entre televenta → registrar interacción

CRON (/api/cron/leads — cada hora)
├── Nuevo +72hs sin actividad → estado: perdido
├── Interesado +48hs sin actividad → estado: perdido
└── Perdido +10 días → eliminado (DELETE)
```

### Flujo de servicios

```
CREAR SERVICIO
├── Seleccionar cliente → autocompletar mascota
├── Seleccionar servicio config → precio base cargado
├── Seleccionar convenio (opcional) → descuento calculado automáticamente
└── Guardar → POST /api/servicios

CICLO DE VIDA (5 estados)
pendiente → en_proceso → listo → entregado
                               ↘ cancelado

RESPONSABLES
├── responsableTransporteId → asignado en estado pendiente
├── responsableCremacionId → asignado en estado en_proceso
└── responsableEntregaId → asignado en estado listo
```

### Flujo de planes de previsión

```
COBERTURA ESCALONADA
├── Cuotas 1-6   → 0% cobertura
├── Cuotas 7-12  → 50% cobertura
└── Cuota 13+    → 100% cobertura

Mascota adicional: +50% sobre cuota base

REGISTRAR PAGO
└── cuotasPagadas + 1 + fechaUltimoPago = now()
    └── porcentajeCobertura recalculado automáticamente
```

### Flujo de convenios B2B

```
POSTULACIÓN (desde landing)
└── Formulario → POST /api/convenios/postulacion
    └── Crea convenio con estadoConvenio: en_negociacion

PORTAL B2B (Fase 3)
├── Admin activa portalActivo = true + opcionalmente invita por email
│   └── POST /api/portal/convenio/invitar → crea Supabase Auth user
├── Socio accede a /portal/convenio/[tokenPortal]
│   └── Sin email: solo tokenPortal en URL
│   └── Con email: login en /portal/convenio/login
└── Socio envía lead desde el portal → POST /api/leads (origen: veterinaria, veterinariaId)
    └── Lead aparece en kanban con etiqueta del convenio

AL CONVERTIR UN SERVICIO
└── convenioId + descuentoPorcentaje → descuento calculado automáticamente
```

### Flujo de autenticación CRM (con 2FA)

```
LOGIN NORMAL (sin 2FA)
└── /auth/login → Supabase signInWithPassword → /dashboard

LOGIN CON 2FA ACTIVO
├── /auth/login → Supabase signInWithPassword OK
├── /api/me devuelve { mfaRequerido: true }
├── Redirige a /auth/verificar-mfa
│   └── Auto-envía OTP por email (Resend)
├── Usuario ingresa código de 6 dígitos
├── POST /api/auth/otp/verificar
│   ├── Verifica hash SHA-256(codigo+userId)
│   ├── Genera mfaSesionToken → SET COOKIE mfa_s={userId}:{token} (8hs, httpOnly)
│   └── Redirige a /dashboard
└── requireAuth() en cada ruta valida la cookie mfa_s

ACTIVAR 2FA (desde /dashboard/perfil)
├── Solicita OTP de verificación para confirmar identidad
└── Si OTP válido → mfaEmailActivo = true

DURACIÓN DE SESIÓN MFA
└── 8 horas → al expirar, redirige automáticamente a /auth/verificar-mfa
```

### Flujo del portal cliente

```
INVITACIÓN
└── Admin en ficha cliente → POST /api/portal/invitar
    └── Genera tokenPortal único → envía email con link

ACCESO (dos mecanismos independientes)
├── Token en URL: /portal/[tokenPortal] — sin login, mecanismo principal
└── Supabase Auth: login con email/password en /portal/login

PORTAL (/portal/[token])
└── Tabs: Servicios · Planes · Memorial · Novedades
    └── Memorial → edición de dedicatoria y galería sin login adicional
        └── memoriaPublica = true → visible en /memorial/[mascotaId]

LOGOUT
└── LogoutBtn → supabase.auth.signOut() → redirect a /auth/login (cliente) o /portal/convenio/login (B2B)
```

---

## Pendientes

### 🔴 Alta prioridad (bloqueante para launch)

- [ ] Configurar dominio en Resend — emails salen desde `onboarding@resend.dev`. Actualizar `from:` en:
  - `lib/email/invitacion.tsx`
  - `lib/email/estadoServicio.ts`
  - `lib/email/enviarEmailLead.ts`
  - `app/api/portal/recuperar/route.ts`
- [ ] Número de WhatsApp real (actualmente `5493XXXXXXXXX` en landing)
- [ ] Logo final de Huellas de Paz

### 🟡 Funcionalidades pendientes

- [ ] Integración Mercado Pago (env vars presentes, pendiente de cuenta y webhook)
- [ ] Activar cotizador en landing (comentado en `landing/src/pages/index.astro`)
- [ ] Paginación en tabla de leads del portal convenio (hardcodeado a 50)
- [ ] Notificación al socio B2B cuando cambia el estado de su lead
- [ ] Comunicación masiva en `/dashboard/comunicacion`

### 📋 Contenido del cliente

- [ ] Precios y nombres finales de los 3 planes de previsión
- [ ] Dirección física del crematorio para contacto
- [ ] Fotos del lugar y mascotas (actualmente de stock)
- [ ] Testimonios de clientes

### 🚀 Fases siguientes

- [ ] **Fase 4** — Chatbot IA en WhatsApp + Instagram (bloqueado hasta ahora)

---

## Reglas de desarrollo

- **No hardcodear** listas, tipos o configuraciones — usar `configuracion_general` en DB
- **No crear archivos innecesarios** — verificar en el repo antes de crear algo nuevo
- **No duplicar lógica** — reusar helpers y componentes existentes
- El schema de Drizzle es la fuente de verdad para los tipos
- Migraciones manuales (post-0009): aplicar con script Node.js + `postgres.js` directamente. No usar `drizzle-kit push`.
- Los tipos de Drizzle se exportan desde `@/db/schema`
- Todo texto visible al usuario en **español rioplatense argentino**
- Código, comentarios y documentación técnica en inglés
- `veterinarias` es un alias de `convenios` — usar `convenios` en código nuevo
- El campo `clientes.veterinariaId` apunta a `convenios.id` (nombre legado, no renombrar sin migración)
- Planes NO tienen convenio — el descuento de convenio aplica solo a servicios