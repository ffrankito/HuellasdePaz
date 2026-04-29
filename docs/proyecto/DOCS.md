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
| Fase 1b | Cobranzas, comunicación masiva, reportes | 🔄 En progreso |
| Fase 2 | Portal cliente + memorial digital | 🔄 Parcialmente implementado |
| Fase 3 | Portal B2B veterinarias | 📋 Planificado |
| Fase 4 | Chatbot AI | 📋 Planificado (no antes de Fase 3) |

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
- Next.js 15.3.1 (App Router + TypeScript)
- Drizzle ORM + Supabase (PostgreSQL)
- Supabase SSR Auth
- Resend (emails transaccionales)
- PDFKit (generación de certificados)
- XLSX (exportación/importación Excel)
- @hello-pangea/dnd (drag & drop en agenda)
- Tailwind CSS 4 + inline styles

**Variables de entorno:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://ictjxquzsyftmgghjblc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_URL=https://huellasde-paz.vercel.app
RESEND_API_KEY=re_...
MP_ACCESS_TOKEN=...
MP_PUBLIC_KEY=...
MP_WEBHOOK_SECRET=...
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
- `Hero.astro` — imagen de fondo, CTA WhatsApp, badges de confianza
- `Servicios.astro` — cremación individual, comunitaria, entierro
- `Planes.astro` — estructura lista, precios pendientes del cliente
- `Cotizador.astro` — iframe del cotizador
- `Convenios.astro` — formulario de postulación para veterinarias/petshops → POST /api/convenios/postulacion
- `Contacto.astro` — formulario → POST /api/leads al CRM
- `Footer.astro`

**Datos pendientes del cliente:**
- Número de WhatsApp real (actualmente `5493XXXXXXXXX`)
- Dirección física del crematorio
- Precios y nombres finales de los planes

**Comandos:**
```bash
cd landing
npm install
npm run dev   # localhost:4321
npm run build
```

---

### 3. Cotizador (`cotizador/`)

Herramienta de cotización online embebida en la landing vía iframe.

**Stack:** React 18 + Vite + Tailwind CSS 4

**Flujo de pasos:**
```
Paso 1: Tipo de mascota (canino/felino/otro)
        ├── Canino → Paso 2 (tamaño)
        └── Felino / Otro → Paso 3 directamente
Paso 2: Tamaño (solo caninos)
Paso 3: Servicio
        ├── Plan Huellitas     $90.000 — cremación comunitaria
        ├── Plan Compañeros   $120.000 — cremación individual diferida
        ├── Plan Siempre Juntos $140.000 — cremación individual presencial
        └── Jardín del Recuerdo $110.000 — entierro
Paso 4: Método de retiro (domicilio / crematorio)
Paso 5: Entrega de cenizas (inmediata / diferida)
Paso 6: Zona (solo si eligió domicilio)
Paso 7: Datos de contacto → POST /api/leads (origen: cotizador)
Paso 8: Pantalla de éxito
```

**Mascotas sin talla:** `felino`, `mamifero-pequeno`, `reptil`, `ave-pez`

**CORS:** Habilitado en `/api/leads` y `/api/convenios` para el dominio del cotizador.

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
| permisos | text[] | Permisos adicionales: gestion_equipo, ver_reportes, configuracion, cobranzas |
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
| tokenPortal | text unique | Token para acceso al portal cliente |
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
| especie | text | perro, gato, conejo, etc. (libre, de configuracion_general) |
| raza | text | |
| color | text | |
| fechaNacimiento | date | |
| fechaFallecimiento | date | |
| foto | text | URL de foto principal |
| galeria | jsonb (string[]) | Array de URLs para memorial |
| dedicatoria | text | Texto del memorial |
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
| estado | enum | Ver estados abajo |
| precio | numeric(10,2) | Precio base del servicio |
| descuento | numeric(10,2) | Monto de descuento por convenio |
| convenioId | uuid FK → convenios.id | Convenio aplicado al servicio |
| servicioConfigId | uuid FK → servicios_config.id | Config de servicio usada |
| responsableTransporteId | uuid FK → usuarios.id | |
| responsableCremacionId | uuid FK → usuarios.id | |
| responsableEntregaId | uuid FK → usuarios.id | |
| fechaRetiro | timestamp | |
| fechaCremacion | timestamp | |
| fechaEntrega | timestamp | |
| pagado | boolean | Default: false |
| notas | text | |
| creadoEn | timestamp | |
| actualizadoEn | timestamp | |

**Estados del servicio:**
```
ingresado → retiro_pendiente → en_transporte → recibido → en_cremacion → cremado → listo_entrega → entregado
                                                                                                   ↘ cancelado
```

#### `servicios_config`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| nombre | text | Ej: "Plan Huellitas", "Plan Compañeros" |
| tipo | enum | cremacion_individual, cremacion_comunitaria, entierro |
| precio | numeric(10,2) | NULL = "Consultar" |
| descripcion | text | |
| activo | boolean | Default: true |
| creadoEn | timestamp | |
| actualizadoEn | timestamp | |

**Registros iniciales cargados:**
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
| cuotasMensual | numeric(10,2) | |
| cuotasPagadas | integer | Default: 0 |
| cuotasTotales | integer | Default: 0 (sin NOT NULL forzado) |
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
| cuotasTotales | integer | (sin NOT NULL forzado) |
| beneficios | jsonb | Lista de beneficios |
| coberturaEscalonada | jsonb | { cuota: porcentaje } |
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
| mensaje | text | |
| origen | text | landing, cotizador, directo, base_propia, veterinaria |
| estado | enum | nuevo, contactado, interesado, cotizado, convertido, perdido |
| asignadoAId | uuid FK → usuarios.id | |
| veterinariaId | uuid FK → convenios.id | |
| notas | text | |
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
| tipo | text | nota, llamada, email, whatsapp, seguimiento_24hs, etc. |
| descripcion | text | |
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
| fechaInicioConvenio | timestamp | |
| fechaVencimientoConvenio | timestamp | |
| notas | text | |
| creadoEn | timestamp | |
| actualizadoEn | timestamp | |

**Alias:** La tabla se llama `convenios` en DB. El schema exporta también `veterinarias = convenios` para compatibilidad con código legado. El campo `clientes.veterinariaId` apunta a `convenios.id`.

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
| canal | text | |
| mensaje | text | |
| estado | text | pendiente, enviado |
| creadoEn | timestamp | |

#### `configuracion_general`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| clave | text unique | tipos_servicio, origenes_lead, especies_mascota, tipos_convenio |
| valores | jsonb | Array de strings |
| descripcion | text | |
| actualizadoEn | timestamp | |

#### `noticias_cementerio`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid PK | |
| titulo | text | |
| contenido | text | |
| creadoPorId | uuid FK → usuarios.id | |
| creadoEn | timestamp | |

Las noticias se muestran en la ficha de cada cliente (últimas 5, desc).

### Migraciones

10 migraciones Drizzle (0000–0009). Cambios post-migración aplicados con SQL directo en Supabase:
- `veterinarias` renombrada a `convenios` (migración 0009)
- `planes.cuotas_totales` — DROP NOT NULL
- `planes_config.cuotas_totales` — DROP NOT NULL
- Tablas `servicios_config` y `noticias_cementerio` — creadas con script Node.js directo
- Columnas `convenio_id`, `servicio_config_id`, `pagado`, `descuento` en `servicios` — agregadas directamente

---

## API Routes

### Públicas (sin autenticación)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/leads` | Crear lead (desde cotizador/landing — CORS habilitado) |
| GET | `/api/leads` | Listar leads |
| POST | `/api/convenios/postulacion` | Postulación pública de veterinarias desde landing |
| GET | `/api/convenios` | Listar convenios activos (CORS — usado por cotizador) |

### Leads

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/PATCH/DELETE | `/api/leads/[id]` | Ver / editar / eliminar lead |
| POST | `/api/leads/[id]/email` | Enviar email al lead (Resend) |
| POST | `/api/leads/convertir` | Convertir lead en cliente + crear servicio o plan |

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
| GET/PATCH | `/api/servicios/[id]` | Ver / actualizar servicio (estado, pagado, convenioId) |

### Planes

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/planes` | Listar / crear planes |
| GET/PATCH | `/api/planes/[id]` | Ver / actualizar plan (estado, cuotasPagadas) |

### Convenios

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/convenios` | Listar / crear convenios |
| GET/PATCH | `/api/convenios/[id]` | Ver / actualizar convenio |

### Configuración

| Método | Ruta | Descripción |
|--------|------|-------------|
| PATCH | `/api/configuracion/general` | Actualizar listas configurables |
| GET/POST | `/api/configuracion/planes` | Listar / crear planes config |
| PATCH | `/api/configuracion/planes/[id]` | Editar plan config |
| GET/POST | `/api/configuracion/servicios` | Listar / crear servicios config |
| PATCH | `/api/configuracion/servicios/[id]` | Editar servicio config |
| GET/POST | `/api/configuracion/templates` | Listar / crear templates de mensajes |

### Inventario

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/inventario` | Listar / crear items |
| GET/PATCH | `/api/inventario/[id]` | Ver / editar item |
| POST | `/api/storage/inventario` | Upload de foto de item a Supabase Storage |

### Comunicaciones

| Método | Ruta | Descripción |
|--------|------|-------------|
| PATCH | `/api/comunicaciones/[id]` | Actualizar estado de comunicación |

### Noticias

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/noticias` | Listar / crear noticias (POST requiere rol admin) |

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
| GET | `/api/portal/certificado/[servicioId]` | Descargar certificado de cremación (PDF — PDFKit) |

### Cron (Vercel Cron Jobs)

| Método | Ruta | Frecuencia | Descripción |
|--------|------|------------|-------------|
| GET | `/api/cron/leads` | Cada hora | Seguimiento y vencimiento de leads |
| GET | `/api/cron/planes` | Diaria | Detección de planes atrasados |

---

## Páginas del CRM

### Autenticación
- `/auth/login` — Login con Supabase SSR

### Dashboard
- `/dashboard` — KPIs: servicios activos, leads nuevos, planes activos, clientes totales, cremaciones en curso, stock bajo

### Clientes
- `/dashboard/clientes` — Lista con búsqueda
- `/dashboard/clientes/nuevo` — Formulario de creación
- `/dashboard/clientes/[id]` — Ficha: datos, mascotas, servicios, planes, noticias del cementerio
- `/dashboard/clientes/[id]/mascotas/nueva` — Nueva mascota para el cliente

### Servicios
- `/dashboard/servicios` — Lista: #, mascota, cliente, tipo, convenio, pago, estado, fecha retiro
- `/dashboard/servicios/nuevo` — Formulario con selector de servicios config + convenio + cálculo automático de precio
- `/dashboard/servicios/[id]` — Detalle: barra de progreso, datos del servicio, cliente, mascota, cambio de estado, estado de pago

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
- `/dashboard/mis-leads` — Vista de trabajo un lead a la vez con cronómetro, WhatsApp popup, email integrado, modal de conversión (servicio o plan)

### Agenda
- `/dashboard/agenda` — Calendario de servicios filtrado por rol

### Comunicación
- `/dashboard/comunicacion` — Templates de mensajes y envío masivo

### Inventario
- `/dashboard/inventario` — Lista con alertas de stock bajo
- `/dashboard/inventario/nuevo` — Crear item
- `/dashboard/inventario/[id]` — Detalle y edición

### Convenios B2B
- `/dashboard/convenios` — Lista de convenios con estados y métricas
- `/dashboard/convenios/nueva` — Crear convenio
- `/dashboard/convenios/[id]` — Detalle: datos, leads derivados, clientes con servicios
- `/dashboard/convenios/editar` — Editar convenio

### Reportes
- `/dashboard/reportes` — Métricas de negocio con gráficos

### Manager (admin/manager)
- `/dashboard/manager/agentes` — Estado del equipo
- `/dashboard/manager/rendimiento` — Métricas por agente
- `/dashboard/manager/reportes` — Reportes del equipo
- `/dashboard/mi-rendimiento` — Vista de rendimiento personal (televenta)

### Configuración
- `/dashboard/configuracion` — Servicios config, planes config, templates, listas, usuarios y permisos, noticias del cementerio
- `/dashboard/configuracion/importar-leads` — Importación masiva desde Excel

### Portal cliente (Fase 2 — parcialmente implementado)
- `/portal/login` — Login con email
- `/portal/activar` — Activación de cuenta con token
- `/portal/[token]` — Home del portal: servicios, planes, mascotas
- `/portal/[token]/memorial/[mascotaId]` — Memorial digital de la mascota
- `/portal/[token]/memorial/[mascotaId]/editar` — Editar dedicatoria y galería de fotos

---

## Componentes relevantes

### Formularios principales

| Componente | Ruta | Descripción |
|------------|------|-------------|
| `NuevoServicioForm` | `components/dashboard/` | Selector de servicios config, convenio, cálculo automático de precio con descuento |
| `NuevoPlanForm` | `components/dashboard/` | Selector de plan config, cliente, mascota (sin convenio) |
| `NuevoClienteForm` | `components/dashboard/` | Datos del cliente |
| `NuevoLeadForm` | `components/dashboard/` | Crear lead manual |
| `NuevoConvenioForm` | `components/convenios/` | Crear convenio B2B |

### Servicios

| Componente | Descripción |
|------------|-------------|
| `ServicioEstadoForm` | Select con 9 estados → PATCH /api/servicios/[id] |
| `ServicioPagoForm` | Toggle de pago → PATCH /api/servicios/[id] |

### Configuración

| Componente | Descripción |
|------------|-------------|
| `EditarServicioConfigInline` | Card editable de servicio config (nombre, precio, tipo, descripcion) |
| `NuevoServicioConfigForm` | Formulario colapsable para crear servicio config |
| `EditarPlanConfigInline` | Card editable de plan config |
| `NuevoPlanConfigForm` | Formulario para crear plan config |
| `GestionPermisosUsuario` | Toggle de permisos adicionales por usuario |
| `NuevaNoticiaForm` | Publicar noticia del cementerio (solo admin) |
| `EditarConfigListaForm` | Editor de listas configurables (tipos, orígenes, especies) |

### Portal

| Componente | Descripción |
|------------|-------------|
| `PortalMascotaCard` | Card de mascota en el portal cliente |
| `PortalServicioEstado` | Estado del servicio en tiempo real (Supabase Realtime) |
| `CertificadoDescarga` | Botón para descargar certificado PDF |

---

## Flujos principales

### Flujo de leads

```
ORIGEN DEL LEAD
│
├── Cotizador online
│   └── POST /api/leads → crearLeadAutomatico() (origen: cotizador)
│
├── Formulario landing
│   └── POST /api/leads → crearLeadAutomatico() (origen: landing)
│
├── Postulación convenio (landing)
│   └── POST /api/convenios/postulacion → convenio estadoConvenio: en_negociacion
│
└── Importación Excel (CRM)
    └── POST /api/leads (bulk) → origen: base_propia

crearLeadAutomatico()
├── ¿Teléfono duplicado? → actualizar ultimaInteraccionEn + agregar nota
└── Lead nuevo → asignarAgente() (round-robin entre televenta) → registrar interacción

GESTIÓN EN MIS-LEADS (agente televenta)
├── Ver lead → cronómetro inicia
├── Contactar por WhatsApp (popup — no sale del CRM)
├── Enviar email (Resend)
├── Cambiar estado del lead
├── Escribir reporte (obligatorio)
└── Guardar → siguiente lead
    └── Si convirtió → modal de conversión → crear cliente + servicio O plan

CRON (/api/cron/leads — cada hora)
├── Interesado +24hs sin actividad → interacción "seguimiento_24hs"
├── Interesado +48hs sin actividad → estado: perdido
├── Nuevo +72hs sin actividad → estado: perdido
└── Perdido +90 días → archivar
```

### Flujo de servicios

```
CREAR SERVICIO
├── Seleccionar cliente → autocompletar mascota
├── Seleccionar tipo de servicio (desde servicios_config)
│   └── Precio base cargado automáticamente
├── Seleccionar convenio (opcional)
│   └── Descuento calculado: precio * descuentoPorcentaje / 100
│   └── Precio final = precio base − descuento
├── Completar fechas, notas
└── Guardar → POST /api/servicios
    └── Guarda: tipo, precio, descuento, convenioId, servicioConfigId, mascotaId

CICLO DE VIDA DEL SERVICIO
ingresado → retiro_pendiente → en_transporte → recibido → en_cremacion → cremado → listo_entrega → entregado
                                                                                                   ↘ cancelado

CAMBIO DE ESTADO (en detalle del servicio)
└── ServicioEstadoForm → PATCH /api/servicios/[id] { estado }
    └── Dispara email al cliente si tiene email (Resend)

GESTIÓN DE PAGO
└── ServicioPagoForm → PATCH /api/servicios/[id] { pagado: true/false }
    └── Muestra en tabla servicios: monto + badge Pagado/Pendiente
```

### Flujo de planes de previsión

```
PLANES CONFIG DISPONIBLES (desde planes_config en DB)
├── Nombre, cuota mensual, descripción configurables en /dashboard/configuracion

COBERTURA ESCALONADA
├── Cuotas 1-6   → 0% cobertura
├── Cuotas 7-12  → 50% cobertura
└── Cuota 13+    → 100% cobertura

Mascota adicional: +50% sobre cuota base

DETALLE DEL PLAN (CRM)
├── Info del cliente, mascota y plan config
├── Cobertura actual calculada por cuotas pagadas
├── Botón "Registrar pago" → cuotasPagadas + 1 + actualiza fechaUltimoPago
└── Total cobrado = cuotasPagadas × cuotaMensual
```

### Flujo de convenios

```
POSTULACIÓN (desde landing)
└── Formulario → POST /api/convenios/postulacion
    └── Crea convenio con estadoConvenio: en_negociacion

GESTIÓN EN CRM (/dashboard/convenios)
├── Ver todas las postulaciones y convenios
├── Cambiar estado: sin_convenio → en_negociacion → activo → pausado
├── Editar descuento (%) y beneficio descriptivo
└── Ver métricas: leads y clientes derivados por convenio

USO EN SERVICIOS
├── Al crear un servicio → selector de convenio activo
├── Si el convenio tiene descuentoPorcentaje → calcula descuento automáticamente
└── Servicio guarda: convenioId + precio + descuento (monto fijo)

USO EN CLIENTES
└── clientes.veterinariaId → convenio de referencia del cliente (para estadísticas)

CONFIGURACIÓN
└── /dashboard/configuracion → "Tipos de convenio"
    └── Lista editable: veterinaria, petshop, refugio, clínica, otro
```

### Flujo del portal cliente (Fase 2)

```
INVITACIÓN
└── Admin en ficha cliente → POST /api/portal/invitar
    └── Genera tokenPortal único → envía email con Resend

ACCESO
├── /portal/activar?token=X → cliente crea contraseña
└── /portal/login → login posterior

PORTAL (/portal/[token])
├── Ver servicios propios con estado en tiempo real (Supabase Realtime)
├── Descargar certificado de cremación (PDF con PDFKit)
├── Ver mascotas y memoriales
└── /portal/[token]/memorial/[mascotaId] → memorial con dedicatoria y galería
    └── /editar → cliente edita dedicatoria y sube fotos
```

---

## Pendientes

### 🔴 Alta prioridad

- [ ] Verificar dominio en Resend para envío de emails a cualquier destinatario (actualmente limitado a emails verificados)
- [ ] Estado "atrasado" en planes — cron `/api/cron/planes` detecta cuotas impagas y actualiza estado

### 🟡 Funcionalidades pendientes

- [ ] Notificación WhatsApp desde plan — template pre-armado para cobrar cuota
- [ ] Asignación de leads por origen — leads de convenio a agente dedicado
- [ ] Comunicación masiva en `/dashboard/comunicacion` — funcionalidad de envío pendiente
- [ ] Módulo de cobranzas con Mercado Pago (permiso `cobranzas` ya existe)
- [ ] Agregar `base_propia` como opción en orígenes de lead (configuración)

### 🟢 Portal cliente (Fase 2 — en progreso)

- [ ] Memorial rediseñado — más emotivo, con mejor layout de galería
- [ ] Certificado de cremación — completar diseño del PDF

### 📋 Datos reales pendientes del cliente

- [ ] Número de WhatsApp real (actualmente `5493XXXXXXXXX`)
- [ ] Dirección física del crematorio
- [ ] Teléfono de contacto
- [ ] Precios y nombres finales de los 3 planes de previsión
- [ ] Fotos del lugar y mascotas
- [ ] Logo final de Huellas de Paz
- [ ] Testimonios de clientes

### 🔒 Seguridad

- [ ] Mover proyectos a team nuevo en Vercel
- [ ] Regenerar `SUPABASE_SERVICE_ROLE_KEY`

### 🚀 Fases siguientes

- [ ] **Fase 3** — Portal B2B para veterinarias (acceso con link único, ver derivaciones y servicios)
- [ ] **Fase 4** — Chatbot IA en la landing (bloqueado hasta completar Fase 3)
- [ ] **Fase 1b restante** — Integración Jaque Mate (exportación contable)

---

## Reglas de desarrollo

- **No hardcodear** listas, tipos o configuraciones — usar `configuracion_general` en DB
- **No crear archivos innecesarios** — verificar en el repo antes de crear algo nuevo
- **No duplicar lógica** — reusar helpers y componentes existentes
- Usar `[skip ci]` en commits que no requieran deploy en Vercel
- El schema de Drizzle es la fuente de verdad para los tipos
- Cambios de schema sin migración Drizzle → aplicar con SQL directo en Supabase y documentar acá
- Los tipos de Drizzle se exportan desde `@/db/schema`
- Todo texto visible al usuario en **español rioplatense argentino**
- Código, comentarios y documentación técnica en inglés
- `veterinarias` es un alias de `convenios` — usar `convenios` en código nuevo
- El campo `clientes.veterinariaId` apunta a `convenios.id` (nombre legado, no renombrar sin migración)
- Planes NO tienen convenio — el descuento de convenio aplica solo a servicios
