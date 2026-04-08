import { db } from '@/db'
import { clientes } from '@/db/schema'
import { desc } from 'drizzle-orm'
import Link from 'next/link'

export default async function ClientesPage() {
  const data = await db.select().from(clientes).orderBy(desc(clientes.creadoEn))

  return (
    <div style={{ padding: '40px 48px', background: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: 0 }}>Clientes</h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>{data.length} clientes registrados</p>
        </div>
        <Link href="/dashboard/clientes/nuevo" style={{
          background: '#111827',
          color: 'white',
          padding: '10px 20px',
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 500,
          textDecoration: 'none',
        }}>
          + Nuevo cliente
        </Link>
      </div>

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              {['Nombre', 'Teléfono', 'Email', 'Localidad', 'Origen', ''].map((col) => (
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
                  No hay clientes registrados todavía
                </td>
              </tr>
            ) : (
              data.map((cliente) => (
                <tr key={cliente.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                  <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 500, color: '#111827' }}>
                    {cliente.nombre} {cliente.apellido}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 14, color: '#4b5563' }}>{cliente.telefono}</td>
                  <td style={{ padding: '14px 20px', fontSize: 14, color: '#4b5563' }}>{cliente.email ?? '—'}</td>
                  <td style={{ padding: '14px 20px', fontSize: 14, color: '#4b5563' }}>{cliente.localidad ?? '—'}</td>
                  <td style={{ padding: '14px 20px', fontSize: 14, color: '#4b5563' }}>{cliente.origen ?? '—'}</td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <Link href={`/dashboard/clientes/${cliente.id}`} style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', fontWeight: 500 }}>
                      Ver →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}