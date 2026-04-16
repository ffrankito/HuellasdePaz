import { db } from '@/db'
import { inventario } from '@/db/schema'
import { NotificacionesBell } from './NotificacionesBell'

export async function Header({ nombre }: { nombre: string }) {
  const items = await db.select().from(inventario)
  const stockBajo = items.filter(i => i.stockActual <= i.stockMinimo)

  return (
    <header style={{
      height: 60,
      background: 'white',
      borderBottom: '1px solid #f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <div />
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <NotificacionesBell alertas={stockBajo.map(i => ({
          id: i.id,
          titulo: `Stock bajo — ${i.nombre}`,
          descripcion: `Quedan ${i.stockActual} unidades (mínimo: ${i.stockMinimo})`,
          href: '/dashboard/inventario',
        }))} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
         <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    <span style={{ fontSize: 12, fontWeight: 600, color: 'white' }}>
      {nombre.charAt(0).toUpperCase()}
    </span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }} className="header-nombre">{nombre}</span>
      </div>
      </div>
    </header>
  )
}