import { Suspense } from 'react'
import { db } from '@/db'
import { clientes, servicios, leads, inventario } from '@/db/schema'
import { count, eq, sql, desc } from 'drizzle-orm'
import Link from 'next/link'

// ─── Shell (renders instantly) ───────────────────────────────────────────────

export default function DashboardPage() {
  const dia = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const diaCap = dia.charAt(0).toUpperCase() + dia.slice(1)

  return (
    <div className="page-container">

      <style>{`
        .stat-card {
          background: white; border-radius: 16px; padding: 22px 24px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04); cursor: pointer;
          transition: box-shadow 0.15s, transform 0.15s;
          height: 100%; box-sizing: border-box;
        }
        .stat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-1px); }
        .dash-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 12px; border-radius: 10px; transition: background 0.1s;
        }
        .dash-row:hover { background: #f9fafb; }
      `}</style>

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>{diaCap}</p>
      </div>

      <Suspense fallback={<KpiSkeleton />}>
        <KpiSection />
      </Suspense>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <Suspense fallback={<CardSkeleton />}>
          <UltimosServicios />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <LeadsSinContactar />
        </Suspense>
      </div>

      <Suspense fallback={null}>
        <StockBajo />
      </Suspense>
    </div>
  )
}

// ─── Async sections ───────────────────────────────────────────────────────────

async function KpiSection() {
  const [totalClientes, totalServicios, leadsNuevos, serviciosActivos] = await Promise.all([
    db.select({ count: count() }).from(clientes),
    db.select({ count: count() }).from(servicios),
    db.select({ count: count() }).from(leads).where(eq(leads.estado, 'nuevo')),
    db.select({ count: count() }).from(servicios).where(eq(servicios.estado, 'en_proceso')),
  ])

  return (
    <div className="grid-4" style={{ marginBottom: 28 }}>
      <StatCard title="Clientes totales" value={totalClientes[0].count} href="/dashboard/clientes" accent="#2d8a54" accentBg="#f0fdf4"
        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
      />
      <StatCard title="Servicios totales" value={totalServicios[0].count} href="/dashboard/servicios" accent="#1d4ed8" accentBg="#eff6ff"
        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>}
      />
      <StatCard title="Leads sin contactar" value={leadsNuevos[0].count} href="/dashboard/leads" accent="#a16207" accentBg="#fefce8" alert={leadsNuevos[0].count > 0}
        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/></svg>}
      />
      <StatCard title="En cremación ahora" value={serviciosActivos[0].count} href="/dashboard/agenda" accent="#7e22ce" accentBg="#fdf4ff"
        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>}
      />
    </div>
  )
}

async function UltimosServicios() {
  const rows = await db.select().from(servicios).orderBy(desc(servicios.creadoEn)).limit(5)

  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f0f0f0', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 }}>Últimos servicios</h2>
        <Link href="/dashboard/servicios" style={{ fontSize: 13, color: '#2d8a54', textDecoration: 'none', fontWeight: 500 }}>Ver todos →</Link>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {rows.length === 0 ? (
          <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>Sin servicios todavía</p>
        ) : rows.map(s => (
          <div key={s.id} className="dash-row">
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#111827', margin: 0, textTransform: 'capitalize' }}>{s.tipo.replace(/_/g, ' ')}</p>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>{new Date(s.creadoEn).toLocaleDateString('es-AR')}</p>
            </div>
            <EstadoBadge estado={s.estado} />
          </div>
        ))}
      </div>
    </div>
  )
}

async function LeadsSinContactar() {
  const rows = await db.select().from(leads).where(eq(leads.estado, 'nuevo')).orderBy(desc(leads.creadoEn)).limit(5)

  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f0f0f0', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 }}>Leads sin contactar</h2>
        <Link href="/dashboard/leads" style={{ fontSize: 13, color: '#2d8a54', textDecoration: 'none', fontWeight: 500 }}>Ver todos →</Link>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {rows.length === 0 ? (
          <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>No hay leads pendientes 🎉</p>
        ) : rows.map(l => (
          <div key={l.id} className="dash-row">
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#111827', margin: 0 }}>{l.nombre}</p>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>{l.telefono} · {l.origen ?? 'sin origen'}</p>
            </div>
            <span style={{ fontSize: 11, color: '#a16207', background: '#fefce8', padding: '3px 10px', borderRadius: 20, fontWeight: 600, border: '1px solid #fde68a' }}>
              nuevo
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

async function StockBajo() {
  const items = await db.select().from(inventario).where(sql`${inventario.stockActual} <= ${inventario.stockMinimo}`)
  if (items.length === 0) return null

  return (
    <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 16, padding: '20px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fb923c20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c2410c" strokeWidth="2.5">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#c2410c', margin: 0 }}>Stock bajo — {items.length} {items.length === 1 ? 'producto' : 'productos'}</h2>
        </div>
        <Link href="/dashboard/inventario" style={{ fontSize: 13, color: '#c2410c', textDecoration: 'none', fontWeight: 500 }}>Ver inventario →</Link>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {items.map(item => (
          <div key={item.id} style={{ background: 'white', borderRadius: 10, padding: '8px 14px', border: '1px solid #fed7aa' }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#111827', margin: 0 }}>{item.nombre}</p>
            <p style={{ fontSize: 12, color: '#c2410c', margin: '2px 0 0' }}>{item.stockActual} restantes / mín {item.stockMinimo}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function KpiSkeleton() {
  return (
    <div className="grid-4" style={{ marginBottom: 28 }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ background: 'white', borderRadius: 16, padding: '22px 24px', border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div className="sk" style={{ height: 13, width: 100, borderRadius: 5 }} />
            <div className="sk" style={{ width: 36, height: 36, borderRadius: 10 }} />
          </div>
          <div className="sk" style={{ height: 38, width: 60, borderRadius: 8 }} />
        </div>
      ))}
      <style>{skStyle}</style>
    </div>
  )
}

function CardSkeleton() {
  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f0f0f0', padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div className="sk" style={{ height: 15, width: 140, borderRadius: 5 }} />
        <div className="sk" style={{ height: 13, width: 60, borderRadius: 5 }} />
      </div>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ height: 44, borderRadius: 10, marginBottom: 4 }} className="sk" />
      ))}
      <style>{skStyle}</style>
    </div>
  )
}

const skStyle = `
  .sk { background: linear-gradient(90deg, #f3f4f6 25%, #e9ebee 50%, #f3f4f6 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
`

// ─── Shared components ────────────────────────────────────────────────────────

const estadoConfig: Record<string, { bg: string; color: string; border: string; label: string }> = {
  ingresado:        { bg: '#f3f4f6', color: '#374151', border: '#e5e7eb', label: 'Ingresado' },
  retiro_pendiente: { bg: '#fefce8', color: '#a16207', border: '#fde68a', label: 'Retiro pendiente' },
  en_transporte:    { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', label: 'En transporte' },
  recibido:         { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe', label: 'Recibido' },
  en_cremacion:     { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa', label: 'En cremación' },
  cremado:          { bg: '#fefce8', color: '#a16207', border: '#fde68a', label: 'Cremado' },
  listo_entrega:    { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', label: 'Listo para entregar' },
  entregado:        { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', label: 'Entregado' },
  cancelado:        { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Cancelado' },
  en_proceso:       { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', label: 'En proceso' },
}

function EstadoBadge({ estado }: { estado: string }) {
  const c = estadoConfig[estado] ?? { bg: '#f3f4f6', color: '#374151', border: '#e5e7eb', label: estado }
  return (
    <span style={{ fontSize: 11, fontWeight: 600, background: c.bg, color: c.color, border: `1px solid ${c.border}`, padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap', flexShrink: 0 }}>
      {c.label}
    </span>
  )
}

function StatCard({ title, value, href, accent, accentBg, icon, alert }: {
  title: string
  value: number
  href: string
  accent: string
  accentBg: string
  icon: React.ReactNode
  alert?: boolean
}) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div className="stat-card" style={{ border: `1px solid ${alert ? '#fed7aa' : '#f0f0f0'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0, fontWeight: 500 }}>{title}</p>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, flexShrink: 0 }}>
            {icon}
          </div>
        </div>
        <p style={{ fontSize: 38, fontWeight: 700, color: alert ? '#c2410c' : '#111827', margin: 0, letterSpacing: '-0.02em', lineHeight: 1 }}>
          {value}
        </p>
      </div>
    </Link>
  )
}
