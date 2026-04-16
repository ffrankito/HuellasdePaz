import { db } from '@/db'
import { leads, usuarios, leadInteracciones } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function MiRendimientoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const usuario = await db.query.usuarios.findFirst({
    where: eq(usuarios.id, user.id),
  })

  if (!usuario || usuario.rol !== 'televenta') redirect('/dashboard')

  const misLeads = await db
    .select()
    .from(leads)
    .where(eq(leads.asignadoAId, usuario.id))
    .orderBy(desc(leads.creadoEn))

  const total = misLeads.length
  const nuevo = misLeads.filter(l => l.estado === 'nuevo').length
  const contactado = misLeads.filter(l => l.estado === 'contactado').length
  const interesado = misLeads.filter(l => l.estado === 'interesado').length
  const cotizado = misLeads.filter(l => l.estado === 'cotizado').length
  const convertido = misLeads.filter(l => l.estado === 'convertido').length
  const perdido = misLeads.filter(l => l.estado === 'perdido').length
  const conversion = total > 0 ? Math.round((convertido / total) * 100) : 0

  // Últimas interacciones del agente
  const interacciones = await db
    .select()
    .from(leadInteracciones)
    .where(eq(leadInteracciones.usuarioId, usuario.id))
    .orderBy(desc(leadInteracciones.creadoEn))
    .limit(10)

  const embudo = [
    { label: 'Nuevos', valor: nuevo, color: '#1d4ed8', bg: '#eff6ff' },
    { label: 'Contactados', valor: contactado, color: '#15803d', bg: '#f0fdf4' },
    { label: 'Interesados', valor: interesado, color: '#a16207', bg: '#fefce8' },
    { label: 'Cotizados', valor: cotizado, color: '#7e22ce', bg: '#fdf4ff' },
    { label: 'Convertidos', valor: convertido, color: '#15803d', bg: '#f0fdf4' },
    { label: 'Perdidos', valor: perdido, color: '#dc2626', bg: '#fef2f2' },
  ]

  return (
    <div className="page-container">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: 0 }}>
          Mi rendimiento
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>
          {usuario.nombre} · Agente de ventas
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 8px' }}>Total leads</p>
          <p style={{ fontSize: 32, fontWeight: 700, color: '#111827', margin: 0 }}>{total}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 8px' }}>Convertidos</p>
          <p style={{ fontSize: 32, fontWeight: 700, color: '#15803d', margin: 0 }}>{convertido}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 8px' }}>Perdidos</p>
          <p style={{ fontSize: 32, fontWeight: 700, color: '#dc2626', margin: 0 }}>{perdido}</p>
        </div>
        <div style={{ background: conversion >= 50 ? '#f0fdf4' : conversion >= 25 ? '#fefce8' : '#fef2f2', borderRadius: 16, border: '1px solid #f3f4f6', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 8px' }}>Conversión</p>
          <p style={{ fontSize: 32, fontWeight: 700, color: conversion >= 50 ? '#15803d' : conversion >= 25 ? '#a16207' : '#dc2626', margin: 0 }}>
            {conversion}%
          </p>
        </div>
      </div>

      <div className="grid-2">
        {/* Embudo */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 20px' }}>
            Embudo de leads
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {embudo.map(e => {
              const ancho = total > 0 ? Math.round((e.valor / total) * 100) : 0
              return (
                <div key={e.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: '#374151' }}>{e.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: e.color }}>{e.valor}</span>
                  </div>
                  <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${ancho}%`, height: '100%', background: e.color, borderRadius: 4, transition: 'width 0.3s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Últimas actividades */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 20px' }}>
            Últimas actividades
          </h2>
          {interacciones.length === 0 ? (
            <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>Sin actividad registrada</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {interacciones.map(i => (
                <div key={i.id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #f9fafb' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#111827', flexShrink: 0, marginTop: 5 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, color: '#374151', margin: '0 0 2px' }}>{i.descripcion}</p>
                    <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>
                      {new Date(i.creadoEn).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span style={{ fontSize: 11, color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: 20, flexShrink: 0, height: 'fit-content' }}>
                    {i.tipo}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}