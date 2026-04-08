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

- televenta/administración, transporte, cremación, entrega/venta

---

## Política de lenguaje

Todo texto visible al usuario en español rioplatense argentino.
Código, comentarios y documentación técnica en inglés.

---

## Stack de referencia

| Capa | Tool | Scope |
| --- | --- | --- |
| Landing | Astro 6 + TypeScript | landing/ |
| Cotizador | React 18 + Vite | cotizador/ |
| CRM | Next.js 16 App Router + TypeScript | crm/ |
| Chatbot | Next.js 14 + Vercel AI SDK | chatbot/ |
| Styling | Tailwind CSS 4 | Todas |
| ORM | Drizzle ORM | crm/ |
| Database | Supabase (PostgreSQL) | crm/ |
| Auth | Supabase SSR | crm/ |
| Email | Resend + Vercel Cron | crm/ v1 |
| Pagos | Mercado Pago SDK | crm/ |
| AI | Vercel AI SDK + Claude claude-sonnet-4-6 | chatbot/ |
| UI | shadcn/ui | crm/ |
| Hosting | Vercel | Todas |

---

## Fuera de scope (prohibiciones v1)

- Sin integración chatbot <-> CRM en v1
- Sin WhatsApp Business API en v1 del CRM (usa Make/n8n)
- Sin facturación electronica ARCA
- Sin integracion directa con Jaque Mate (solo exportacion)
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
