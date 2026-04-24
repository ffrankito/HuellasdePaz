import { db } from '@/db'
import { clientes, mascotas, servicios, planes, usuarios, noticiasCementerio } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { AgregarMascotaForm } from '@/components/clientes/AgregarMascotaForm'
import { getEspeciesMascota } from '@/lib/utils/config'
import { PortalLinkButton } from '@/components/clientes/PortalLinkButton'
import { InvitarPortalButton } from '@/components/clientes/InvitarPortalButton'
import { createClient } from '@/lib/supabase/server'

export default async function ClienteDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const cliente = await db.query.clientes.findFirst({
    where: eq(clientes.id, id),
  })

  if (!cliente) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const usuarioCRM = await db.query.usuarios.findFirst({
    where: eq(usuarios.id, user!.id),
  })

  const [mascotasData, serviciosData, planesData, especies, noticiasData] = await Promise.all([
    db.select().from(mascotas).where(eq(mascotas.clienteId, id)),
    db.select().from(servicios).where(eq(servicios.clienteId, id)),
    db.select().from(planes).where(eq(planes.clienteId, id)),
    getEspeciesMascota(),
    db.select().from(noticiasCementerio).orderBy(desc(noticiasCementerio.creadoEn)).limit(5),
  ])

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <Link href="/dashboard/clientes" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>← Clientes</Link>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: '4px 0 4px' }}>
            {cliente.nombre} {cliente.apellido}
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Cliente desde {new Date(cliente.creadoEn).toLocaleDateString('es-AR')}</p>
        </div>
      </div>

      <div className="grid-2">
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 16, marginTop: 0 }}>Datos personales</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <InfoRow label="Teléfono" value={cliente.telefono} />
            <InfoRow label="Email" value={cliente.email ?? '—'} />
            <InfoRow label="Dirección" value={cliente.direccion ?? '—'} />
            <InfoRow label="Localidad" value={cliente.localidad ?? '—'} />
            <InfoRow label="Provincia" value={cliente.provincia ?? '—'} />
            <InfoRow label="Origen" value={cliente.origen ?? '—'} />
          </div>

          {cliente.tokenPortal && (
            <div style={{ paddingTop: 16, borderTop: '1px solid #f3f4f6', marginTop: 16 }}>
              <PortalLinkButton token={cliente.tokenPortal} />
            </div>
          )}

          <div style={{ paddingTop: 12, borderTop: '1px solid #f3f4f6', marginTop: 12 }}>
            <InvitarPortalButton
              clienteId={cliente.id}
              email={cliente.email}
              yaInvitado={!!cliente.authUserId}
              rol={usuarioCRM?.rol ?? 'admin'}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 }}>Mascotas</h2>
            </div>
            {mascotasData.length === 0 ? (
              <p style={{ fontSize: 14, color: '#9ca3af', margin: '0 0 16px' }}>Sin mascotas registradas</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {mascotasData.map(m => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f9fafb', borderRadius: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{m.nombre}</span>
                    <span style={{ fontSize: 13, color: '#6b7280' }}>{m.especie}{m.raza ? ` · ${m.raza}` : ''}</span>
                  </div>
                ))}
              </div>
            )}
            <AgregarMascotaForm clienteId={id} especies={especies} />
          </div>

          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 12, marginTop: 0 }}>Servicios</h2>
            {serviciosData.length === 0 ? (
              <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>Sin servicios registrados</p>
            ) : (
              serviciosData.map(s => (
                <p key={s.id} style={{ fontSize: 14, color: '#374151', margin: '4px 0' }}>{s.tipo.replace(/_/g, ' ')} · {s.estado.replace(/_/g, ' ')}</p>
              ))
            )}
          </div>

          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 12, marginTop: 0 }}>Planes</h2>
            {planesData.length === 0 ? (
              <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>Sin planes activos</p>
            ) : (
              planesData.map(p => (
                <p key={p.id} style={{ fontSize: 14, color: '#374151', margin: '4px 0' }}>Plan · {p.estado}</p>
              ))
            )}
          </div>
        </div>
      </div>

      {cliente.notas && (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginTop: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 8, marginTop: 0 }}>Notas</h2>
          <p style={{ fontSize: 14, color: '#4b5563', margin: 0, lineHeight: 1.6 }}>{cliente.notas}</p>
        </div>
      )}

      {noticiasData.length > 0 && (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginTop: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 16, marginTop: 0 }}>Novedades del cementerio</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {noticiasData.map(n => (
              <div key={n.id} style={{ padding: '14px 16px', background: '#f9fafb', borderRadius: 12, border: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>{n.titulo}</p>
                  <span style={{ fontSize: 12, color: '#9ca3af', flexShrink: 0, marginLeft: 12 }}>
                    {new Date(n.creadoEn).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>{n.contenido}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
      <span style={{ color: '#9ca3af' }}>{label}</span>
      <span style={{ color: '#111827', fontWeight: 500 }}>{value}</span>
    </div>
  )
}