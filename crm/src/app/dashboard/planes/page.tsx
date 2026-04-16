import { db } from '@/db'
import { planes, clientes, mascotas } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import Link from 'next/link'

const estadoColors: Record<string, { bg: string; color: string }> = {
  activo: { bg: '#f0fdf4', color: '#15803d' },
  pausado: { bg: '#fefce8', color: '#a16207' },
  cancelado: { bg: '#fef2f2', color: '#dc2626' },
  utilizado: { bg: '#eff6ff', color: '#1d4ed8' },
}

export default async function PlanesPage() {
  const data = await db
    .select({
      id: planes.id,
      estado: planes.estado,
      cuotasMensual: planes.cuotasMensual,
      cuotasPagadas: planes.cuotasPagadas,
      cuotasTotales: planes.cuotasTotales,
      porcentajeCobertura: planes.porcentajeCobertura,
      fechaInicio: planes.fechaInicio,
      clienteNombre: clientes.nombre,
      clienteApellido: clientes.apellido,
      mascotaNombre: mascotas.nombre,
    })
    .from(planes)
    .leftJoin(clientes, eq(planes.clienteId, clientes.id))
    .leftJoin(mascotas, eq(planes.mascotaId, mascotas.id))
    .orderBy(desc(planes.creadoEn))

  return (
    <div style={{ padding: '40px 48px', background: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: 0 }}>Planes</h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>{data.length} planes registrados</p>
        </div>
        <Link href="/dashboard/planes/nuevo" style={{
          background: '#111827', color: 'white', padding: '10px 20px',
          borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: 'none',
        }}>
          + Nuevo plan
        </Link>
      </div>

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              {['Cliente', 'Mascota', 'Cuota', 'Progreso', 'Cobertura', 'Estado', ''].map(col => (
                <th key={col} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 500, color: '#9ca3af', letterSpacing: '0.05em' }}>
                  {col.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '48px 20px', textAlign: 'center', fontSize: 14, color: '#9ca3af' }}>
                  No hay planes registrados todavía
                </td>
              </tr>
            ) : (
              data.map(p => {
                const badge = estadoColors[p.estado] ?? { bg: '#f3f4f6', color: '#374151' }
                const progreso = Math.round(((p.cuotasPagadas ?? 0) / p.cuotasTotales) * 100)
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 500, color: '#111827' }}>
                      {p.clienteNombre} {p.clienteApellido}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: '#4b5563' }}>{p.mascotaNombre ?? '—'}</td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: '#4b5563' }}>
                      ${Number(p.cuotasMensual).toLocaleString('es-AR')}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden', minWidth: 80 }}>
                          <div style={{ width: `${progreso}%`, height: '100%', background: '#111827', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>
                          {p.cuotasPagadas}/{p.cuotasTotales}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: '#4b5563' }}>
                      {p.porcentajeCobertura ?? 0}%
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ background: badge.bg, color: badge.color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
                        {p.estado}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <Link href={`/dashboard/planes/${p.id}`} style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', fontWeight: 500 }}>
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