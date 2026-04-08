# CRM v1 — Especificación técnica

## Stack

| Capa | Tool |
| --- | --- |
| Framework | Next.js 16 App Router + TypeScript |
| Styling | Tailwind CSS 4 + shadcn/ui |
| ORM | Drizzle ORM |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase SSR |
| Email | Resend + Vercel Cron |
| Pagos | Mercado Pago SDK |
| Hosting | Vercel |

## Schema principal

### clientes
| Campo | Tipo | Notas |
| --- | --- | --- |
| id | text PK | Prefijo: cli_ |
| nombre | text | |
| telefono | text | WhatsApp principal |
| email | text | Opcional |
| canal_origen | text | instagram, facebook, google, veterinaria, directo |
| veterinaria_id | text FK | Si vino referido |

### mascotas
| Campo | Tipo | Notas |
| --- | --- | --- |
| id | text PK | Prefijo: mas_ |
| cliente_id | text FK | |
| nombre | text | |
| especie | text | perro, gato, conejo, etc. |
| raza | text | Opcional |
| fecha_fallecimiento | date | Opcional |

### servicios
| Campo | Tipo | Notas |
| --- | --- | --- |
| id | text PK | Prefijo: srv_ |
| cliente_id | text FK | |
| mascota_id | text FK | |
| tipo | text | cremacion_individual, cremacion_comunitaria, entierro |
| estado | text | Ver 9 estados abajo |
| transportista_id | text FK | |
| cremador_id | text FK | |

**Estados:** solicitud_recibida → retiro_coordinado → en_transporte → recibido_crematorio → en_cremacion → cenizas_listas → en_transporte_entrega → entregado → cerrado

### planes
| Campo | Tipo | Notas |
| --- | --- | --- |
| id | text PK | Prefijo: pln_ |
| cliente_id | text FK | |
| mascota_id | text FK | |
| tipo_plan | text | plan_1, plan_2, plan_3 |
| cuota_mensual | numeric | En pesos |
| estado | text | activo, moroso, cancelado, utilizado |
| mascotas_adicionales | int | |

### pagos
| Campo | Tipo | Notas |
| --- | --- | --- |
| id | text PK | Prefijo: pag_ |
| plan_id | text FK | |
| monto | numeric | |
| fecha_vencimiento | date | |
| estado | text | pendiente, pagado, vencido |
| mp_payment_id | text | |
| mp_link | text | Link de pago MP |

### leads
| Campo | Tipo | Notas |
| --- | --- | --- |
| id | text PK | Prefijo: led_ |
| nombre | text | |
| telefono | text | |
| canal_origen | text | UTM source |
| estado | text | nuevo, contactado, convertido, descartado |

## API routes

| Método | Path | Auth |
| --- | --- | --- |
| POST | /api/leads | Público (desde landing) |
| POST | /api/pagos/mp-webhook | MP signature |
