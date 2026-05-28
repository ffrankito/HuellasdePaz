import { db } from '@/db'
import { clientes, mascotas, servicios, planes } from '@/db/schema'
import { noticiasCementerio } from '@/db/schema/configuracion'
import { eq, desc } from 'drizzle-orm'
import { notFound, redirect } from 'next/navigation'
import { PortalTabs } from '@/components/portal/PortalTabs'
import { LogoutBtn } from '@/components/portal/LogoutBtn'
import { createClient } from '@/lib/supabase/server'

export default async function PortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const cliente = await db.query.clientes.findFirst({
    where: eq(clientes.tokenPortal, token),
  })
  if (!cliente) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Requiere login — el token en la URL ya no es suficiente
  if (!user || user.id !== cliente.authUserId) {
    redirect(`/auth/login`)
  }

  const esClienteLogueado = true

  const [mascotasData, serviciosData, planesData, novedadesData] = await Promise.all([
    db.select().from(mascotas).where(eq(mascotas.clienteId, cliente.id)),
    db.select().from(servicios).where(eq(servicios.clienteId, cliente.id)),
    db.select().from(planes).where(eq(planes.clienteId, cliente.id)),
    db.select().from(noticiasCementerio).where(eq(noticiasCementerio.publicada, true)).orderBy(desc(noticiasCementerio.destacada), desc(noticiasCementerio.creadoEn)),
  ])

  return (
    <div style={{ minHeight: '100vh', background: '#f5f2ee', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>

      {/* Header */}
      <div style={{ background: '#f0f8fa', borderBottom: '1px solid #c8e6ea', padding: '28px 24px 26px', position: 'relative', overflow: 'hidden' }}>
        {/* Acento verde arriba */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent 0%, #1a8a9c 25%, #4db87a 50%, #1a8a9c 75%, transparent 100%)' }} />
        {/* Pata decorativa */}
        <svg width="120" height="120" viewBox="0 0 24 24" fill="#1a8a9c" aria-hidden="true"
          style={{ position: 'absolute', right: -20, top: -20, opacity: 0.05, pointerEvents: 'none' }}>
          <path d="M12 2C8 2 4 6 4 10c0 5 8 12 8 12s8-7 8-12c0-4-4-8-8-8z"/>
          <circle cx="9" cy="7" r="1.5"/><circle cx="15" cy="7" r="1.5"/>
          <circle cx="7" cy="11" r="1.2"/><circle cx="17" cy="11" r="1.2"/>
        </svg>

        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Marca */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Aires de Paz" className="logo-dark" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
            <LogoutBtn redirectTo="/auth/login" />
          </div>

          {/* Saludo */}
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            Hola, {cliente.nombre}
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
            Bienvenido a tu portal personal
          </p>
        </div>
      </div>

      <PortalTabs
        token={token}
        clienteId={cliente.id}
        esClienteLogueado={esClienteLogueado}
        servicios={serviciosData.map(s => ({ id: s.id, mascotaId: s.mascotaId, tipo: s.tipo, estado: s.estado }))}
        mascotas={mascotasData.map(m => ({ id: m.id, nombre: m.nombre, foto: m.foto ?? null, especie: m.especie, raza: m.raza ?? null, fechaNacimiento: m.fechaNacimiento ?? null, fechaFallecimiento: m.fechaFallecimiento ?? null, dedicatoria: m.dedicatoria ?? null, galeria: (m.galeria ?? []) as string[], memoriaPublica: m.memoriaPublica ?? false }))}
        planes={planesData.map(p => ({ id: p.id, cuotasPagadas: p.cuotasPagadas, cuotasTotales: p.cuotasTotales, estado: p.estado, nombre: null }))}
        novedades={novedadesData.map(n => ({ id: n.id, titulo: n.titulo, contenido: n.contenido, imagen: n.imagen ?? null, creadoEn: n.creadoEn }))}
      />

    </div>
  )
}
