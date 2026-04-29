import { db } from '@/db'
import { convenios, leads } from '@/db/schema'
import { eq, count, sql } from 'drizzle-orm'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ConvenioPortalClient } from '@/components/portal/ConvenioPortalClient'

export default async function ConvenioPortalPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const convenio = await db.query.convenios.findFirst({
    where: eq(convenios.tokenPortal, token),
  })
  if (!convenio || !convenio.portalActivo) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.id !== convenio.authUserId) {
    redirect(`/portal/convenio/login`)
  }

  const [statsRow] = await db.select({
    total:       count(),
    convertidos: sql<number>`count(*) filter (where ${leads.estado} = 'convertido')`,
    perdidos:    sql<number>`count(*) filter (where ${leads.estado} = 'perdido')`,
  }).from(leads).where(eq(leads.veterinariaId, convenio.id))

  const leadsData = await db.select({
    id: leads.id,
    nombre: leads.nombre,
    telefono: leads.telefono,
    estado: leads.estado,
    creadoEn: leads.creadoEn,
    mensaje: leads.mensaje,
  }).from(leads).where(eq(leads.veterinariaId, convenio.id))
    .orderBy(leads.creadoEn)
    .limit(50)

  const total       = statsRow.total
  const convertidos = Number(statsRow.convertidos)
  const perdidos    = Number(statsRow.perdidos)
  const enProceso   = total - convertidos - perdidos

  return (
    <div style={{ minHeight: '100vh', background: '#f5f2ee', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>

      <div style={{ background: '#f0faf5', borderBottom: '1px solid #d1ead9', padding: '28px 24px 26px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent 0%, #2d8a54 25%, #4db87a 50%, #2d8a54 75%, transparent 100%)' }} />

        <svg width="120" height="120" viewBox="0 0 24 24" fill="#2d8a54" aria-hidden="true"
          style={{ position: 'absolute', right: -20, top: -20, opacity: 0.05, pointerEvents: 'none' }}>
          <path d="M12 2C8 2 4 6 4 10c0 5 8 12 8 12s8-7 8-12c0-4-4-8-8-8z"/>
          <circle cx="9" cy="7" r="1.5"/><circle cx="15" cy="7" r="1.5"/>
          <circle cx="7" cy="11" r="1.2"/><circle cx="17" cy="11" r="1.2"/>
        </svg>

        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
            <div style={{ width: 22, height: 22, borderRadius: 7, background: 'linear-gradient(135deg, #d1ead9 0%, #aadfc2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8 2 4 6 4 10c0 5 8 12 8 12s8-7 8-12c0-4-4-8-8-8z" fill="#2d8a54"/>
              </svg>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#2d8a54', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Huellas de Paz
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            {convenio.nombre}
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Portal de socios · Huellas de Paz</p>
        </div>
      </div>

      <ConvenioPortalClient
        token={token}
        convenioNombre={convenio.nombre}
        serviciosCubiertos={(convenio.serviciosCubiertos as string[] | null) ?? null}
        initialStats={{ total, convertidos, perdidos, enProceso }}
        initialLeads={leadsData.map(l => ({
          ...l,
          creadoEn: l.creadoEn.toISOString(),
        }))}
      />
    </div>
  )
}
