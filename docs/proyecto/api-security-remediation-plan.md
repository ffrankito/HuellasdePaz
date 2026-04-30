# Plan de remediación de seguridad de la API

**Fecha del audit:** 2026-04-30
**Alcance:** routes bajo `crm/src/app/api/`, con foco en autenticación, autorización y exposición de PII.
**Estado del proyecto:** Cotizador y landing en producción (Fase 0 ✅). CRM implementado pero no usado a escala todavía. Es el momento más barato para arreglar.

> Este documento es **táctico**. Lista los endpoints inseguros uno por uno con file:line, riesgo concreto, parche mínimo y verificación. Para la decisión arquitectónica de fondo (mover el gate al middleware, helper `requireActor`, capa `lib/dominio/`), ver:
>
> - `docs/proyecto/foundational-architecture-review.md` — sección 3.1 ("Hacer la API la frontera de seguridad")
> - `docs/proyecto/architecture-deepening-plan.md` — Candidato 6 ("Costura de autorización")
>
> Este plan **no reemplaza** esos refactors — los habilita. Primero parchamos los leaks activos, después construimos el seam definitivo.

---

## 1. Resumen ejecutivo

| # | Endpoint | Hallazgo | Severidad | Tiempo estimado |
|---|----------|----------|-----------|-----------------|
| H1 | `GET /api/leads` | Sin auth — devuelve nombre, teléfono, email, DNI, mensaje, agente | 🔴 Alta | 30 min |
| H2 | `GET /api/convenios` | Sin auth, CORS `*`, expone descuentos negociados y emails | 🔴 Alta | 20 min |
| H3 | `POST /api/convenios` | Sin auth — cualquiera crea convenios fake en la base | 🔴 Alta | (incluido en H2) |
| H4 | `/api/portal/certificado/[id]` | Token va en query string → leakea por logs/Referer | 🟡 Media | 1 h |
| H5 | `clientes.tokenPortal` sin expiración | Token permanente, no rotable | 🟡 Media | 4 h (DB + UI) |
| H6 | Otros endpoints sin auth (`/api/clientes`, `/api/servicios`, `/api/leads/convertir`) | Confirmado por foundational review §1 — 34 de 46 routes sin `auth.getUser()` | 🔴 Alta | resuelto en F2 |
| ✅ | `/api/cron/*` | Validan `Bearer ${CRON_SECRET}` correctamente | OK | — |
| ✅ | `/api/portal/mascotas/[id]` | Valida ownership por `(mascotaId, clienteId)` — previene IDOR | OK | — |

**Conclusión:** hay PII real fluyendo a un endpoint público (`GET /api/leads`). El parche mínimo se aplica en horas. La solución estructural (middleware + `requireActor`) es el siguiente paso, descrito en `foundational-architecture-review.md`.

---

## 2. Hallazgos detallados

### H1 — `GET /api/leads` no valida autenticación

**Archivo:** [`crm/src/app/api/leads/route.ts:41-90`](../../crm/src/app/api/leads/route.ts)

**Comportamiento actual:**

```ts
export async function GET(request: NextRequest) {
  const corsHeaders = getCorsHeaders(...)
  const { searchParams } = new URL(request.url)
  const agenteId = searchParams.get('agenteId')
  const misLeads = searchParams.get('misLeads')

  let userId: string | null = null

  if (misLeads === 'true') {           // ← ÚNICO lugar donde se mira la auth
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    userId = user?.id ?? null          // ← si no hay user, sigue siendo null
  }
  // continúa y devuelve la query completa sin frenar nada
```

**Por qué es crítico:** el cotizador está vivo en producción. Hay leads reales con DNI, teléfono y email entrando ahora mismo. El endpoint es accesible con `curl https://huellasde-paz.vercel.app/api/leads` desde cualquier máquina. CORS no protege contra esto (CORS solo aplica a requests originadas en un browser desde otro dominio).

**Parche mínimo (Fase 1):**

1. Agregar guard al inicio del GET:
   ```ts
   const supabase = await createClient()
   const { data: { user } } = await supabase.auth.getUser()
   if (!user) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
   }
   ```
2. Mantener `POST` público (cotizador/landing dependen de eso).
3. Mantener filtros `misLeads` y `agenteId` pero ahora operan sobre un user autenticado.
4. Bonus: si `agenteId` se pasa, validar que el caller sea ese agente o tenga rol admin/manager. Si no, rechazar 403.

**Criterio de done:**
- `curl https://...vercel.app/api/leads` sin cookies → 401
- `curl -X POST https://...vercel.app/api/leads -d '{"nombre":"x","telefono":"y"}'` sigue funcionando
- Login en CRM como admin → `/dashboard/leads` ve la lista completa
- Login como televenta → `/dashboard/mis-leads` solo ve los asignados a ese user

**Cleanup adicional (no urgente):**
- POST devuelve el lead completo (incluyendo DNI). El cotizador no lo usa. Reducir el shape de respuesta a `{ id, esNuevo }`.
- `origen` y `importacionId` se aceptan del body sin validar. Validar contra el enum.

---

### H2 + H3 — `GET/POST /api/convenios` sin auth, CORS abierto a `*`

**Archivo:** [`crm/src/app/api/convenios/route.ts:7-65`](../../crm/src/app/api/convenios/route.ts)

**Comportamiento actual:**

```ts
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',          // ← cualquier dominio
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  ...
}

export async function GET(...) {
  // sin guard
  const data = await db.select().from(convenios)  // devuelve fila completa
  return NextResponse.json(data, { headers: corsHeaders })
}

export async function POST(...) {
  // sin guard
  const [convenio] = await db.insert(convenios).values({...}).returning()
  return NextResponse.json(convenio, { status: 201 })
}
```

**Por qué es crítico:**
- El GET devuelve `email`, `responsable`, `descuentoPorcentaje`, `notas`, `beneficioDescripcion` de cada partner. Un competidor scrapea los términos comerciales que negociaste.
- El POST público permite a cualquiera crear convenios fake. Aunque el `OPTIONS` solo declara `GET, OPTIONS`, el handler `POST` igual atiende — CORS no detiene `curl`.
- El cotizador necesita leer la lista de convenios activos para mostrar opciones, pero **no necesita ver descuentos ni emails**.

**Parche mínimo (Fase 1):**

1. **Split del endpoint:**
   - Renombrar el GET actual a "GET autenticado" (igual que H1: pedir `auth.getUser()` o rechazar).
   - Crear `GET /api/convenios/publicos` o ajustar el GET para que cuando NO haya auth devuelva un shape reducido `{ id, nombre, tipo }` solamente. Decisión a tomar al implementar.
2. **POST: requerir auth + rol admin** (el público debería usar `/api/convenios/postulacion`, que ya existe para ese caso de uso).
3. **CORS:** cambiar `*` por la lista de orígenes permitidos (`getCorsHeaders` ya existe en `crm/src/lib/cors.ts`).

**Criterio de done:**
- `curl /api/convenios` sin auth → 401, o devuelve shape público sin descuentos/email
- Cotizador sigue funcionando (leyendo el shape público si hace falta — verificar primero si lo usa)
- `curl -X POST /api/convenios` sin auth → 401
- Admin logueado → ve y crea convenios

**Pregunta abierta para vos antes de implementar:** ¿el cotizador realmente lee `GET /api/convenios`? Si no lo usa, el endpoint puede ser `auth-only` directo sin shape público. Verificar antes de tocar.

---

### H4 — Token de portal en query string del certificado

**Archivo:** [`crm/src/app/api/portal/certificado/[servicioId]/route.ts:20`](../../crm/src/app/api/portal/certificado/[servicioId]/route.ts)

**Comportamiento actual:**

```ts
const token = request.nextUrl.searchParams.get('token')
```

**Por qué importa:** las query strings se loguean en Vercel, en historial de browser, y se mandan en headers `Referer` cuando el PDF se comparte. Si el cliente reenvía el link a un familiar, el token queda expuesto en el historial del receptor para siempre.

**Severidad:** media — no es exploitable a corta distancia (el token UUID v4 igual no se adivina), pero es buena práctica eliminarlo.

**Parche:**
- Mover el token a un cookie HTTP-only seteado al cargar el portal, o exigir que el portal pegue al endpoint con `fetch` y header `Authorization`.
- Como el certificado se descarga abriendo el link en una nueva pestaña, lo más simple es: el portal hace `fetch` con header → recibe el blob → genera URL con `URL.createObjectURL` → `<a download>`. El link nunca tiene token.

**Criterio de done:**
- El URL del botón de descarga no contiene `?token=...`
- Logs de Vercel ya no muestran el token en query string

---

### H5 — `clientes.tokenPortal` sin expiración ni rotación

**Archivo:** [`crm/src/db/schema/clientes.ts`](../../crm/src/db/schema/clientes.ts) (campo `tokenPortal`)

**Comportamiento actual:** se genera un UUID v4 al invitar al cliente. Vive para siempre. Si el cliente reenvía el email, el receptor tiene acceso permanente.

**Parche futuro:**
- Agregar columna `tokenPortalExpiraEn` (timestamp).
- Validar `expiraEn > now()` en cada lookup del portal.
- Endpoint `/api/portal/regenerar-token` para rotar.
- Default: 90 días.

**Por qué no es urgente:** el cliente que activó cuenta con Supabase Auth puede usar email/password en vez del token. El token es solo el ingreso inicial. Y la ventaja del token (compartirlo con familiares) es parte del producto de memorial.

Lo dejo documentado pero no lo trataría como urgente. Decisión de producto.

---

### H6 — Otros endpoints sin auth (resuelto en Fase 2)

Según `foundational-architecture-review.md` §1, **34 de 46 routes no llaman a `supabase.auth.getUser()`**. Lista parcial confirmada:

- `GET /api/clientes`
- `POST /api/servicios`
- `POST /api/leads/convertir`
- `PATCH /api/usuarios/[id]/permisos` ← **este es crítico, escalada de privilegios**

Parchar uno por uno es factible pero costoso y duplica código. La solución correcta está descrita en [`foundational-architecture-review.md` §3.1](./foundational-architecture-review.md): mover el gate al middleware con whitelist explícita y crear `requireActor()`.

**No abrir cada endpoint en este plan.** Después de la Fase 1 (parchar H1, H2, H3) entramos directo en la Fase 2 estructural.

---

## 3. Plan de ejecución por fases

### Fase 0 — Verificación de env vars (30 min)

- [ ] Confirmar `CRON_SECRET` seteado en Vercel y referenciado en `vercel.json`
- [ ] Confirmar `CORS_ALLOWED_ORIGINS` en producción contiene los dominios reales del cotizador y landing
- [ ] Confirmar `SUPABASE_SERVICE_ROLE_KEY` no está expuesta en ningún archivo cliente (grep `NEXT_PUBLIC_` no debería matchear nunca con `SERVICE_ROLE`)

### Fase 1 — Parches inmediatos (3-4 horas)

- [ ] **H1:** auth guard en `GET /api/leads` + reducir shape de respuesta del POST
- [ ] **H2 + H3:** auth guard en `GET/POST /api/convenios`, ajustar CORS, definir si hay endpoint público con shape reducido
- [ ] Verificación manual:
  - `curl` desde fuera devuelve 401 en endpoints protegidos
  - Login en CRM funciona y todos los flujos del dashboard siguen operativos
  - Cotizador y landing siguen creando leads sin problema

**Bloquea:** lanzamiento del CRM al equipo (cualquier uso real con datos del staff).

### Fase 2 — Frontera de seguridad estructural (1-2 días)

Implementar lo descrito en `foundational-architecture-review.md` §3.1:

- [ ] Sacar el skip de `/api` en `crm/src/middleware.ts:7-15`
- [ ] Definir whitelist de routes públicas (POST `/api/leads`, POST `/api/convenios/postulacion`, OPTIONS `*`, todos los `/api/cron/*` que ya validan bearer)
- [ ] Crear helper `requireActor(request): Promise<Actor | null>` con union de `staff | cliente | convenio`
- [ ] Migrar las routes existentes a usar `requireActor` (H6 desaparece)
- [ ] Eliminar los parches manuales de Fase 1 (ya cubiertos por el middleware)

**Bloquea:** Fase 3 (portal de convenios). No abrir Fase 3 sin esto.

### Fase 3 — Cleanup del portal (4 horas)

- [ ] **H4:** mover token de certificado fuera del query string
- [ ] Agregar rate limiting básico en endpoints del portal (`@upstash/ratelimit` o equivalente)
- [ ] Documentar el modelo de auth del portal en `CLAUDE.md`

### Fase 4 — Backlog de seguridad (no urgente)

- [ ] **H5:** expiración + rotación de `tokenPortal`
- [ ] Validar `origen` e `importacionId` en POST `/api/leads`
- [ ] Reducir el shape de respuesta del POST público (no devolver DNI)
- [ ] Auditoría de logs: confirmar que ningún `console.error` está logueando bodies completos con PII
- [ ] Bug menor en cron: rango `>= 48 && < 49` ([cron/leads:64](../../crm/src/app/api/cron/leads/route.ts)) puede saltarse si Vercel se atrasa

---

## 4. Verificación pre-lanzamiento

Antes de exponer el CRM al equipo, ejecutar este checklist completo:

```bash
# Sin sesión, todos deben devolver 401
curl https://huellasde-paz.vercel.app/api/leads
curl https://huellasde-paz.vercel.app/api/clientes
curl https://huellasde-paz.vercel.app/api/servicios
curl https://huellasde-paz.vercel.app/api/convenios
curl -X PATCH https://huellasde-paz.vercel.app/api/usuarios/AAA/permisos -d '{"permisos":[]}'

# Las únicas rutas públicas que deben funcionar sin auth
curl -X POST https://huellasde-paz.vercel.app/api/leads -d '{"nombre":"test","telefono":"123"}'
curl -X POST https://huellasde-paz.vercel.app/api/convenios/postulacion -d '...'

# Crons solo con bearer
curl https://huellasde-paz.vercel.app/api/cron/leads                      # → 401
curl -H "Authorization: Bearer $CRON_SECRET" .../api/cron/leads           # → 200
```

Cualquier resultado distinto a lo esperado es un blocker para producción.

---

## 5. Cosas que NO están en este plan

- Tests automatizados de seguridad — fuera de scope hasta que haya capa `lib/dominio/` (ver foundational §3.3)
- WAF / DDoS protection — Vercel Pro provee parte, no lo tocamos acá
- Encriptación de PII at-rest — Supabase ya lo hace a nivel de disco, alcanzaría con eso para la Ley 25.326 al volumen actual
- Audit log de accesos — el "quién leyó qué cuándo" es un proyecto aparte, lo trataría junto con el audit trail de pagos (foundational §R5)

---

## 6. Decisiones pendientes para el dueño del producto

1. **Shape público de convenios:** ¿el cotizador necesita la lista completa o le alcanza con `{ id, nombre, tipo }`? Verificar uso en `cotizador/src/`.
2. **Expiración de `tokenPortal`:** 30 días, 90 días, indefinido, o "indefinido pero rotable a pedido". Decisión de producto, no técnica.
3. **Endpoint `POST /api/convenios` público:** sospecho que nunca se usa desde fuera del CRM (la postulación tiene su propio endpoint). Confirmar antes de cerrarlo.

---

**Próximo paso recomendado:** después del merge de los cambios en curso del compañero, ejecutar Fase 0 (env vars) en paralelo a una sesión de pair programming para Fase 1. Bloquear cualquier deploy con datos reales hasta que H1, H2 y H3 estén cerrados.
