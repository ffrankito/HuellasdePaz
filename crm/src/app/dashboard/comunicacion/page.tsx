import { db } from '@/db'
import { comunicaciones, clientes, templatesMsg } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { ComunicacionForm } from '@/components/dashboard/ComunicacionForm'
import { EnviarMensajeButton } from '@/components/dashboard/EnviarMensajeButton'

export default async function ComunicacionPage() {
  const [clientesData, templates, pendientes] = await Promise.all([
    db.select().from(clientes),
    db.select().from(templatesMsg),
    db.select({
      id: comunicaciones.id,
      mensaje: comunicaciones.mensaje,
      canal: comunicaciones.canal,
      estado: comunicaciones.estado,
      creadoEn: comunicaciones.creadoEn,
      clienteNombre: clientes.nombre,
      clienteApellido: clientes.apellido,
      clienteTelefono: clientes.telefono,
      templateNombre: templatesMsg.nombre,
    })
    .from(comunicaciones)
    .leftJoin(clientes, eq(comunicaciones.clienteId, clientes.id))
    .leftJoin(templatesMsg, eq(comunicaciones.templateId, templatesMsg.id))
    .where(eq(comunicaciones.estado, 'pendiente'))
    .orderBy(comunicaciones.creadoEn),
  ])

  return (
    <div style={{ padding: '40px 48px', background: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: 0 }}>Comunicación</h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>
          Mensajes pendientes y envío manual
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Bandeja de pendientes */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 }}>Mensajes pendientes</h2>
            {pendientes.length > 0 && (
              <span style={{ background: '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>
                {pendientes.length}
              </span>
            )}
          </div>

          {pendientes.length === 0 ? (
            <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>No hay mensajes pendientes</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pendientes.map(p => (
                <div key={p.id} style={{
                  background: '#f9fafb', borderRadius: 12, padding: '16px',
                  border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: 10,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>
                        {p.clienteNombre} {p.clienteApellido}
                      </p>
                      <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>
                        {p.clienteTelefono} · {p.templateNombre ?? 'Manual'}
                      </p>
                    </div>
                    <span style={{ fontSize: 11, background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>
                      {p.canal}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.6, background: 'white', padding: '10px 12px', borderRadius: 8, border: '1px solid #f3f4f6' }}>
                    {p.mensaje}
                  </p>
                  <EnviarMensajeButton
                    id={p.id}
                    telefono={p.clienteTelefono ?? ''}
                    mensaje={p.mensaje}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Envío manual */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 20px' }}>Enviar mensaje manual</h2>
            <ComunicacionForm clientes={clientesData} templates={templates} />
          </div>
        </div>

      </div>
    </div>
  )
}