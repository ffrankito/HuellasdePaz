import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/db'
import { asistenteLog, usuarios } from '@/db/schema'
import { eq, desc, gte, sum, count } from 'drizzle-orm'

const COST_INPUT  = 0.80 / 1_000_000
const COST_OUTPUT = 4.00 / 1_000_000

const CONTEXTO_LABEL: Record<string, string> = {
  leads: 'Leads', clientes: 'Clientes', servicios: 'Servicios',
  planes: 'Planes', reportes: 'Reportes', agenda: 'Agenda',
  inventario: 'Inventario', convenios: 'Convenios', configuracion: 'Configuración',
  novedades: 'Novedades', dashboard: 'Dashboard', desconocido: '—',
}

const ROL_BADGE: Record<string, { bg: string; text: string }> = {
  admin:      { bg: '#fef3c7', text: '#92400e' },
  manager:    { bg: '#ede9fe', text: '#5b21b6' },
  televenta:  { bg: '#dbeafe', text: '#1e40af' },
  contadora:  { bg: '#d1fae5', text: '#065f46' },
  transporte: { bg: '#ffedd5', text: '#9a3412' },
  cremacion:  { bg: '#fce7f3', text: '#9d174d' },
  entrega:    { bg: '#f3f4f6', text: '#374151' },
}

export default async function AuditoriaAsistentePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const yo = await db.query.usuarios.findFirst({ where: eq(usuarios.id, user.id) })
  if (!yo || yo.rol !== 'admin') redirect('/dashboard')

  const inicioMes = new Date()
  inicioMes.setDate(1); inicioMes.setHours(0, 0, 0, 0)

  const [logs, [mes], [total]] = await Promise.all([
    db.select({
      id: asistenteLog.id,
      pregunta: asistenteLog.pregunta,
      rol: asistenteLog.rol,
      screenContext: asistenteLog.screenContext,
      tokensInput: asistenteLog.tokensInput,
      tokensOutput: asistenteLog.tokensOutput,
      creadoEn: asistenteLog.creadoEn,
      usuarioNombre: usuarios.nombre,
    })
    .from(asistenteLog)
    .leftJoin(usuarios, eq(asistenteLog.usuarioId, usuarios.id))
    .orderBy(desc(asistenteLog.creadoEn))
    .limit(200),

    db.select({ q: count(), ti: sum(asistenteLog.tokensInput), to: sum(asistenteLog.tokensOutput) })
      .from(asistenteLog).where(gte(asistenteLog.creadoEn, inicioMes)),

    db.select({ q: count(), ti: sum(asistenteLog.tokensInput), to: sum(asistenteLog.tokensOutput) })
      .from(asistenteLog),
  ])

  const costoMes   = Number(mes.ti ?? 0) * COST_INPUT + Number(mes.to ?? 0) * COST_OUTPUT
  const costoTotal = Number(total.ti ?? 0) * COST_INPUT + Number(total.to ?? 0) * COST_OUTPUT

  function formatFecha(d: Date) {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit',
    }).format(d)
  }

  return (
    <div className="page-container">

      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Ícono Claude */}
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg, #f0faf5 0%, #d1ead9 100%)',
            border: '1px solid rgba(45,138,84,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C9.5 2 7.5 3.5 6.5 5.5L3 12l3.5 6.5C7.5 20.5 9.5 22 12 22s4.5-1.5 5.5-3.5L21 12l-3.5-6.5C16.5 3.5 14.5 2 12 2z" fill="#2d8a54" opacity="0.15"/>
              <path d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z" fill="#2d8a54" opacity="0.3"/>
              <path d="M12 9.5c-1.4 0-2.5 1.1-2.5 2.5s1.1 2.5 2.5 2.5 2.5-1.1 2.5-2.5-1.1-2.5-2.5-2.5z" fill="#2d8a54"/>
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#2d8a54" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: '#111827', margin: 0 }}>Asistente — Auditoría</h1>
            <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Historial de consultas del equipo</p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Consultas este mes', value: mes.q.toLocaleString('es-AR'),      sub: null },
          { label: 'Costo este mes',     value: `USD ${costoMes.toFixed(3)}`,       sub: 'Haiku 4.5' },
          { label: 'Consultas totales',  value: total.q.toLocaleString('es-AR'),    sub: null },
          { label: 'Costo acumulado',    value: `USD ${costoTotal.toFixed(3)}`,     sub: 'histórico' },
        ].map(k => (
          <div key={k.label} style={{
            background: 'white', borderRadius: 14, padding: '18px 20px',
            border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k.label}</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>{k.value}</p>
            {k.sub && <p style={{ fontSize: 11, color: '#d1d5db', margin: '3px 0 0' }}>{k.sub}</p>}
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="table-container">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              {['Fecha', 'Empleado', 'Rol', 'Pantalla', 'Pregunta', 'Tokens', 'Costo (USD)'].map(h => (
                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 500, color: '#9ca3af', letterSpacing: '0.05em' }}>
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '48px 20px', textAlign: 'center', fontSize: 14, color: '#9ca3af' }}>
                  Sin consultas registradas todavía.
                </td>
              </tr>
            ) : logs.map((log, i) => {
              const costo = ((log.tokensInput ?? 0) * COST_INPUT) + ((log.tokensOutput ?? 0) * COST_OUTPUT)
              const badge = ROL_BADGE[log.rol ?? ''] ?? { bg: '#f3f4f6', text: '#374151' }
              return (
                <tr key={log.id} style={{ borderBottom: i < logs.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                  <td style={{ padding: '13px 20px', fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' }}>
                    {formatFecha(log.creadoEn)}
                  </td>
                  <td style={{ padding: '13px 20px', fontSize: 14, fontWeight: 500, color: '#111827', whiteSpace: 'nowrap' }}>
                    {log.usuarioNombre ?? <span style={{ color: '#d1d5db' }}>—</span>}
                  </td>
                  <td style={{ padding: '13px 20px' }}>
                    {log.rol && (
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: badge.bg, color: badge.text, whiteSpace: 'nowrap' }}>
                        {log.rol}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '13px 20px', fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' }}>
                    {CONTEXTO_LABEL[log.screenContext ?? ''] ?? log.screenContext ?? '—'}
                  </td>
                  <td style={{ padding: '13px 20px', maxWidth: 360 }}>
                    <p style={{
                      fontSize: 13, color: '#374151', margin: 0,
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    } as React.CSSProperties}>
                      {log.pregunta}
                    </p>
                  </td>
                  <td style={{ padding: '13px 20px', fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' }}>
                    {((log.tokensInput ?? 0) + (log.tokensOutput ?? 0)).toLocaleString('es-AR')}
                  </td>
                  <td style={{ padding: '13px 20px', fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' }}>
                    {costo.toFixed(5)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {logs.length === 200 && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid #f3f4f6' }}>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0, textAlign: 'center' }}>Mostrando las últimas 200 consultas.</p>
          </div>
        )}
      </div>

    </div>
  )
}
