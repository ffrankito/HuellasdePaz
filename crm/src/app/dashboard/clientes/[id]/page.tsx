import { db } from '@/db'
import { clientes, mascotas, servicios, planes } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function ClienteDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const cliente = await db.query.clientes.findFirst({
    where: eq(clientes.id, id),
  })

  if (!cliente) notFound()

  const [mascotasData, serviciosData, planesData] = await Promise.all([
    db.select().from(mascotas).where(eq(mascotas.clienteId, id)),
    db.select().from(servicios).where(eq(servicios.clienteId, id)),
    db.select().from(planes).where(eq(planes.clienteId, id)),
  ])

  return (
    <div style={{ padding: '40px 48px', background: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <Link href="/dashboard/clientes" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>← Clientes</Link>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: '4px 0 4px' }}>
            {cliente.nombre} {cliente.apellido}
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Cliente desde {new Date(cliente.creadoEn).toLocaleDateString('es-AR')}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
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
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 12, marginTop: 0 }}>Mascotas</h2>
            {mascotasData.length === 0 ? (
              <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>Sin mascotas registradas</p>
            ) : (
              mascotasData.map(m => (
                <p key={m.id} style={{ fontSize: 14, color: '#374151', margin: '4px 0' }}>{m.nombre} · {m.especie}</p>
              ))
            )}
          </div>

          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 12, marginTop: 0 }}>Servicios</h2>
            {serviciosData.length === 0 ? (
              <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>Sin servicios registrados</p>
            ) : (
              serviciosData.map(s => (
                <p key={s.id} style={{ fontSize: 14, color: '#374151', margin: '4px 0' }}>{s.tipo} · {s.estado}</p>
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