# Revisión arquitectónica fundacional — Huellas de Paz

**Fecha:** 2026-04-30
**Alcance:** monorepo completo (`landing/`, `cotizador/`, `crm/`, `chatbot/`).
**Lente:** foundations, no módulos. Esta revisión asume que ya existe el plan de profundización en `docs/proyecto/architecture-deepening-plan.md` y deliberadamente no repite ese trabajo.
**Punto de partida honesto:** las fundaciones de este sistema son sorprendentemente sanas para un proyecto de un solo dev en producción. Hay tres agujeros estructurales reales y una pila de cosas que parecen problemas pero no lo son al volumen actual.

---

## 1. Diagnóstico actual

El "monorepo" es un directorio con cuatro apps independientes y un `package.json` raíz que sólo tiene PDFKit y Puppeteer. No hay workspaces de pnpm, no hay Turborepo, no hay un `packages/` compartido. Cada app tiene sus propias dependencias y se despliega como un proyecto separado de Vercel:

- `landing/` — Astro 5 + Tailwind 4. Estática.
- `cotizador/` — React 18 + Vite. Embebida como iframe en Wix. El stack es inconsistente con el resto pero la app es chica (`cotizador/src/pages` + `components` + `data`, todo formularios).
- `crm/` — Next.js 15 + React 19 + Drizzle + Supabase. Esto es el corazón del sistema. Aloja **cuatro audiencias en una sola app**: el dashboard interno (`/dashboard/*`), el portal de clientes (`/portal/[token]`), el portal de convenios (`/portal/convenio/[token]`) y el memorial público (`/memorial/*`).
- `chatbot/` — vacío. Fase 4.

Dentro de `crm/`, el mapa real es:

- **Schema:** 11 archivos Drizzle (`crm/src/db/schema/*.ts`) — `clientes`, `mascotas`, `servicios`, `planes`, `leads`, `usuarios`, `convenios`, `inventario`, `configuracion`, `asistente`. Las relaciones están bien tipadas. El nombre histórico "veterinarias" sigue exportado como alias en `crm/src/db/schema/veterinarias.ts:46-47`.
- **API:** 46 routes bajo `crm/src/app/api/`. CRUD plano, sin capa de servicios.
- **UI:** páginas RSC bajo `crm/src/app/dashboard/`, `crm/src/app/portal/`, `crm/src/app/memorial/` que leen Drizzle directo.
- **Lib:** `crm/src/lib/` tiene `supabase/`, `email/`, `leads/crearLeadAutomatico.ts`, `permisos.ts`, `cors.ts`, `utils/`. Es la única semilla de "dominio" que existe.
- **Auth:** Supabase Auth para staff vía `crm/src/middleware.ts`. El middleware **explícitamente saltea `/api/*` y `/portal/*`** (líneas 7-15). Cada API route es responsable de su propio gate, y la mayoría no lo hace.
- **Migraciones:** `crm/supabase/migrations/` tiene archivos `0000`–`0019`. El journal `_journal.json` se detiene en `0009`. Existen **tres archivos `0013_*` distintos** (`0013_importaciones_leads.sql`, `0013_leads_dni.sql`, `0013_para_venta.sql`) que fueron aplicados manualmente fuera del journal.

Patrones de auth en el portal y el dashboard (relevante para Fase 3):

- **Cliente final:** entrada por URL con UUID en `clientes.tokenPortal` + opcionalmente Supabase Auth via `clientes.authUserId`. Doble vía.
- **Convenio (Fase 3):** `convenios` ya tiene `tokenPortal`, `portalActivo`, `authUserId` (`crm/src/db/schema/veterinarias.ts:35-37`). Las páginas `crm/src/app/portal/convenio/[token]/page.tsx` y `/portal/convenio/login` ya existen, validan que `user.id === convenio.authUserId`, y leen leads filtrados por `leads.veterinariaId`. **Fase 3 no es un green-field.** El esqueleto está, falta carne.
- **Staff:** Supabase Auth únicamente, gateado en server components vía `dashboard/layout.tsx`. Los 7 roles existen como `pgEnum` en `crm/src/db/schema/usuarios.ts:3-11`, hay 4 permisos extra en `PERMISOS`, y un único helper `tienePermiso()` en `crm/src/lib/permisos.ts`. El helper se usa para mostrar/esconder UI; **no se usa para gatear API**.

El conteo concreto: de 46 routes, sólo 12 leen `supabase.auth.getUser()`. Las demás — incluidas `GET /api/clientes`, `GET /api/leads`, `POST /api/servicios`, `POST /api/leads/convertir`, `GET|POST /api/convenios` — son completamente públicas para cualquiera que conozca la URL.

---

## 2. Riesgos estructurales (rankeados)

### R1 — La superficie API está sin auth y se conecta a una segunda audiencia (Fase 3) en cuestión de semanas. **Cuándo muerde: ahora, peor en Fase 3.**

`crm/src/middleware.ts:13-15` saltea `/api`. Hoy esto pasa desapercibido porque el frontend único (dashboard) sólo lo llama desde sesiones autenticadas; pero la API es accesible desde cualquier origen que pase CORS. Cuando el portal de convenios tenga sus propios endpoints (postear leads, ver comisiones, ver el listado de clientes referidos), el modelo "todo el mundo logueado puede pegarle a todo" colapsa: un convenio podría leer leads de otro, o un cliente podría escribir su propio plan a `pagado: true`.

Esto está parcialmente reconocido en el plan de profundización (Candidato 6), pero ahí lo trata como deuda técnica del CRM. En realidad es una decisión fundacional: **¿la API es la frontera de seguridad o no lo es?** Hoy, no lo es. Antes de Fase 3 tiene que serlo.

### R2 — El journal de Drizzle no refleja el estado real de la DB. **Cuándo muerde: la próxima vez que hagas `drizzle-kit generate`.**

`crm/supabase/migrations/meta/_journal.json` termina en `0009`. Los archivos `0010_*` a `0019_*` son SQL manual aplicado a Supabase pero invisibles para drizzle-kit. Tres tags `0013_*` compiten. El comentario en `CLAUDE.md` dice "no usar `drizzle-kit push` porque detecta columnas eliminadas" — eso no es una solución, es una bandera roja. El próximo `drizzle-kit generate` o `migrate` va a producir o un diff falso o un duplicado de columna.

Esto no es catastrófico hoy porque sos un solo dev y conocés el estado real, pero **tiene que arreglarse antes de que entre el código de Fase 3 a tocar el schema** (postulaciones de convenio, pricing de planes, comisiones B2B). El día que un colaborador o vos mismo en seis meses corra `db:generate`, vas a perder horas reconciliando.

### R3 — La drift entre docs y código está empezando. **Cuándo muerde: ya muerde.**

`CLAUDE.md` y el plan de profundización describen el ciclo de servicios como `ingresado → retiro_pendiente → en_transporte → recibido → en_cremacion → cremado → listo_entrega → entregado / cancelado` (9 estados). El enum real en `crm/src/db/schema/servicios.ts:8-14` tiene **5 estados**: `pendiente, en_proceso, listo, entregado, cancelado`. Lo mismo el deepening plan habla de "el cron *es* la máquina de estados de leads" — eso sigue siendo cierto.

Si alguien (incluido un agente) lee CLAUDE.md y modela una transición sobre 9 estados, el código no compila. Si un ADR futuro fija decisiones sobre 9 estados, queda inválido la próxima vez que mires el schema. Esto no es un bug fundacional — pero es la señal de que el proyecto creció sin un único lugar verdadero para el estado del dominio. La fundación no es el código del lifecycle; la fundación es **¿dónde vive el contrato del dominio?**

### R4 — No hay capa de aplicación. Las routes son la aplicación. **Cuándo muerde: en Fase 3 y Fase 4.**

`crm/src/app/api/leads/convertir/route.ts` es 100 líneas con cinco inserts, cálculo de pricing inline y decremento de stock no transaccional. El plan de deepening lo enumera como Candidato 4. La pregunta fundacional es más amplia: hoy, **la única forma de "convertir un lead" es hacer un POST a esa URL específica desde un browser logueado**. Cuando llegue:

- el portal de convenios queriendo crear un lead atribuido (Fase 3),
- el chatbot público queriendo cotizar y eventualmente convertir (Fase 4),
- el webhook de Mercado Pago queriendo confirmar pago y desbloquear cobertura del plan,

todos van a tener que duplicar la lógica o re-llamar el endpoint HTTP-a-HTTP-mismo-server. Las Server Actions de Next 15 alivian un poco esto, pero no resuelven la pregunta de **dónde vive la operación de negocio** independientemente del transport.

Esto NO significa "construir DDD con onion architecture". Significa: extraer las **3-4 operaciones de negocio críticas** (`convertirLead`, `transicionarServicio`, `registrarPagoCuota`, `crearPostulacionConvenio`) a funciones puras en `crm/src/lib/dominio/` que cualquier route, cualquier action, cualquier webhook pueda llamar. El módulo es la operación, no la entidad.

### R5 — Ningún test, ningún audit trail, ninguna observabilidad. **Cuándo muerde: cuando entre dinero real (MP) o cuando un convenio te discuta una atribución.**

Esto es el típico "fine-for-later" excepto por dos casos puntuales que dejan de ser opcionales:

- **Mercado Pago.** Webhooks duplicados son la regla, no la excepción. Sin idempotencia ni log, vas a doblar pagos. Esto **no puede** entrar a producción sin un audit trail mínimo de eventos de pago.
- **Atribución de convenios.** Cuando una veterinaria diga "mandé 8 leads, ustedes me cuentan 6", necesitás `lead_interacciones` o un log equivalente que pruebe el origen y la timeline. Hoy `lead_interacciones` existe pero no se llena automáticamente en todas las transiciones.

Tests unitarios y observabilidad full pueden esperar. Audit trail de pagos y de atribución, no.

### R6 — El "monorepo" no es un monorepo. **Cuándo muerde: cuando el cotizador y la landing tengan que compartir tipos con el CRM (ya).**

El cotizador postea a `/api/leads` con un payload que **no comparte tipos** con `Lead` ni con la validación del CRM. El landing's form hace exactamente lo mismo, distinto. Si mañana cambia el contrato (agregar `tipoMascota`, `peso`, `urgencia`), hay que tocar 3 repos a mano. No hay un `packages/contracts/` con el `LeadInputSchema` de Zod compartido.

Esto es una herida menor hoy (el contrato es chico, sos un solo dev), pero es exactamente el tipo de cosa que **se vuelve cara cuando incorpores ayuda** o cuando agregues la cuarta superficie (chatbot Fase 4).

---

## 3. Cambios fundacionales recomendados ANTES de Fase 3

Estos son los que **tienen que pasar antes de meter el portal de convenios en serio**, ordenados por costo/beneficio.

### 3.1 — Hacer la API la frontera de seguridad (resuelve R1)

Una decisión, dos pasos. Decisión: **toda route bajo `/api/*` requiere auth, salvo una whitelist explícita** (`POST /api/leads`, `POST /api/convenios/postulacion`, `OPTIONS /*`). Pasos:

1. Mover el gate al middleware: `crm/src/middleware.ts` deja de saltear `/api`, e incluye una whitelist corta. Las routes públicas (cotizador, landing, postulación) entran en la whitelist.
2. Inventar un único helper `requireActor(request)` que devuelva `{ tipo: 'staff', usuario, rol } | { tipo: 'cliente', clienteId } | { tipo: 'convenio', convenioId } | null`. La fuente del actor es Supabase Auth + el `tokenPortal` de la URL para portales.

Costo: 1-2 días, cambio mecánico. Beneficio: cuando llegue el primer endpoint de Fase 3 (`POST /api/portal/convenio/leads`), tenés un patrón ya establecido y no hay que diseñar la frontera al mismo tiempo que la feature.

### 3.2 — Reconciliar el journal de Drizzle con la DB (resuelve R2)

Tres pasos:

1. Decidir cuál es el estado real de cada `0013_*` (probablemente todos están aplicados; verificalo con `\dt+` en Supabase).
2. Recrear el journal: agregar entradas para `0010` a `0019` con timestamps consistentes y nombres consolidados. Renombrar archivos para que no haya duplicados.
3. Hacer un snapshot manual con drizzle-kit para que el próximo `generate` parta de la verdad actual.

Costo: medio día. Beneficio: el día que necesites generar la migración 0020 (probable: índices para queries de Fase 3), ya no es una arqueología.

### 3.3 — Una capa `lib/dominio/` con las 3 operaciones críticas (resuelve R4 y prepara R5)

Sólo extraer lo que **ya tiene más de un caller potencial inmediato**:

- `convertirLead(input, actor)` — usado por dashboard, portal de convenios (Fase 3 va a querer convertir desde el portal o desde un webhook).
- `transicionarServicio(servicioId, evento, actor)` — usado por dashboard, eventualmente por la app de operaciones móvil (transporte, cremación, entrega).
- `registrarPagoCuota(planId, monto, fuente)` — usado por webhook de MP y por carga manual de la contadora.

El resto (CRUD plano de inventario, configuración, etc.) se queda inline. **No construyas un repository pattern preventivo.** El test de eliminación lo descarta para todo lo que no tenga 2+ callers reales hoy.

Costo: 2-3 días, en paralelo con el deepening plan que ya identifica estas mismas operaciones. Beneficio: Fase 3 y la integración de MP llaman a la misma función que el dashboard. No hay fork de lógica.

### 3.4 — Un `packages/contracts/` mínimo con el schema de leads (resuelve R6, parcialmente)

No convertir todo en Turborepo. Apenas:

- Crear `packages/contracts/leads.ts` con `LeadInputSchema` (Zod) y los tipos derivados.
- Que `landing/`, `cotizador/` y `crm/` lo importen vía path relativo o symlink (`pnpm link`/`file:../packages/contracts`).
- Punto.

Costo: 1 día. Beneficio: la próxima vez que cambies el contrato de `POST /api/leads`, hay un solo archivo a tocar. Esto es el 80% del valor de un monorepo real al 5% del costo.

---

## 4. Cambios estructurales que pueden esperar

- **Convertir a Turborepo o pnpm workspaces "de verdad".** No vale la pena hasta que tengas más de un colaborador o más de dos paquetes compartidos. El paso 3.4 es el preludio; promovelo a workspace cuando duela.
- **Repository pattern formal.** El plan de deepening lo lista como #5 con razón. Las páginas RSC con `db.select()` inline son idiomáticas en Next 15. No abstraer hasta que el join se duplique en 3+ lugares **realmente leídos por código distinto**.
- **Tests unitarios.** Sí, eventualmente. Empezar **por las operaciones de `lib/dominio/`** cuando existan (paso 3.3). Vitest, una suite, los tres casos críticos: `convertirLead` (incluyendo rollback transaccional), `transicionarServicio` (transiciones legales/ilegales), `registrarPagoCuota` (idempotencia). 50 tests resuelven el 90% del riesgo.
- **Observabilidad full (Sentry, OTEL).** Vercel logs alcanza para esta escala. Cuando entre MP, agregar Sentry con un free tier y enrutado de errores de webhooks específicamente.
- **Separar el portal de convenios y el dashboard en proyectos distintos de Vercel.** Tentador "por separación de blast radius" pero introduce CORS, sesiones cruzadas y duplicación de schema. **No lo hagas.** Una sola app de Next con route groups (`(staff)/`, `(portal-cliente)/`, `(portal-convenio)/`, `(public)/`) y middleware que despache es la respuesta correcta para esta escala.
- **Memorial público como app separada.** Es el único lugar con estética oscura distinta y caching agresivo de SEO. Tampoco lo separes — es 4 páginas.

---

## 5. Decisiones que vale la pena registrar como ADR

Crear `docs/adr/` y bajar estas siete preguntas, con tu recomendación. No los ADRs completos — sólo el contrato.

| # | Pregunta | Recomendación |
| --- | --- | --- |
| ADR-001 | ¿Monorepo formal (Turborepo/pnpm workspaces) o seguir con apps independientes? | **Independientes + un `packages/contracts/` chico para tipos de la API pública.** Promover a workspace cuando entre el segundo dev. |
| ADR-002 | ¿La API es la frontera de seguridad? | **Sí.** Middleware gatea `/api/*` salvo whitelist. Helper único `requireActor()` para staff/cliente/convenio. |
| ADR-003 | ¿Una sola app de Next o múltiples superficies? | **Una sola.** Route groups `(staff)`, `(portal-cliente)`, `(portal-convenio)`, `(public)`. Auth y layout por grupo. |
| ADR-004 | ¿Capa de dominio (`lib/dominio/`) o código directo en routes? | **Capa fina, sólo operaciones con múltiples callers reales.** Descartar repository pattern preventivo. |
| ADR-005 | ¿Modelo de auth unificado para staff, cliente y convenio? | **Un Supabase Auth project, tres tipos de actor.** Rol/permisos por tabla (`usuarios.rol`, `clientes.authUserId`, `convenios.authUserId`). Sin RLS hasta que haya razón. |
| ADR-006 | Estrategia de migraciones: ¿Drizzle journal o SQL manual? | **Journal autoritativo.** Reconciliar hoy. Manual sólo en casos imposibles para drizzle-kit, y siempre agregar entrada al journal a mano. |
| ADR-007 | ¿El asistente IA del CRM y el chatbot público comparten algo? | **Sólo la base de conocimiento (`lib/asistente/docs.ts` o equivalente).** Tools, presupuestos y rate limits son independientes — son audiencias distintas con riesgos distintos. |

---

## 6. Cosas que NO recomiendo cambiar

Vale más decirlas explícitamente porque "se ven" como problemas pero no lo son al volumen y team size actuales:

- **El stack de Next 15 + Drizzle + Supabase + shadcn.** Es coherente, está al día, lo conocés. Cambiarlo cuesta meses, no resuelve nada.
- **La auth dual del cliente final** (`tokenPortal` en URL + Supabase Auth opcional). Es exactamente la mecánica correcta para la audiencia: el dueño que recibió el link por WhatsApp **no quiere registrarse**, y los pocos que sí quieren features avanzadas pueden hacerlo. La complejidad está justificada.
- **El alias `veterinarias = convenios`** en el schema. Tentador limpiarlo. No lo hagas hasta que rompa algo concreto. Es 4 líneas de código y mucho riesgo de tocar todo el codebase para nada.
- **Que Drizzle viva en `crm/`**, no en un paquete compartido. Hasta que el cotizador o el chatbot necesiten leer la DB directo (no van a, van a llamar API), no vale la pena.
- **Que el cotizador siga en React 18 + Vite mientras el CRM usa React 19.** Son apps independientes, no comparten bundle. El día que las consolides, alineá. Hoy no.
- **Server actions vs API routes.** El proyecto eligió API routes. Funciona. No migres por moda.
- **El mapa-demo y mapa-editor en `crm/src/app/`** — si son experimentos, dejalos hasta que estorben. Si son production, ignoro qué hacen y deberían estar documentados, pero esa es una conversación de docs, no de fundación.

---

## 7. Preguntas abiertas para Tomás

Estas no las puedo responder yo. Son llamados que dependen del negocio o del apetito que tengas vos.

1. **Horizonte del rebuild de auth.** ¿Estás dispuesto a quemar 2-3 días en Sección 3.1 antes de empezar Fase 3, o querés meter la primera funcionalidad de Fase 3 ya y deudar la auth? La respuesta correcta depende de si Fase 3 va a tocar producción con datos reales de convenios o es soft launch.
2. **Pricing de planes.** El deepening plan dice que `+50% mascota adicional` no está implementado y que `coberturaEscalonada` se guarda pero no se lee. ¿Eso es porque el cliente no decidió las reglas finales, o porque vos no llegaste a implementarlas? Si lo primero: bloqueá Fase 3 hasta tener las reglas definitivas, porque el portal de convenios va a mostrar precios. Si lo segundo: podés implementarlo ya con reglas placeholder y cambiar después.
3. **¿Webhooks de MP llegan al CRM o a una worker aparte?** Hoy todo vive en Next routes. Webhooks de MP en Vercel funcionan pero comparten cold start con tu UI. A esta escala da igual. La pregunta es si querés *desde ahora* tener un patrón "los efectos asincrónicos viven en un worker" (incluso si el worker es otra route con `runtime: 'nodejs'`), o si te aguanta el modelo "todo serverless, todo en un proyecto".
4. **¿Quién es el dueño operativo del audit trail?** Si MP entra a producción y un cliente reclama que pagó dos veces, ¿quién investiga? ¿Vos? ¿La contadora? Define el rol y eso te dice qué nivel de detalle necesita el log y dónde tiene que vivir.
5. **Time horizon de "20+ años" en términos prácticos.** ¿Significa que en 5 años espera tener 50 empleados y 10x el volumen? ¿O significa que el negocio físico va a estar abierto 20 años pero el sistema digital sirve a la misma operación chica? Las dos son válidas; las decisiones son distintas. Por defecto asumo lo segundo — un sistema chico que dura mucho — y por eso recomiendo "no rearquitectures preventivamente". Si es lo primero, varias de las "esperas" pasan a "ahoras".
6. **¿Hay apetito para introducir tests ahora o no?** No es una pregunta técnica. Si la respuesta es "no, prefiero shippear", está bien — pero entonces el módulo de dominio del paso 3.3 tiene que ser **especialmente** simple, porque es código de negocio sin red de seguridad.

---

## Cierre

Las fundaciones están sanas. El proyecto se ve como debe verse después de un año de un solo dev shippeando: schema bien modelado, app única que aloja varias audiencias con criterio, auth de portales bien resuelta, capa de dominio incipiente.

Los tres agujeros reales son **auth en la API, journal de migraciones, y la falta de una mini capa de dominio para las operaciones críticas** — y los tres se solucionan en una semana de trabajo focalizado antes de Fase 3. Todo el resto es pulido que puede esperar.

La trampa a evitar: rearquitecturar "porque viene Fase 3". El portal de convenios no es una app nueva, es **una audiencia más** sobre el mismo dominio. Tratalo como tal.
