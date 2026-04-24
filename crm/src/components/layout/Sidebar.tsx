'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { type Usuario } from '@/db/schema'
import { createClient } from '@/lib/supabase/client'

// ─── Navegación por rol operativo ───────────────────────────────────────────

const navAdmin = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Clientes', href: '/dashboard/clientes' },
  { label: 'Servicios', href: '/dashboard/servicios' },
  { label: 'Planes', href: '/dashboard/planes' },
  { label: 'Agenda', href: '/dashboard/agenda' },
  { label: 'Convenios', href: '/dashboard/convenios' },
  { label: 'Comunicación', href: '/dashboard/comunicacion' },
  { label: 'Inventario', href: '/dashboard/inventario' },
  { label: 'Cobranzas', href: '/dashboard/cobranzas' },
  { label: 'Reportes', href: '/dashboard/reportes' },
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

const navContadora = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Clientes', href: '/dashboard/clientes' },
  { label: 'Planes', href: '/dashboard/planes' },
  { label: 'Cobranzas', href: '/dashboard/cobranzas' },
  { label: 'Reportes', href: '/dashboard/reportes' },
]

const navTransporte = [
  { label: 'Agenda', href: '/dashboard/agenda' },
  { label: 'Servicios', href: '/dashboard/servicios' },
]

const navCremacion = [
  { label: 'Agenda', href: '/dashboard/agenda' },
  { label: 'Servicios', href: '/dashboard/servicios' },
  { label: 'Inventario', href: '/dashboard/inventario' },
]

const navEntrega = [
  { label: 'Agenda', href: '/dashboard/agenda' },
  { label: 'Servicios', href: '/dashboard/servicios' },
]

const navPorRol: Record<string, { label: string; href: string }[]> = {
  admin: navAdmin,
  manager: navManager,
  contadora: navContadora,
  televenta: navAgente,
  transporte: navTransporte,
  cremacion: navCremacion,
  entrega: navEntrega,
}

// ─── Secciones extra por permiso ────────────────────────────────────────────

const navGestionEquipo = [
  { label: 'Leads', href: '/dashboard/leads' },
  { label: 'Importar leads', href: '/dashboard/configuracion/importar-leads' },
  { label: 'Agentes', href: '/dashboard/manager/agentes' },
  { label: 'Rendimiento equipo', href: '/dashboard/manager/rendimiento' },
  { label: 'Reportes equipo', href: '/dashboard/manager/reportes' },
]
// ─── Labels y colores ────────────────────────────────────────────────────────

const rolLabel: Record<string, string> = {
  admin: 'Administrador',
  manager: 'Manager',
  contadora: 'Contadora',
  televenta: 'Agente',
  transporte: 'Transporte',
  cremacion: 'Cremación',
  entrega: 'Entrega',
}

const rolColor: Record<string, { bg: string; color: string }> = {
  admin: { bg: '#eff6ff', color: '#1d4ed8' },
  manager: { bg: '#fdf4ff', color: '#7e22ce' },
  contadora: { bg: '#fefce8', color: '#a16207' },
  televenta: { bg: '#f0fdf4', color: '#15803d' },
  transporte: { bg: '#fff7ed', color: '#c2410c' },
  cremacion: { bg: '#f3f4f6', color: '#374151' },
  entrega: { bg: '#f0fdf4', color: '#15803d' },
}

// ─── Helper de permisos ──────────────────────────────────────────────────────

function tienePermiso(usuario: Usuario, permiso: string): boolean {
  if (usuario.rol === 'admin') return true
  return (usuario.permisos ?? []).includes(permiso)
}

// ─── Componente ──────────────────────────────────────────────────────────────

export function Sidebar({ usuario }: { usuario: Usuario }) {
  const pathname = usePathname()
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const badge = rolColor[usuario.rol] ?? { bg: '#f3f4f6', color: '#374151' }

  // Nav base según rol
  const navBase = navPorRol[usuario.rol] ?? navAdmin

  // Si tiene permiso gestion_equipo y NO es manager puro (para no duplicar),
  // se agrega la sección de equipo al final
  const tieneGestionEquipo = tienePermiso(usuario, 'gestion_equipo') && usuario.rol !== 'manager'

  const renderNav = (items: { label: string; href: string }[]) =>
    items.map((item) => {
      const activo = pathname === item.href
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setAbierto(false)}
          style={{
            display: 'block',
            padding: '9px 14px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: activo ? 500 : 400,
            color: activo ? 'white' : '#4b5563',
            background: activo ? '#111827' : 'transparent',
            textDecoration: 'none',
            transition: 'background 0.1s',
          }}
        >
          {item.label}
        </Link>
      )
    })

  const contenido = (
    <>
      {/* Logo */}
      <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Huellas de Paz</h1>
          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 2, marginBottom: 0 }}>Sistema de gestión</p>
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
          fontSize: 11, fontWeight: 600,
          color: badge.color, background: badge.bg,
          padding: '3px 10px', borderRadius: 20,
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          {rolLabel[usuario.rol] ?? usuario.rol}
          {tieneGestionEquipo && (
            <span style={{ marginLeft: 6, opacity: 0.7 }}>+ Manager</span>
          )}
        </span>
      </div>

      {/* Navegación */}
      <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>

        {/* Nav principal del rol */}
        {renderNav(navBase)}

        {/* Sección de gestión de equipo si tiene permiso */}
        {tieneGestionEquipo && (
          <>
            <div style={{ height: 1, background: '#f3f4f6', margin: '10px 4px 6px' }} />
            <p style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 14px', margin: '0 0 4px' }}>
              Gestión de equipo
            </p>
            {renderNav(navGestionEquipo)}
          </>
        )}

      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Avatar + nombre */}
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'white' }}>{usuario.nombre.charAt(0).toUpperCase()}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{usuario.nombre}</p>
          <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{rolLabel[usuario.rol] ?? usuario.rol}</p>
        </div>

        {/* Configuración (solo admin) */}
        {usuario.rol === 'admin' && (
          <Link
            href="/dashboard/configuracion"
            title="Configuración"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, color: pathname === '/dashboard/configuracion' ? '#111827' : '#9ca3af', background: pathname === '/dashboard/configuracion' ? '#f3f4f6' : 'transparent', textDecoration: 'none', transition: 'color 0.15s, background 0.15s', flexShrink: 0 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </Link>
        )}

        {/* Cerrar sesión */}
        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, color: '#9ca3af', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'color 0.15s, background 0.15s', flexShrink: 0 }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#dc2626'; (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#9ca3af'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
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
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }}
        />
      )}

      <aside
        id="sidebar-desktop"
        style={{ width: 240, minWidth: 240, background: 'white', borderRight: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}
      >
        {contenido}
      </aside>

      <aside
        id="sidebar-mobile"
        style={{
          display: 'none', position: 'fixed', top: 0,
          left: abierto ? 0 : -280,
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
          #sidebar-desktop { display: none !important; }
          #sidebar-mobile { display: flex !important; }
          .sidebar-close { display: block !important; }
        }
      `}</style>
    </>
  )
}