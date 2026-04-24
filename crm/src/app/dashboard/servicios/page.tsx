import { db } from '@/db'
import { servicios, clientes, mascotas, convenios } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'
import Link from 'next/link'

const estadoColors: Record<string, { bg: string; color: string }> = {
  ingresado: { bg: '#eff6ff', color: '#1d4ed8' },
  retiro_pendiente: { bg: '#fefce8', color: '#a16207' },
  en_transporte: { bg: '#fff7ed', color: '#c2410c' },
  recibido: { bg: '#f0fdf4', color: '#15803d' },
  en_cremacion: { bg: '#fdf4ff', color: '#7e22ce' },
  cremado: { bg: '#f0fdf4', color: '#15803d' },
  listo_entrega: { bg: '#fefce8', color: '#a16207' },
  entregado: { bg: '#f0fdf4', color: '#15803d' },
  cancelado: { bg: '#fef2f2', color: '#dc2626' },
}

const tipoLabel: Record<string, string> = {
  cremacion_individual: 'Cremación individual',
  cremacion_comunitaria: 'Cremación comunitaria',
  entierro: 'Entierro',
}

export default async function ServiciosPage() {
  const data = await db
    .select({
      id: servicios.id,
      numero: servicios.numero,
      tipo: servicios.tipo,
      estado: servicios.estado,
      fechaRetiro: servicios.fechaRetiro,
      precio: servicios.precio,
      descuento: servicios.descuento,
      clienteNombre: clientes.nombre,
      clienteApellido: clientes.apellido,
      mascotaNombre: mascotas.nombre,
      mascotaEspecie: mascotas.especie,
      convenioNombre: convenios.nombre,
    })
    .from(servicios)
    .leftJoin(clientes, eq(servicios.clienteId, clientes.id))
    .leftJoin(mascotas, eq(servicios.mascotaId, mascotas.id))
    .leftJoin(convenios, eq(clientes.veterinariaId, convenios.id))
    .orderBy(desc(servicios.numero))

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: 0 }}>Servicios</h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>
            {data.length} servicios registrados
          </p>
        </div>
        <Link href="/dashboard/servicios/nuevo" style={{
          background: '#111827', color: 'white', padding: '10px 20px',
          borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: 'none',
        }}>
          + Nuevo servicio
        </Link>
      </div>

      <div className="table-container">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              {['#', 'Mascota', 'Cliente', 'Tipo', 'Convenio', 'Pagó', 'Estado', 'Fecha retiro', ''].map(col => (
                <th key={col} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 500, color: '#9ca3af', letterSpacing: '0.05em' }}>
                  {col.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: '48px 20px', textAlign: 'center', fontSize: 14, color: '#9ca3af' }}>
                  No hay servicios registrados todavía
                </td>
              </tr>
            ) : (
              data.map(s => {
                const badge = estadoColors[s.estado] ?? { bg: '#f3f4f6', color: '#374151' }
                const neto = s.precio
                  ? Number(s.precio) - Number(s.descuento ?? 0)
                  : null
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#9ca3af' }}>
                        #{String(s.numero).padStart(4, '0')}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#111827', margin: 0 }}>{s.mascotaNombre ?? '—'}</p>
                      <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{s.mascotaEspecie ?? ''}</p>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: '#4b5563' }}>
                      {s.clienteNombre} {s.clienteApellido}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: '#4b5563' }}>
                      {tipoLabel[s.tipo] ?? s.tipo}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {s.convenioNombre
                        ? <span style={{ fontSize: 13, color: '#7e22ce', fontWeight: 500 }}>{s.convenioNombre}</span>
                        : <span style={{ fontSize: 13, color: '#d1d5db' }}>—</span>
                      }
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {neto !== null
                        ? <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>${neto.toLocaleString('es-AR')}</span>
                        : <span style={{ fontSize: 14, color: '#d1d5db' }}>—</span>
                      }
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ background: badge.bg, color: badge.color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
                        {s.estado.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: '#4b5563' }}>
                      {s.fechaRetiro ? new Date(s.fechaRetiro).toLocaleDateString('es-AR') : '—'}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <Link href={`/dashboard/servicios/${s.id}`} style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', fontWeight: 500 }}>
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