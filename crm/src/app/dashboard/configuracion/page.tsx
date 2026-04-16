import { db } from '@/db'
import { planesConfig, templatesMsg } from '@/db/schema'
import { getConfig } from '@/lib/utils/config'
import { NuevoPlanConfigForm } from '@/components/dashboard/NuevoPlanConfigForm'
import { NuevoTemplateMsgForm } from '@/components/dashboard/NuevoTemplateMsgForm'
import { EditarConfigListaForm } from '@/components/dashboard/EditarConfigListaForm'

export default async function ConfiguracionPage() {
  const [planesData, templatesData, tiposServicio, origenes, especies] = await Promise.all([
    db.select().from(planesConfig),
    db.select().from(templatesMsg),
    getConfig('tipos_servicio'),
    getConfig('origenes_lead'),
    getConfig('especies_mascota'),
  ])

  return (
    <div style={{ padding: '40px 48px', background: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: 0 }}>Configuración</h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>Planes, templates y ajustes del sistema</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* Planes de previsión */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: '0 0 20px' }}>Planes de previsión</h2>
          {planesData.length === 0 ? (
            <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 24 }}>No hay planes configurados todavía.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
              {planesData.map(p => (
                <div key={p.id} style={{ background: '#f9fafb', borderRadius: 12, padding: '18px 20px', border: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>{p.nombre}</p>
                    <span style={{ fontSize: 11, background: p.activo ? '#f0fdf4' : '#fef2f2', color: p.activo ? '#15803d' : '#dc2626', padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  {p.descripcion && <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 12px' }}>{p.descripcion}</p>}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#9ca3af' }}>Cuota mensual</span>
                      <span style={{ fontWeight: 600, color: '#111827' }}>${Number(p.cuotaMensual).toLocaleString('es-AR')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#9ca3af' }}>Total cuotas</span>
                      <span style={{ fontWeight: 600, color: '#111827' }}>{p.cuotasTotales}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <NuevoPlanConfigForm />
        </div>

        {/* Templates de mensajes */}
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

        {/* Listas configurables */}
        <div className="grid-3">
          <EditarConfigListaForm
            clave="tipos_servicio"
            titulo="Tipos de servicio"
            valores={tiposServicio}
          />
          <EditarConfigListaForm
            clave="origenes_lead"
            titulo="Orígenes de leads"
            valores={origenes}
          />
          <EditarConfigListaForm
            clave="especies_mascota"
            titulo="Especies de mascotas"
            valores={especies}
          />
        </div>

      </div>
    </div>
  )
}