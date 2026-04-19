import { db } from '@/db'
import { planesConfig, templatesMsg, usuarios } from '@/db/schema'
import { getConfig } from '@/lib/utils/config'
import { createClient } from '@/lib/supabase/server'
import { NuevoPlanConfigForm } from '@/components/dashboard/NuevoPlanConfigForm'
import { NuevoTemplateMsgForm } from '@/components/dashboard/NuevoTemplateMsgForm'
import { EditarConfigListaForm } from '@/components/dashboard/EditarConfigListaForm'
import { GestionPermisosUsuario } from '@/components/configuracion/GestionPermisosUsuario'
import { EditarPlanConfigInline } from '@/components/configuracion/EditarPlanConfigInline'

const rolLabel: Record<string, string> = {
  admin: 'Administrador',
  manager: 'Manager',
  contadora: 'Contadora',
  televenta: 'Agente',
  transporte: 'Transporte',
  cremacion: 'Cremación',
  entrega: 'Entrega',
}

const rolColor: Record<string, { bg: string; color: string }> = {
  admin: { bg: '#eff6ff', color: '#1d4ed8' },
  manager: { bg: '#fdf4ff', color: '#7e22ce' },
  contadora: { bg: '#fefce8', color: '#a16207' },
  televenta: { bg: '#f0fdf4', color: '#15803d' },
  transporte: { bg: '#fff7ed', color: '#c2410c' },
  cremacion: { bg: '#f3f4f6', color: '#374151' },
  entrega: { bg: '#f0fdf4', color: '#15803d' },
}

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const usuarioActual = user
    ? await db.query.usuarios.findFirst({
        where: (u, { eq }) => eq(u.id, user.id),
      })
    : null

  const esAdmin = usuarioActual?.rol === 'admin'

  const [planesData, templatesData, tiposServicio, origenes, especies, todosUsuarios] = await Promise.all([
    db.select().from(planesConfig),
    db.select().from(templatesMsg),
    getConfig('tipos_servicio'),
    getConfig('origenes_lead'),
    getConfig('especies_mascota'),
    esAdmin ? db.select().from(usuarios) : Promise.resolve([]),
  ])

  const usuariosConPermisos = todosUsuarios.filter(u => u.rol !== 'admin')

  return (
    <div style={{ padding: '40px 48px', background: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: 0 }}>Configuración</h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>
          Planes, templates y ajustes del sistema
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* ── Usuarios y permisos (solo admin) ── */}
        {esAdmin && (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: '0 0 6px' }}>
              Usuarios y permisos
            </h2>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 24px' }}>
              Asigná permisos adicionales a los usuarios sin cambiar su rol operativo.
            </p>
            {usuariosConPermisos.length === 0 ? (
              <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>
                No hay otros usuarios registrados todavía.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {usuariosConPermisos.map(u => {
                  const badge = rolColor[u.rol] ?? { bg: '#f3f4f6', color: '#374151' }
                  return (
                    <div key={u.id} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: 24 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 15, fontWeight: 600, color: 'white' }}>
                            {u.nombre.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>{u.nombre}</p>
                          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>{u.email}</p>
                        </div>
                        <span style={{
                          fontSize: 11, fontWeight: 600,
                          color: badge.color, background: badge.bg,
                          padding: '3px 10px', borderRadius: 20,
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                        }}>
                          {rolLabel[u.rol] ?? u.rol}
                        </span>
                      </div>
                      <GestionPermisosUsuario usuario={u} />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Planes de previsión ── */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: '0 0 20px' }}>Planes de previsión</h2>
          {planesData.length === 0 ? (
            <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 24 }}>No hay planes configurados todavía.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
              {planesData.map(p => (
                <EditarPlanConfigInline key={p.id} plan={p} />
              ))}
            </div>
          )}
          <NuevoPlanConfigForm />
        </div>

        {/* ── Templates de mensajes ── */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: '0 0 20px' }}>Templates de mensajes</h2>
          {templatesData.length === 0 ? (
            <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 24 }}>No hay templates configurados todavía.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {templatesData.map(t => (
                <div key={t.id} style={{ background: '#f9fafb', borderRadius: 12, padding: '16px 20px', border: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>{t.nombre}</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ fontSize: 11, background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>{t.canal}</span>
                      <span style={{ fontSize: 11, background: '#f3f4f6', color: '#6b7280', padding: '2px 8px', borderRadius: 20 }}>{t.evento}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>{t.contenido}</p>
                </div>
              ))}
            </div>
          )}
          <NuevoTemplateMsgForm />
        </div>

        {/* ── Listas configurables ── */}
        <div className="grid-3">
          <EditarConfigListaForm clave="tipos_servicio" titulo="Tipos de servicio" valores={tiposServicio} />
          <EditarConfigListaForm clave="origenes_lead" titulo="Orígenes de leads" valores={origenes} />
          <EditarConfigListaForm clave="especies_mascota" titulo="Especies de mascotas" valores={especies} />
        </div>

      </div>
    </div>
  )
}