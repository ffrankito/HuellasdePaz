# CRM v1 — Plan de desarrollo

## Fase 1a — CRM Core (4 semanas)

### Semana 1 — Fundación
- [ ] Setup Next.js 16 + TypeScript
- [ ] Supabase: proyecto, auth, DB
- [ ] Schema: clientes, mascotas, usuarios
- [ ] Login con Supabase SSR
- [ ] Layout base del dashboard (sidebar, nav)
- [ ] Middleware de roles

### Semana 2 — Clientes y mascotas (M1)
- [ ] CRUD clientes
- [ ] CRUD mascotas vinculadas
- [ ] Búsqueda por nombre, teléfono, mascota
- [ ] Vista de perfil con historial

### Semana 3 — Servicios y agenda (M2 + M4 + M9)
- [ ] Schema servicios
- [ ] Alta de servicios (cremación, entierro)
- [ ] Asignación de transportista, cremador, fecha
- [ ] Trazabilidad de 9 estados
- [ ] Calendario operativo por rol

### Semana 4 — Planes y roles (M3 + M5)
- [ ] Schema planes y pagos
- [ ] Alta de planes con 3 tipos
- [ ] Cobertura escalonada 0%/50%/100%
- [ ] Multicuota mascota adicional
- [ ] Vistas diferenciadas por rol
- [ ] Deploy Fase 1a

## Fase 1b — CRM Extendido (4 semanas)

### Semana 5 — Inventario y dashboard (M6 + M7)
- [ ] CRUD productos con stock
- [ ] Alertas de stock bajo
- [ ] Dashboard con métricas en tiempo real

### Semana 6 — Comunicación (M8)
- [ ] Templates editables de WhatsApp y email
- [ ] Triggers automáticos (confirmación, cenizas, aniversario)
- [ ] Historial de mensajes por cliente

### Semana 7 — Cobranzas y atribución (M10 + M11)
- [ ] Integración Mercado Pago
- [ ] Dashboard de cartera y morosos
- [ ] Escalamiento de recordatorios (día 1, 7, 15, 30)
- [ ] Webhook MP para registro automático de pagos
- [ ] Reportes de atribución por canal

### Semana 8 — Documentos y cierre (M12)
- [ ] Certificados de cremación en PDF
- [ ] Comprobantes y órdenes internas
- [ ] Pre-facturas Jaque Mate
- [ ] Endpoint /api/leads para la landing
- [ ] Testing y deploy Fase 1b
- [ ] Capacitación del equipo

## Fase 2 — Portal Cliente (4 semanas)

### Semana 9-10
- [ ] Auth público (magic link)
- [ ] Memorial digital con fotos
- [ ] Seguimiento en tiempo real

### Semana 11-12
- [ ] Pago de cuotas via Mercado Pago
- [ ] Mapa del cementerio
- [ ] Notificaciones WhatsApp
- [ ] Deploy

## Fase 3 — Portal B2B Veterinarias (3 semanas)

### Semana 13-15
- [ ] Auth separado para veterinarias
- [ ] Carga directa de servicios
- [ ] Facturación mensual automática
- [ ] Deploy
