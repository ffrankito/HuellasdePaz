import { db } from '@/db'
import { leads, usuarios } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

const estadoColors: Record<string, { bg: string; color: string }> = {
  nuevo: { bg: '#eff6ff', color: '#1d4ed8' },
  contactado: { bg: '#f0fdf4', color: '#15803d' },
  interesado: { bg: '#fefce8', color: '#a16207' },
  cotizado: { bg: '#fdf4ff', color: '#7e22ce' },
  convertido: { bg: '#f0fdf4', color: '#15803d' },
  perdido: { bg: '#fef2f2', color: '#dc2626' },
}

export default async function MisLeadsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const usuario = await db.query.usuarios.findFirst({
    where: eq(usuarios.id, user.id),
  })

  if (!usuario || usuario.rol !== 'televenta') redirect('/dashboard')

  const misLeads = await db
    .select()
    .from(leads)
    .where(eq(leads.asignadoAId, usuario.id))
    .orderBy(desc(leads.creadoEn))

  const nuevos = misLeads.filter(l => l.estado === 'nuevo').length
  const activos = misLeads.filter(l => !['convertido', 'perdido'].includes(l.estado)).length
  const convertidos = misLeads.filter(l => l.estado === 'convertido').length

  return (
    <div className="page-container">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: 0 }}>
          Mis leads
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>
          Hola, {usuario.nombre} — {misLeads.length} leads asignados
        </p>
      </div>

      {/* Métricas rápidas */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div style={{ background: '#eff6ff', borderRadius: 14, padding: '18px 20px', border: '1px solid #bfdbfe' }}>
          <p style={{ fontSize: 12, color: '#1d4ed8', margin: '0 0 6px', fontWeight: 500 }}>Sin contactar</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#1d4ed8', margin: 0 }}>{nuevos}</p>
        </div>
        <div style={{ background: '#fefce8', borderRadius: 14, padding: '18px 20px', border: '1px solid #fde68a' }}>
          <p style={{ fontSize: 12, color: '#a16207', margin: '0 0 6px', fontWeight: 500 }}>En seguimiento</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#a16207', margin: 0 }}>{activos}</p>
        </div>
        <div style={{ background: '#f0fdf4', borderRadius: 14, padding: '18px 20px', border: '1px solid #bbf7d0' }}>
          <p style={{ fontSize: 12, color: '#15803d', margin: '0 0 6px', fontWeight: 500 }}>Convertidos</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#15803d', margin: 0 }}>{convertidos}</p>
        </div>
      </div>

      {/* Lista de leads */}
      <div className="table-container">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              {['Nombre', 'Teléfono', 'Origen', 'Estado', 'Fecha', ''].map(col => (
                <th key={col} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 500, color: '#9ca3af', letterSpacing: '0.05em' }}>
                  {col.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {misLeads.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '48px 20px', textAlign: 'center', fontSize: 14, color: '#9ca3af' }}>
                  No tenés leads asignados todavía
                </td>
              </tr>
            ) : (
              misLeads.map(lead => {
                const badge = estadoColors[lead.estado] ?? { bg: '#f3f4f6', color: '#374151' }
                return (
                  <tr key={lead.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#111827', margin: 0 }}>{lead.nombre}</p>
                      {lead.email && <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{lead.email}</p>}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: '#4b5563' }}>{lead.telefono}</td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#6b7280', textTransform: 'capitalize' }}>
                      {lead.origen ?? '—'}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ background: badge.bg, color: badge.color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
                        {lead.estado.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#9ca3af' }}>
                      {new Date(lead.creadoEn).toLocaleDateString('es-AR')}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <Link href={`/dashboard/leads/${lead.id}`} style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', fontWeight: 500 }}>
                        Ver →
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}