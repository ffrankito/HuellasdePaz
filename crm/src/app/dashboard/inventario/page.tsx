import { db } from '@/db'
import { inventario } from '@/db/schema'
import { desc } from 'drizzle-orm'
import Link from 'next/link'

export default async function InventarioPage() {
  const data = await db.select().from(inventario).orderBy(desc(inventario.creadoEn))

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: 0 }}>Inventario</h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>{data.length} productos registrados</p>
        </div>
        <Link href="/dashboard/inventario/nuevo" style={{
          background: '#111827', color: 'white', padding: '10px 20px',
          borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: 'none',
        }}>
          + Nuevo producto
        </Link>
      </div>

      <div className="table-container">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              {['Producto', 'Categoría', 'Venta', 'Stock actual', 'Stock mínimo', 'Estado', ''].map((col) => (
                <th key={col} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 500, color: '#9ca3af', letterSpacing: '0.05em' }}>
                  {col.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '48px 20px', textAlign: 'center', fontSize: 14, color: '#9ca3af' }}>
                  No hay productos registrados todavía
                </td>
              </tr>
            ) : (
              data.map((item) => {
                const stockBajo = item.stockActual <= item.stockMinimo
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {item.foto ? (
                          <img src={item.foto} alt={item.nombre} style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover', border: '1px solid #f3f4f6', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 64, height: 64, borderRadius: 10, background: '#f3f4f6', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                            📦
                          </div>
                        )}
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 500, color: '#111827', margin: 0 }}>{item.nombre}</p>
                          {item.descripcion && <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{item.descripcion}</p>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: '#4b5563', textTransform: 'capitalize' }}>{item.categoria}</td>
                    <td style={{ padding: '14px 20px' }}>
                      {item.paraVenta
                        ? <span style={{ background: '#f0faf5', color: '#2d8a54', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>Venta</span>
                        : <span style={{ background: '#f3f4f6', color: '#9ca3af', padding: '3px 10px', borderRadius: 20, fontSize: 12 }}>Interno</span>
                      }
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: stockBajo ? '#dc2626' : '#111827' }}>{item.stockActual}</td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: '#4b5563' }}>{item.stockMinimo}</td>
                    <td style={{ padding: '14px 20px' }}>
                      {stockBajo ? (
                        <span style={{ background: '#fef2f2', color: '#dc2626', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>Stock bajo</span>
                      ) : (
                        <span style={{ background: '#f0fdf4', color: '#15803d', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>OK</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <Link href={`/dashboard/inventario/${item.id}`} style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', fontWeight: 500 }}>Ver →</Link>
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