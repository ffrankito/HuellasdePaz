'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type Usuario } from '@/db/schema'
import { type NavItem } from '@/types'

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', roles: ['admin', 'contadora', 'televenta', 'transporte', 'cremacion', 'entrega'] },
  { label: 'Clientes', href: '/dashboard/clientes', roles: ['admin', 'contadora', 'televenta'] },
  { label: 'Servicios', href: '/dashboard/servicios', roles: ['admin', 'contadora', 'transporte', 'cremacion', 'entrega'] },
  { label: 'Planes', href: '/dashboard/planes', roles: ['admin', 'contadora', 'televenta'] },
  { label: 'Agenda', href: '/dashboard/agenda', roles: ['admin', 'transporte', 'cremacion', 'entrega'] },
  { label: 'Leads', href: '/dashboard/leads', roles: ['admin', 'televenta'] },
  { label: 'Inventario', href: '/dashboard/inventario', roles: ['admin', 'cremacion'] },
  { label: 'Cobranzas', href: '/dashboard/cobranzas', roles: ['admin', 'contadora'] },
  { label: 'Reportes', href: '/dashboard/reportes', roles: ['admin', 'contadora'] },
  { label: 'Configuración', href: '/dashboard/configuracion', roles: ['admin'] },
]

export function Sidebar({ usuario }: { usuario: Usuario }) {
  const pathname = usePathname()

  const itemsFiltrados = navItems.filter(item =>
    item.roles.includes(usuario.rol)
  )

  return (
    <aside style={{
      width: 240,
      minWidth: 240,
      background: 'white',
      borderRight: '1px solid #f3f4f6',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
    }}>
      <div style={{ padding: '24px 20px', borderBottom: '1px solid #f3f4f6' }}>
        <h1 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 }}>Huellas de Paz</h1>
        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2, marginBottom: 0 }}>Sistema de gestión</p>
      </div>

      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {itemsFiltrados.map((item) => {
          const activo = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'block',
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: activo ? 500 : 400,
                color: activo ? 'white' : '#4b5563',
                background: activo ? '#111827' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s',
              }}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid #f3f4f6' }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: '#111827', margin: 0 }}>{usuario.nombre}</p>
        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2, textTransform: 'capitalize', marginBottom: 0 }}>{usuario.rol}</p>
      </div>
    </aside>
  )
}