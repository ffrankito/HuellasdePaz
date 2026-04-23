# Huellas de Paz — Instrucciones para Claude

## Contexto de negocio

Huellas de Paz es el primer crematorio de mascotas con habilitación formal en Rosario, Santa Fe, Argentina. Lleva más de 20 años en el rubro.

Desarrollado por **Ravenna** (Tomás Pinolini + Franco Zancocchia).

### El negocio

- Crematorio y cementerio parque de mascotas en Rosario
- Servicios: cremación individual, cremación comunitaria, Jardín del Recuerdo (parcelas/urnas)
- Planes de previsión con cuotas mensuales y cobertura diferida:
  - **Plan Huellitas** — $90.000/mes — Cremación comunitaria
  - **Plan Compañeros** — $120.000/mes — Cremación individual con entrega diferida
  - **Plan Siempre Juntos** — $140.000/mes — Cremación individual presencial
  - **Jardín del Recuerdo** — $110.000/mes — Urnas y parcelas
  - Cobertura: 0% meses 1-6, 50% meses 7-12, 100% desde mes 13
  - Mascota adicional: +50% sobre la cuota base
- Canal principal: WhatsApp Business (multi-agente con dispositivos vinculados)
- Integración contable: Jaque Mate (exportación, no tiempo real)
- Pagos: Mercado Pago (pendiente implementar)

### Roles en el sistema

| Rol | Descripción |
|-----|-------------|
| `admin` | Acceso total al sistema |
| `manager` | Gestión de equipo, leads, reportes |
| `televenta` | Agentes de ventas, gestión de leads propios |
| `contadora` | Finanzas y cobranzas |
| `cremacion` | Operaciones de cremación |
| `transporte` | Retiro y entrega |
| `entrega` | Entrega de cenizas |

---

## Política de lenguaje

Todo texto visible al usuario en **español rioplatense argentino**.
Código, comentarios y documentación técnica en inglés.

---

## Estructura del monorepo

```
HuellasDePaz/
├── crm/          → CRM interno (Next.js 15)
├── landing/      → Landing page pública (Astro)
├── cotizador/    → Cotizador online (React + Vite)
└── chatbot/      → Chatbot IA (Fase 3 — pendiente)
```

---

## URLs de producción

| Proyecto | URL |
|----------|-----|
| CRM | https://huellasde-paz.vercel.app |
| Landing | https://huellasde-paz-pl2f.vercel.app |
| Cotizador | https://huellasde-paz-cotizador.vercel.app |

---

## Stack técnico

| Capa | Tool | Scope |
|------|------|-------|
| Landing | Astro 6 + TypeScript | landing/ |
| Cotizador | React 18 + Vite | cotizador/ |
| CRM | Next.js 15.3.1 App Router + TypeScript | crm/ |
| Chatbot | Pendiente | chatbot/ |
| Styling | Tailwind CSS 4 + inline styles | crm/ |
| ORM | Drizzle ORM | crm/ |
| Database | Supabase (PostgreSQL) | crm/ |
| Auth | Supabase SSR | crm/ |
| Email | Resend | crm/ |
| Deploy | Vercel | Todas |

---

## CRM — Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=https://ictjxquzsyftmgghjblc.supabase.co
DATABASE_URL=postgresql://postgres.ictjxquzsyftmgghjblc:...@aws-1-us-east-1.pooler.supabase.com:6543/postgres
NEXT_PUBLIC_APP_URL=https://huellasde-paz.vercel.app
RESEND_API_KEY=re_...
```

---

## CRM — Estructura de DB (tablas principales)

| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Equipo interno con roles |
| `clientes` | Clientes con servicios/planes activos |
| `mascotas` | Mascotas de cada cliente |
| `servicios` | Servicios contratados |
| `planes` | Planes de previsión activos |
| `planes_config` | Configuración de planes (nombre, precio) |
| `leads` | Pipeline de ventas |
| `lead_interacciones` | Historial de cada lead |
| `convenios` | Veterinarias, petshops, refugios con convenio |
| `configuracion_general` | Listas configurables del sistema |
| `templates_msg` | Templates de mensajes |

### Notas importantes de DB
- La tabla `convenios` fue renombrada de `veterinarias` con SQL directo en Supabase
- Campo `tipo` en `convenios` es un enum: `veterinaria | petshop | refugio | clinica | otro`
- `planes.cuotas_totales` es nullable (DROP NOT NULL aplicado)
- `planes_config.cuotas_totales` es nullable (DROP NOT NULL aplicado)
- Secuencia `planes_numero_seq` existe en Supabase

---

## CRM — Módulos implementados

### Leads
- Pipeline con estados: `nuevo → contactado → interesado → cotizado → convertido → perdido`
- Asignación automática por round-robin entre agentes `televenta`
- Página `mis-leads` para trabajo de agentes con cronómetro, reporte obligatorio y modal de conversión
- Email directo desde `mis-leads` usando Resend (requiere dominio verificado)
- Cron de seguimiento: leads interesados sin actividad 24hs → notificación, 48hs → perdido
- Historial de interacciones por lead
- Importador Excel (base de datos frías con `origen: base_propia`)

### Clientes
- CRUD completo con mascotas, servicios y planes

### Planes
- Detalle con cobertura escalonada (0% / 50% / 100%)
- Botón "Registrar pago" con confirmación
- API PATCH para actualizar cuotas pagadas

### Convenios
- CRUD completo (antes llamado "veterinarias")
- Tipos configurables desde `/dashboard/configuracion`
- Métricas: leads y clientes derivados por convenio

### Configuración
- Planes de previsión editables
- Templates de mensajes
- Listas configurables: tipos_servicio, origenes_lead, especies_mascota, tipos_convenio
- Gestión de permisos por usuario
- Importar leads desde Excel

---

## Cotizador — Flujo de pasos

1. Tipo de mascota (canino, felino, otro)
2. Tamaño (solo para caninos — felinos y otros saltan este paso)
3. Servicio (Plan Huellitas, Plan Compañeros, Plan Siempre Juntos, Jardín del Recuerdo)
4. Método de retiro
5. Entrega de cenizas
6. Zona (solo si eligió domicilio)
7. Datos de contacto
8. Pantalla de éxito + botón WhatsApp

Mascotas sin talla: `felino`, `mamifero-pequeno`, `reptil`, `ave-pez`

---

## Landing — Secciones

- Hero con imagen de fondo, CTA WhatsApp y badges de confianza
- Franja de métricas (+20 años, 100% habilitado, 24hs, ❤️)
- Servicios (cremación individual, comunitaria, Jardín del Recuerdo)
- Planes (4 planes con precios reales)
- Cotizador embebido
- Contacto (formulario → API leads del CRM)
- Footer

**Datos pendientes del cliente:**
- Dirección física del crematorio
- Número de WhatsApp real (actualmente `5493XXXXXXXXX`)
- Teléfono de contacto
- Fotos del lugar
- Logo final

---

## Pendientes técnicos

### 🔴 FASE 2 — CRM (alta prioridad)

1. **Resend dominio verificado** — configurar dominio real para envío de emails
2. **Importador Excel** — separar nombre/apellido, guardar localidad en mensaje, `origen: base_propia`
3. **Agregar `base_propia` a los orígenes** en `OrigenLead` type y configuración
4. **Asignación de leads por origen** — leads calientes a agente dedicado
5. **Estado "atrasado" en planes** — cuando el cliente no pagó la cuota del mes
6. **Portal del cliente** — memorial, galería de fotos, certificado PDF, estado en tiempo real

### 🟡 FASE 3 — CHATBOT IA LANDING

- Widget embebible, flujo conversacional, conexión al CRM, horario de atención

### 🟠 FASE 4 — PORTAL B2B CONVENIOS (pendiente definir flujo)

- Acceso con link único, dashboard métricas, ingreso leads, reporte mensual

### 🟢 FASE 5 — COBRANZAS Y PAGOS

- Mercado Pago, recordatorios WhatsApp, registro de pagos

### 🔒 SEGURIDAD

- Mover los 3 proyectos a un team nuevo en Vercel
- Regenerar `SUPABASE_SERVICE_ROLE_KEY`

---

## Reglas de desarrollo

- **No hardcodear** listas, tipos o configuraciones — usar `configuracion_general` en DB
- **No crear archivos innecesarios** — verificar siempre en el repo antes de crear algo nuevo
- **No duplicar lógica** — reusar helpers y componentes existentes
- Usar `[skip ci]` en commits que no requieran deploy en Vercel
- El schema de Drizzle es la fuente de verdad — las migraciones de DB que no estén en Drizzle se aplican con SQL directo en Supabase
- Los tipos de Drizzle se exportan desde `@/db/schema`
- Resend en modo gratuito solo envía a `zfi1811@gmail.com` hasta que se verifique un dominio