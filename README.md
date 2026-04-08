# Huellas de Paz — Plataforma Digital

Software product para Huellas de Paz — el primer crematorio de mascotas con habilitación formal en Rosario. Monorepo con 4 apps independientes.

Desarrollado por **Ravenna**.

---

## Apps

| App | Stack | Descripción | README |
| --- | --- | --- | --- |
| `landing/` | Astro 6, Tailwind CSS 4 | Landing page de captación | [→ landing/README.md](./landing/README.md) |
| `cotizador/` | React 18, Vite | Cotizador online embebible en Wix | [→ cotizador/README.md](./cotizador/README.md) |
| `crm/` | Next.js 16, Drizzle, Supabase | Sistema operativo interno | [→ crm/README.md](./crm/README.md) |
| `chatbot/` | Next.js 14, Vercel AI SDK, Claude | Asistente virtual IA (Fase 4) | [→ chatbot/README.md](./chatbot/README.md) |

Cada app es independiente. Se configuran y corren por separado.

---

## Roadmap general

| Fase | App | Entregable | Timeline |
| --- | --- | --- | --- |
| Fase 0 | `landing/` + `cotizador/` | Landing live + cotizador embebible | 2 semanas |
| Fase 1a | `crm/` | CRM core operativo | 4 semanas |
| Fase 1b | `crm/` | CRM extendido con cobranzas y automatizaciones | 4 semanas |
| Fase 2 | `crm/` | Portal cliente con memorial digital | 4 semanas |
| Fase 3 | `crm/` | Portal B2B veterinarias | 3 semanas |
| Fase 4 | `chatbot/` | Asistente virtual IA | A definir |
