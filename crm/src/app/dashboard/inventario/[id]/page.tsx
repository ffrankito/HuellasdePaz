import { db } from '@/db'
import { inventario } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { EditarStockButton } from '@/components/dashboard/EditarStockButton'
import { EliminarProductoButton } from '@/components/dashboard/EliminarProductoButton'
import { ToggleParaVentaButton } from '@/components/dashboard/ToggleParaVentaButton'

export default async function InventarioDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const item = await db.query.inventario.findFirst({
    where: eq(inventario.id, id),
  })

  if (!item) notFound()

  const stockBajo = item.stockActual <= item.stockMinimo

  return (
    <div style={{ padding: '40px 48px', background: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <Link href="/dashboard/inventario" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>← Inventario</Link>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: '4px 0' }}>{item.nombre}</h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0, textTransform: 'capitalize' }}>{item.categoria}</p>
        </div>
        <EliminarProductoButton id={item.id} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>Información</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <InfoRow label="Categoría" value={item.categoria} />
              <InfoRow label="Proveedor" value={item.proveedor ?? '—'} />
              <InfoRow label="Stock mínimo" value={String(item.stockMinimo)} />
            </div>
          </div>

          {item.notas && (
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>Notas</h2>
              <p style={{ fontSize: 14, color: '#4b5563', margin: 0, lineHeight: 1.6 }}>{item.notas}</p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>Stock</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 42, fontWeight: 700, color: stockBajo ? '#dc2626' : '#111827', margin: 0 }}>
                  {item.stockActual}
                </p>
                <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>unidades disponibles</p>
              </div>
              <span style={{
                background: stockBajo ? '#fef2f2' : '#f0fdf4',
                color: stockBajo ? '#dc2626' : '#15803d',
                padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
              }}>
                {stockBajo ? '⚠ Stock bajo' : '✓ OK'}
              </span>
            </div>
            <EditarStockButton id={item.id} stockActual={item.stockActual} />
          </div>

          <ToggleParaVentaButton id={item.id} paraVenta={item.paraVenta} />

          {item.foto && (
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>Foto</h2>
              <img src={item.foto} alt={item.nombre} style={{ width: '100%', borderRadius: 12, objectFit: 'cover', maxHeight: 300 }} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
      <span style={{ color: '#9ca3af' }}>{label}</span>
      <span style={{ color: '#111827', fontWeight: 500, textTransform: 'capitalize' }}>{value}</span>
    </div>
  )
}