'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { type Usuario } from '@/db/schema'

const navAdmin = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Clientes', href: '/dashboard/clientes' },
  { label: 'Servicios', href: '/dashboard/servicios' },
  { label: 'Planes', href: '/dashboard/planes' },
  { label: 'Agenda', href: '/dashboard/agenda' },
  { label: 'Leads', href: '/dashboard/leads' },
  { label: 'Comunicación', href: '/dashboard/comunicacion' },
  { label: 'Inventario', href: '/dashboard/inventario' },
  { label: 'Cobranzas', href: '/dashboard/cobranzas' },
  { label: 'Reportes', href: '/dashboard/reportes' },
  { label: 'Configuración', href: '/dashboard/configuracion' },
]

const navManager = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Todos los leads', href: '/dashboard/leads' },
  { label: 'Agentes', href: '/dashboard/manager/agentes' },
  { label: 'Rendimiento', href: '/dashboard/manager/rendimiento' },
  { label: 'Reportes', href: '/dashboard/manager/reportes' },
]

const navAgente = [
  { label: 'Mis leads', href: '/dashboard/mis-leads' },
  { label: 'Mi rendimiento', href: '/dashboard/mi-rendimiento' },
  { label: 'Comunicación', href: '/dashboard/comunicacion' },
]

const navPorRol: Record<string, { label: string; href: string }[]> = {
  admin: navAdmin,
  manager: navManager,
  contadora: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Clientes', href: '/dashboard/clientes' },
    { label: 'Planes', href: '/dashboard/planes' },
    { label: 'Cobranzas', href: '/dashboard/cobranzas' },
    { label: 'Reportes', href: '/dashboard/reportes' },
  ],
  televenta: navAgente,
  transporte: [
    { label: 'Agenda', href: '/dashboard/agenda' },
    { label: 'Servicios', href: '/dashboard/servicios' },
  ],
  cremacion: [
    { label: 'Agenda', href: '/dashboard/agenda' },
    { label: 'Servicios', href: '/dashboard/servicios' },
    { label: 'Inventario', href: '/dashboard/inventario' },
  ],
  entrega: [
    { label: 'Agenda', href: '/dashboard/agenda' },
    { label: 'Servicios', href: '/dashboard/servicios' },
  ],
}

const rolLabel: Record<string, string> = {
  admin: 'Administrador',
  manager: 'Manager',
  contadora: 'Contadora',
  televenta: 'Agente',
  transporte: 'Transporte',
  cremacion: 'Cremación',
  entrega: 'Entrega',
}

export function Sidebar({ usuario }: { usuario: Usuario }) {
  const pathname = usePathname()
  const [abierto, setAbierto] = useState(false)

  const navItems = navPorRol[usuario.rol] ?? navAdmin

  const contenido = (
    <>
      <div style={{ padding: '24px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>Huellas de Paz</h1>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2, marginBottom: 0 }}>Sistema de gestión</p>
        </div>
        <button
          onClick={() => setAbierto(false)}
          className="sidebar-close"
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#6b7280', padding: 4 }}
        >
          ✕
        </button>
      </div>

      {/* Badge de rol */}
      <div style={{ padding: '10px 20px', borderBottom: '1px solid #f3f4f6' }}>
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          color: usuario.rol === 'manager' ? '#7e22ce' : usuario.rol === 'admin' ? '#1d4ed8' : '#15803d',
          background: usuario.rol === 'manager' ? '#fdf4ff' : usuario.rol === 'admin' ? '#eff6ff' : '#f0fdf4',
          padding: '3px 10px',
          borderRadius: 20,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {rolLabel[usuario.rol] ?? usuario.rol}
        </span>
      </div>

      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map((item) => {
          const activo = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setAbierto(false)}
              style={{
                display: 'block',
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: activo ? 500 : 400,
                color: activo ? 'white' : '#4b5563',
                background: activo ? '#111827' : 'transparent',
                textDecoration: 'none',
              }}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid #f3f4f6' }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: '#111827', margin: 0 }}>{usuario.nombre}</p>
        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2, marginBottom: 0 }}>{rolLabel[usuario.rol] ?? usuario.rol}</p>
      </div>
    </>
  )

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        id="hamburger-btn"
        style={{
          display: 'none', position: 'fixed', top: 14, left: 16, zIndex: 100,
          background: 'white', border: '1px solid #f3f4f6', borderRadius: 8,
          width: 36, height: 36, cursor: 'pointer', fontSize: 18,
          alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}
      >
        ☰
      </button>

      {abierto && (
        <div
          onClick={() => setAbierto(false)}
          id="sidebar-overlay"
          style={{ display: 'none', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }}
        />
      )}

      <aside
        id="sidebar-desktop"
        style={{ width: 240, minWidth: 240, background: 'white', borderRight: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', height: '100vh' }}
      >
        {contenido}
      </aside>

      <aside
        id="sidebar-mobile"
        style={{
          display: 'none', position: 'fixed', top: 0, left: abierto ? 0 : -280,
          width: 260, height: '100vh', background: 'white', zIndex: 50,
          flexDirection: 'column', boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
          transition: 'left 0.25s ease',
        }}
      >
        {contenido}
      </aside>

      <style>{`
        @media (max-width: 768px) {
          #hamburger-btn { display: flex !important; }
          #sidebar-overlay { display: block !important; }
          #sidebar-desktop { display: none !important; }
          #sidebar-mobile { display: flex !important; }
          .sidebar-close { display: block !important; }
        }
      `}</style>
    </>
  )
}