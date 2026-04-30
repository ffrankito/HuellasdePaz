# Plan de profundización arquitectónica — `crm/`

**Fecha del análisis:** 2026-04-30
**Skill aplicada:** `improve-codebase-architecture`
**Alcance:** sólo `crm/` (Next.js 15 App Router). Las apps `landing/`, `cotizador/` y `chatbot/` quedan fuera de este plan.

> Este documento es el resultado de una revisión arquitectónica con foco en **oportunidades de profundización** — refactors que convierten módulos superficiales en módulos profundos. Cada candidato pasa el test de eliminación: si el módulo propuesto desapareciera, la complejidad reaparecería repartida en varios llamadores.
>
> **Vocabulario:** módulo, interfaz, costura (seam), profundidad, localidad, palanca (leverage). Ver `~/.claude/skills/improve-codebase-architecture/LANGUAGE.md`.
>
> **Nota:** este repo no tiene `CONTEXT.md` ni ADRs todavía. Si avanzamos con alguno de estos candidatos, deberíamos ir nombrando los conceptos de dominio en un `CONTEXT.md` a medida que aparecen.

---

## Resumen ejecutivo

| # | Candidato | Friction principal | Prioridad sugerida |
| --- | --- | --- | --- |
| 1 | Módulo de ciclo de vida de `Servicio` | El enum de 9 estados no está validado en ningún lado | Media-alta |
| 2 | Módulo de ciclo de vida de `Lead` | El cron *es* la máquina de estados; no se puede testear | Media |
| 3 | Módulo de pricing y cobertura de `Plan` | Reglas incompletas, +50% mascota adicional no implementado, cobertura escalonada nunca leída | **Alta — corrige bugs** |
| 4 | `convertirLead` como operación transaccional | 5 inserts en una route, sin transacción, sin atomicidad | **Alta — operación crítica** |
| 5 | Capa de repositorios para reads compuestos | Joins repetidos entre páginas y routes | Media-baja (acotado) |
| 6 | Costura de autorización (`requireRole` / `requirePermission`) | 7 roles declarados, casi nunca chequeados | Alta (gap de seguridad) |

**Orden sugerido para implementación:** `3 → 4 → 1 → 2 → 6 → 5`

---

## Candidato 1 — Módulo de ciclo de vida de `Servicio`

### Archivos involucrados
- `crm/src/db/schema/servicios.ts` — declara los 9 estados como `pgEnum`
- `crm/src/app/api/servicios/[id]/route.ts` — `PATCH` acepta `body.estado` sin validación
- `crm/src/app/api/servicios/route.ts` — decrementa stock inline
- `crm/src/app/dashboard/servicios/[id]/page.tsx` — recomputa estado derivado
- Disparo de email en `route.ts:36-53`

### Problema
El ciclo `ingresado → retiro_pendiente → en_transporte → recibido → en_cremacion → cremado → listo_entrega → entregado / cancelado` está declarado como enum de Postgres pero **no se valida en ningún lado**. Cualquier llamador puede hacer `PATCH` de `estado` a cualquier valor. El decremento de stock, el envío de email y la lógica de "qué significa este estado para la UI" viven en archivos distintos.

### Solución
Un módulo `ServicioLifecycle` con una interfaz tipo `transition(servicio, nextEstado, actor)` que retorna o el nuevo estado con efectos colaterales a disparar (email, stock, audit), o un rechazo tipado. Las routes quedan finitas: parsear → llamar → persistir.

### Beneficios
- **Localidad:** todas las reglas sobre "qué le puede pasar a un servicio" viven en un archivo. Estados nuevos o guards aterrizan en un solo lugar.
- **Palanca:** los llamadores (PATCH manual, futuras operaciones bulk, futuros webhooks) reciben las mismas garantías gratis.
- **Tests:** el lifecycle se vuelve la unidad de test — puro, sin DB, sin Resend. Los bugs más difíciles (transiciones ilegales, emails que no se mandan) pasan de "intesteable a través de 4 routes" a "test table-driven".

### Test de eliminación
Si elimino el módulo → las reglas se reparten otra vez en 4+ archivos. **Se gana el sueldo.**

---

## Candidato 2 — Módulo de ciclo de vida de `Lead` (cron como adapter, no como costura)

### Archivos involucrados
- `crm/src/app/api/cron/leads/route.ts` — reglas de aging 24h/48h/72h embebidas en handler de cron
- `crm/src/app/api/leads/[id]/route.ts` — transiciones manuales, también dispara emails
- `crm/src/lib/leads/crearLeadAutomatico.ts` — round-robin (este ya está profundo — dejarlo)

### Problema
El cron **es** la máquina de estados de leads. No hay un módulo "lead lifecycle"; el aging por tiempo vive en el cron, las transiciones manuales viven en la route, y `crearLeadAutomatico` es la única pieza que se extrajo. Reglas como "interesado sin contacto por 48h → perdido" no se pueden testear sin simular un cron HTTP.

### Solución
Un módulo `LeadLifecycle` que exponga `transition(lead, event, now)` donde los eventos son `{ contactado, marcadoInteresado, cotizado, convertido, perdido_por_inactividad }`. El cron pasa a ser un adapter delgado: "para cada lead, computar el evento desde `now - lead.ultimaInteraccion`, llamar transition". La route manual es otro adapter.

### Beneficios
- Lógica basada en tiempo se vuelve testeable sin HTTP.
- La idempotencia del cron se vuelve trivial (`transition` es pura).
- Triggers nuevos (evento de WhatsApp, override manual) se enchufan a la misma costura.

### Test de eliminación
Hoy las reglas viven en cron + routes. Eliminarlas y reemplazarlas con un módulo concentra toda la lógica de aging en un lugar. **Se gana el sueldo.**

---

## Candidato 3 — Módulo de pricing y cobertura de `Plan`

### Archivos involucrados
- `crm/src/app/api/leads/convertir/route.ts:44-49` — math de descuento inline
- `crm/src/app/api/cron/planes/route.ts` — cálculo de cuotas atrasadas
- `crm/src/app/api/reportes/negocio/route.ts:47-49,72-73` — math de pricing distinto
- `planes_config.coberturaEscalonada` (JSONB) — **declarado pero nunca leído**

### Problema
El pricing de planes tiene tres reglas críticas según el brief — cuota base, +50% por mascota adicional, cobertura escalonada (0% → 50% → 100%). Hoy:
- "+50% por mascota adicional" **no está implementado en ningún lado**
- La cobertura escalonada **se guarda pero nunca se consulta**
- El cálculo de descuento está inline en la conversión de leads
- Los reportes recalculan pricing distinto

### Solución
Un módulo `PlanPricing` con `calcularCuota(plan, opciones)` y `coberturaActual(plan, mesAlMomento)` como los únicos lugares donde viven estas reglas. Reportes, conversión de leads, cron y cualquier futuro "¿qué debe este cliente?" pasan por ahí.

### Beneficios
La regla "desde el mes 13 la cobertura es 100%" se vuelve una línea que todos leen. Tiers nuevos o cambios de producto pasan en un archivo. Los reportes dejan de driftear de las cotizaciones.

### Test de eliminación
Las reglas están parcialmente implementadas y parcialmente faltan. Concentrarlas es **una ganancia neta de correctitud, no sólo de estructura.** Este es el candidato donde profundizar también arregla bugs.

---

## Candidato 4 — `convertirLead` como operación transaccional única

### Archivos involucrados
- `crm/src/app/api/leads/convertir/route.ts` — 100+ líneas, 5 inserts, sin transacción

### Problema
El evento de negocio más importante del CRM (lead → cliente + mascota + servicio/plan + interaccion) vive en un handler de route sin atomicidad. Si falla el insert de mascota, el cliente queda huérfano. El decremento de stock pasa después del insert (race). El pricing está inline. No existe una función `convertirLead` — sólo existe la route.

### Solución
Un módulo `convertirLead(lead, decisión)` que envuelva todo en una transacción de Drizzle, llame a `PlanPricing` (Candidato 3), y emita un único evento de dominio. La route se reduce a: parsear body → `convertirLead(...)` → responder.

### Beneficios
- **Atomicidad:** o pasa todo o no pasa nada.
- **Localidad:** el contrato de conversión vive en un lugar. Canales futuros (chatbot Fase 4, portal B2B Fase 3) llaman a la misma función.
- **Tests:** ésta *es* la operación de negocio. Tiene que ser la unidad más testeada del codebase.

### Test de eliminación
Hoy no hay nada para eliminar porque no hay módulo. La route **es** la operación. Extraerla es ganancia pura.

---

## Candidato 5 — Costura de repositorio para reads agregados

### Archivos involucrados
A grandes rasgos, todas las páginas de `dashboard/` y todas las routes de `api/`. Ejemplos:
- `crm/src/app/dashboard/servicios/[id]/page.tsx` — joinea servicio + cliente + mascota + convenio
- `crm/src/app/api/servicios/[id]/route.ts` — el mismo join, hand-rolled de nuevo
- Mismo patrón para leads, planes, clientes

### Problema
Cada lector de "servicio con sus relaciones" hace el join a mano. La forma de la query está duplicada. No hay un lugar para agregar caching, paginación o filtros uniformemente.

### Solución
Módulos de repositorio **acotados** — uno por aggregate root que ya tenga 2+ lugares de lectura duplicados. Empezar sólo con `ServicioRepo` y `LeadRepo`; no construir `ClienteRepo` preventivamente si sus reads son triviales.

### Beneficios
El join vive en un archivo. Paginación / búsqueda / scoping por rol (ver Candidato 6) se enchufan una vez.

### Caveat — y la razón por la que es #5 y no #1
Con Next.js 15 RSC, las capas de repositorio prematuras son un riesgo real. El test de eliminación sólo pasa para aggregates cuyos reads están duplicados **hoy**. Las páginas CRUD triviales se quedan con su `db.select()` inline — todavía no hay módulo.

### Test de eliminación
Para reads de `Servicio` y `Lead` — pasa. Para todo lo demás — falla por ahora (sería prematuro).

---

## Candidato 6 — Costura de autorización (`requireRole` / `requirePermission`)

### Archivos involucrados
- `crm/src/lib/permisos.ts` — existe, pero casi nunca se llama
- `crm/src/middleware.ts:12-14` — explícitamente saltea las routes de `/api`
- `crm/src/app/dashboard/layout.tsx:10-37` — chequea sólo "logueado", sin gating por rol
- Las 46 routes de `/api` — **no chequean auth en absoluto**

### Problema
Hay 7 roles declarados en el schema, el brief dice "transporte ve sólo agenda, cremación ve sólo la cola de cremación", pero **no hay enforcement en ningún lado**. Esto no es un refactor de un módulo superficial — es una costura faltante. Hoy el único gate es "logueado". El riesgo es real: cualquier usuario logueado puede pegar a cualquier API.

### Solución
Un único helper `requireRole(roles[])` / `requirePermission(perm)` que envuelva tanto server components como handlers de routes. Cada route declara su requisito arriba. El sidebar lee de la misma fuente para decidir visibilidad.

### Beneficios
Localidad de la política. Un lugar para decir "transporte puede leer /agenda, puede patchear servicios sólo en `retiro_pendiente`". Compliance y auditoría reciben una costura real para loguear contra.

### Test de eliminación
Hoy no hay nada para eliminar porque la costura no existe. Esto es "construir el módulo faltante" más que "profundizar uno superficial".

### Nota de orden de implementación
Candidato 1 (lifecycle de servicio) y este están entrelazados — `transition()` debería aceptar `actor` y rechazar si el rol del actor no está autorizado para esa transición. Si se eligen ambos, hacer este primero o construirlos juntos.

---

## Lo que deliberadamente NO proponemos (todavía)

- **Unificación de Resend / templates de email.** 4 templates, aislados. Re-evaluar a los 10+.
- **Schemas Zod compartidos en todo el CRM.** Útil, pero es una cuestión de disciplina, no de profundización. Hacerlo a medida que se tocan las routes, no como un refactor masivo.
- **Abstracción de upload de Storage.** 3 casos de uso, todos aislados. Prematuro.
- **Auth dual del portal (token + Supabase).** Esto no es una pregunta de profundización — es una pregunta de diseño. Vale la pena decidir *qué se quiere* antes de extraer un módulo. Conversación de brainstorm / ADR aparte.

---

## Próximos pasos

1. Confirmar el orden sugerido (`3 → 4 → 1 → 2 → 6 → 5`) o ajustar según prioridad de negocio.
2. Para cada candidato que se vaya a tocar, hacer una sesión de **grilling** con el skill `improve-codebase-architecture` para diseñar la interfaz antes de codear.
3. A medida que se nombren conceptos (ej. `ServicioLifecycle`, `PlanPricing`), agregarlos a un `CONTEXT.md` para fijar el vocabulario del dominio.
4. Si se rechaza algún candidato por una razón estructural (no "no me da el tiempo"), escribir un ADR en `docs/adr/` para que futuras revisiones no lo vuelvan a sugerir.
