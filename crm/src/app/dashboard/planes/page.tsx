import { db } from '@/db'
import { planes, clientes, mascotas } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'
import Link from 'next/link'

const estadoColors: Record<string, { bg: string; color: string }> = {
  activo: { bg: '#f0fdf4', color: '#15803d' },
  pausado: { bg: '#fefce8', color: '#a16207' },
  cancelado: { bg: '#fef2f2', color: '#dc2626' },
  utilizado: { bg: '#f3f4f6', color: '#6b7280' },
}

export default async function PlanesPage() {
  const data = await db
    .select({
      id: planes.id,
      numero: planes.numero,
      estado: planes.estado,
      cuotasMensual: planes.cuotasMensual,
      cuotasPagadas: planes.cuotasPagadas,
      cuotasTotales: planes.cuotasTotales,
      porcentajeCobertura: planes.porcentajeCobertura,
      mascotaAdicional: planes.mascotaAdicional,
      creadoEn: planes.creadoEn,
      clienteNombre: clientes.nombre,
      clienteApellido: clientes.apellido,
      clienteTelefono: clientes.telefono,
      mascotaNombre: mascotas.nombre,
      mascotaEspecie: mascotas.especie,
    })
    .from(planes)
    .leftJoin(clientes, eq(planes.clienteId, clientes.id))
    .leftJoin(mascotas, eq(planes.mascotaId, mascotas.id))
    .orderBy(desc(planes.numero))

  const activos = data.filter(p => p.estado === 'activo').length
  const ingresoMensual = data
    .filter(p => p.estado === 'activo')
    .reduce((acc, p) => acc + Number(p.cuotasMensual), 0)

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: 0 }}>Planes</h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>
            {data.length} planes registrados · {activos} activos
          </p>
        </div>
        <Link href="/dashboard/planes/nuevo" style={{
          background: '#111827', color: 'white', padding: '10px 20px',
          borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: 'none',
        }}>
          + Nuevo plan
        </Link>
      </div>

      {/* Métricas rápidas */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #f3f4f6', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 6px' }}>Planes activos</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0 }}>{activos}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #f3f4f6', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 6px' }}>Ingreso mensual estimado</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#15803d', margin: 0 }}>
            ${ingresoMensual.toLocaleString('es-AR')}
          </p>
        </div>
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #f3f4f6', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 6px' }}>Total planes</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0 }}>{data.length}</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="table-container">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              {['#', 'Cliente', 'Mascota', 'Cuota', 'Cuotas', 'Cobertura', 'Estado', ''].map(col => (
                <th key={col} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 500, color: '#9ca3af', letterSpacing: '0.05em' }}>
                  {col.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '48px 20px', textAlign: 'center', fontSize: 14, color: '#9ca3af' }}>
                  No hay planes registrados todavía
                </td>
              </tr>
            ) : (
              data.map(p => {
                const badge = estadoColors[p.estado] ?? { bg: '#f3f4f6', color: '#374151' }
                const progreso = Math.round((p.cuotasPagadas / p.cuotasTotales) * 100)
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#9ca3af' }}>
                        #{String(p.numero).padStart(4, '0')}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#111827', margin: 0 }}>
                        {p.clienteNombre} {p.clienteApellido}
                      </p>
                      <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{p.clienteTelefono}</p>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <p style={{ fontSize: 14, color: '#4b5563', margin: 0 }}>{p.mascotaNombre ?? '—'}</p>
                      <p style={{ fontSize: 12, color: '#9ca3af', margin: 0, textTransform: 'capitalize' }}>
                        {p.mascotaEspecie ?? ''}
                        {p.mascotaAdicional && <span style={{ marginLeft: 6, color: '#7e22ce' }}>+adicional</span>}
                      </p>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: '#111827' }}>
                      ${Number(p.cuotasMensual).toLocaleString('es-AR')}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 80 }}>
                        <span style={{ fontSize: 13, color: '#374151' }}>
                          {p.cuotasPagadas}/{p.cuotasTotales}
                        </span>
                        <div style={{ height: 4, background: '#f3f4f6', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ width: `${progreso}%`, height: '100%', background: '#111827', borderRadius: 2 }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: '#4b5563' }}>
                      {Number(p.porcentajeCobertura)}%
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