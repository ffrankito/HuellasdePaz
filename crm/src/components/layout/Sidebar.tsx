'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { type Usuario } from '@/db/schema'
import { createClient } from '@/lib/supabase/client'

const NAV_ICONS: Record<string, React.ReactNode> = {
  '/dashboard': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  '/dashboard/clientes': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  '/dashboard/servicios': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  '/dashboard/planes': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  '/dashboard/agenda': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  '/dashboard/convenios': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  '/dashboard/novedades': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  '/dashboard/comunicacion': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  '/dashboard/inventario': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    </svg>
  ),
  '/dashboard/cobranzas': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  '/dashboard/reportes': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  '/dashboard/leads': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/>
      <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="14.83" y1="9.17" x2="18.36" y2="5.64"/>
      <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/>
    </svg>
  ),
  '/dashboard/mis-leads': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/>
      <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/>
      <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/>
    </svg>
  ),
  '/dashboard/manager/agentes': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  '/dashboard/manager/rendimiento': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  '/dashboard/manager/reportes': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>
    </svg>
  ),
  '/dashboard/mi-rendimiento': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  ),
  '/dashboard/configuracion/importar-leads': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  '/dashboard/asistente': (
    <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M16 2a2.2 2.2 0 0 0-2.07 1.46L10.6 11.4l-8.03 2.6a2.2 2.2 0 0 0 0 4.18l8.03 2.6 3.33 7.94A2.2 2.2 0 0 0 18.07 28.6L21.4 20.78l4.47-1.45a2.2 2.2 0 0 0 0-4.18l-4.47-1.45L18.07 5.76A2.2 2.2 0 0 0 16 2z" opacity="0.9"/>
    </svg>
  ),
}

// ─── Navegación ──────────────────────────────────────────────────────────────

const navAdmin = [
  { label: 'Dashboard',    href: '/dashboard' },
  { label: 'Clientes',     href: '/dashboard/clientes' },
  { label: 'Servicios',    href: '/dashboard/servicios' },
  { label: 'Planes',       href: '/dashboard/planes' },
  { label: 'Agenda',       href: '/dashboard/agenda' },
  { label: 'Convenios',    href: '/dashboard/convenios' },
  { label: 'Novedades',    href: '/dashboard/novedades' },
  { label: 'Comunicación', href: '/dashboard/comunicacion' },
  { label: 'Inventario',   href: '/dashboard/inventario' },
  { label: 'Cobranzas',    href: '/dashboard/cobranzas' },
  { label: 'Reportes',     href: '/dashboard/reportes' },
  { label: 'Asistente',    href: '/dashboard/asistente' },
]

const navManager = [
  { label: 'Dashboard',   href: '/dashboard' },
  { label: 'Todos los leads', href: '/dashboard/leads' },
  { label: 'Agentes',     href: '/dashboard/manager/agentes' },
  { label: 'Rendimiento', href: '/dashboard/manager/rendimiento' },
  { label: 'Reportes',    href: '/dashboard/manager/reportes' },
]

const navAgente = [
  { label: 'Mis leads',       href: '/dashboard/mis-leads' },
  { label: 'Mi rendimiento',  href: '/dashboard/mi-rendimiento' },
  { label: 'Clientes',        href: '/dashboard/clientes' },
  { label: 'Servicios',       href: '/dashboard/servicios' },
  { label: 'Planes',          href: '/dashboard/planes' },
  { label: 'Comunicación',    href: '/dashboard/comunicacion' },
]

const navContadora = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Clientes',  href: '/dashboard/clientes' },
  { label: 'Planes',    href: '/dashboard/planes' },
  { label: 'Cobranzas', href: '/dashboard/cobranzas' },
  { label: 'Reportes',  href: '/dashboard/reportes' },
]

const navTransporte = [
  { label: 'Agenda',    href: '/dashboard/agenda' },
  { label: 'Servicios', href: '/dashboard/servicios' },
]

const navCremacion = [
  { label: 'Agenda',     href: '/dashboard/agenda' },
  { label: 'Servicios',  href: '/dashboard/servicios' },
  { label: 'Inventario', href: '/dashboard/inventario' },
]

const navEntrega = [
  { label: 'Agenda',    href: '/dashboard/agenda' },
  { label: 'Servicios', href: '/dashboard/servicios' },
]

const navGestionEquipo = [
  { label: 'Leads',             href: '/dashboard/leads' },
  { label: 'Importar leads',    href: '/dashboard/configuracion/importar-leads' },
  { label: 'Agentes',           href: '/dashboard/manager/agentes' },
  { label: 'Rendimiento equipo',href: '/dashboard/manager/rendimiento' },
  { label: 'Reportes equipo',   href: '/dashboard/manager/reportes' },
]

const navPorRol: Record<string, { label: string; href: string }[]> = {
  admin:      navAdmin,
  manager:    navManager,
  contadora:  navContadora,
  televenta:  navAgente,
  transporte: navTransporte,
  cremacion:  navCremacion,
  entrega:    navEntrega,
}

// ─── Labels y colores de rol ─────────────────────────────────────────────────

const rolLabel: Record<string, string> = {
  admin:      'Administrador',
  manager:    'Manager',
  contadora:  'Contadora',
  televenta:  'Agente',
  transporte: 'Transporte',
  cremacion:  'Cremación',
  entrega:    'Entrega',
}

const rolColor: Record<string, { bg: string; color: string }> = {
  admin:      { bg: '#eff6ff', color: '#1d4ed8' },
  manager:    { bg: '#fdf4ff', color: '#7e22ce' },
  contadora:  { bg: '#fefce8', color: '#a16207' },
  televenta:  { bg: '#f0fdf4', color: '#15803d' },
  transporte: { bg: '#fff7ed', color: '#c2410c' },
  cremacion:  { bg: '#f3f4f6', color: '#374151' },
  entrega:    { bg: '#f0fdf4', color: '#15803d' },
}

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
  const navBase = navPorRol[usuario.rol] ?? navAdmin
  const tieneGestionEquipo = tienePermiso(usuario, 'gestion_equipo') && usuario.rol !== 'manager'

  const renderNav = (items: { label: string; href: string }[]) =>
    items.map((item) => {
      const activo = pathname === item.href
      const icono = NAV_ICONS[item.href]
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setAbierto(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 12px',
            borderRadius: 9,
            fontSize: 13.5,
            fontWeight: activo ? 600 : 400,
            color: activo ? '#16a34a' : '#4b5563',
            background: activo ? '#f0fdf4' : 'transparent',
            textDecoration: 'none',
            transition: 'background 0.12s, color 0.12s',
            borderLeft: activo ? '3px solid #2d8a54' : '3px solid transparent',
            boxSizing: 'border-box',
          }}
          onMouseEnter={e => {
            if (!activo) {
              (e.currentTarget as HTMLAnchorElement).style.background = '#f9fafb'
              ;(e.currentTarget as HTMLAnchorElement).style.color = '#111827'
            }
          }}
          onMouseLeave={e => {
            if (!activo) {
              (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLAnchorElement).style.color = '#4b5563'
            }
          }}
        >
          {icono && (
            <span style={{ color: activo ? '#2d8a54' : '#9ca3af', display: 'flex', transition: 'color 0.12s' }}>
              {icono}
            </span>
          )}
          {item.label}
        </Link>
      )
    })

  const contenido = (
    <>
      {/* Header */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #e8f5ed, #d1ead9)', border: '1px solid rgba(45,138,84,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8 2 4 6 4 10c0 5 8 12 8 12s8-7 8-12c0-4-4-8-8-8z" fill="#2d8a54"/>
              <circle cx="9"  cy="7"  r="1.5" fill="#aadfc2"/>
              <circle cx="15" cy="7"  r="1.5" fill="#aadfc2"/>
              <circle cx="7"  cy="11" r="1.2" fill="#aadfc2"/>
              <circle cx="17" cy="11" r="1.2" fill="#aadfc2"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: '#111827', margin: 0, letterSpacing: '-0.01em' }}>Huellas de Paz</p>
            <p style={{ fontSize: 10.5, color: '#9ca3af', margin: 0 }}>Sistema de gestión</p>
          </div>
        </div>
        <button
          onClick={() => setAbierto(false)}
          className="sidebar-close"
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9ca3af', padding: 4 }}
        >
          ✕
        </button>
      </div>

      {/* Badge de rol */}
      <div style={{ padding: '10px 18px', borderBottom: '1px solid #f3f4f6' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 11, fontWeight: 600,
          color: badge.color, background: badge.bg,
          padding: '3px 10px', borderRadius: 20,
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          {rolLabel[usuario.rol] ?? usuario.rol}
          {tieneGestionEquipo && <span style={{ opacity: 0.6 }}>+ Manager</span>}
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {renderNav(navBase)}

        {tieneGestionEquipo && (
          <>
            <div style={{ height: 1, background: '#f3f4f6', margin: '10px 4px 8px' }} />
            <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.09em', padding: '0 12px', margin: '0 0 4px' }}>
              Gestión de equipo
            </p>
            {renderNav(navGestionEquipo)}
          </>
        )}
      </nav>

      {/* Footer */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #2d8a54, #1a5233)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>{usuario.nombre.charAt(0).toUpperCase()}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{usuario.nombre}</p>
          <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{rolLabel[usuario.rol] ?? usuario.rol}</p>
        </div>

        <Link
          href="/dashboard/perfil"
          title="Mi cuenta"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 30, height: 30, borderRadius: 8,
            color: pathname === '/dashboard/perfil' ? '#2d8a54' : '#9ca3af',
            background: pathname === '/dashboard/perfil' ? '#f0fdf4' : 'transparent',
            textDecoration: 'none', transition: 'color 0.15s, background 0.15s', flexShrink: 0,
          }}
          onMouseEnter={e => { if (pathname !== '/dashboard/perfil') { (e.currentTarget as HTMLAnchorElement).style.color = '#2d8a54'; (e.currentTarget as HTMLAnchorElement).style.background = '#f0fdf4' } }}
          onMouseLeave={e => { if (pathname !== '/dashboard/perfil') { (e.currentTarget as HTMLAnchorElement).style.color = '#9ca3af'; (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' } }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        </Link>

        {usuario.rol === 'admin' && (
          <Link
            href="/dashboard/configuracion"
            title="Configuración"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 30, height: 30, borderRadius: 8,
              color: pathname === '/dashboard/configuracion' ? '#2d8a54' : '#9ca3af',
              background: pathname === '/dashboard/configuracion' ? '#f0fdf4' : 'transparent',
              textDecoration: 'none', transition: 'color 0.15s, background 0.15s', flexShrink: 0,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </Link>
        )}

        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, color: '#9ca3af', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'color 0.15s, background 0.15s', flexShrink: 0 }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#dc2626'; (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#9ca3af'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 40 }}
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
