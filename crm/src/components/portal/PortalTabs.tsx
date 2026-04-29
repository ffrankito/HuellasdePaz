'use client'

import { useState } from 'react'
import { ServiciosRealtime } from './ServiciosRealtime'
import { CambiarFotoMascota } from './CambiarFotoMascota'
import { EditarMemorialInline } from './EditarMemorialInline'
import { CompartirButtonClient } from './CompartirButton'
import type { Mascota as MascotaDB } from '@/db/schema'

type Mascota = { id: string; nombre: string; foto: string | null; especie: string; raza: string | null; fechaNacimiento: string | null; fechaFallecimiento: string | null; dedicatoria: string | null; galeria: string[]; memoriaPublica: boolean }
type Servicio = { id: string; mascotaId: string | null; tipo: string; estado: string }
type Plan = { id: string; cuotasPagadas: number | null; cuotasTotales: number; estado: string; nombre?: string | null }
type Novedad = { id: string; titulo: string; contenido: string; imagen: string | null; creadoEn: Date }

type Tab = 'servicio' | 'plan' | 'memorial' | 'novedades'

function formatFecha(d: Date) {
  return new Date(d).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function PortalTabs({
  token,
  clienteId,
  servicios,
  mascotas,
  planes,
  novedades,
  esClienteLogueado,
}: {
  token: string
  clienteId: string
  servicios: Servicio[]
  mascotas: Mascota[]
  planes: Plan[]
  novedades: Novedad[]
  esClienteLogueado: boolean
}) {
  const serviciosActivos = servicios.filter(s => s.estado !== 'entregado' && s.estado !== 'cancelado')

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = []

  if (servicios.length > 0) tabs.push({
    id: 'servicio',
    label: 'Servicio',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  })

  if (planes.length > 0) tabs.push({
    id: 'plan',
    label: 'Mi plan',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  })

  if (mascotas.length > 0) tabs.push({
    id: 'memorial',
    label: 'Memorial',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  })

  tabs.push({
    id: 'novedades',
    label: 'Novedades',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
  })

  const defaultTab: Tab =
    serviciosActivos.length > 0 ? 'servicio' :
    planes.length > 0 ? 'plan' :
    mascotas.length > 0 ? 'memorial' :
    'novedades'

  const [active, setActive] = useState<Tab>(defaultTab)
  const [memorialAbierto, setMemorialAbierto] = useState<Mascota | null>(null)

  return (
    <>
      {/* Tab bar */}
      <div style={{ background: '#faf9f7', borderBottom: '1px solid #ddd8d0', position: 'sticky', top: 0, zIndex: 10, overflowX: 'auto' }}>
        <div style={{ display: 'flex', maxWidth: 640, margin: '0 auto', paddingLeft: 4, paddingRight: 4 }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '14px 18px',
                border: 'none', background: 'none',
                borderBottom: active === tab.id ? '2px solid #2d8a54' : '2px solid transparent',
                color: active === tab.id ? '#1e1a16' : '#a89f94',
                fontWeight: active === tab.id ? 600 : 400,
                fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'color 0.15s, border-color 0.15s',
                fontFamily: 'inherit',
              }}
            >
              <span style={{ opacity: active === tab.id ? 1 : 0.45 }}>{tab.icon}</span>
              {tab.label}
              {tab.id === 'servicio' && serviciosActivos.length > 0 && (
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2d8a54', display: 'inline-block', animation: 'blink 2s infinite' }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px' }}>

        {/* Tab: Servicio */}
        {active === 'servicio' && (
          <div>
            <ServiciosRealtime
              initialServicios={servicios}
              mascotas={mascotas.map(m => ({ id: m.id, nombre: m.nombre, foto: m.foto, especie: m.especie }))}
              clienteId={clienteId}
            />
            {serviciosActivos.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af', fontSize: 14 }}>
                <p style={{ margin: 0 }}>No hay servicios activos en este momento.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Plan */}
        {active === 'plan' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {planes.map(p => {
              const pagadas = p.cuotasPagadas ?? 0
              const progreso = Math.round((pagadas / p.cuotasTotales) * 100)
              const cobertura = pagadas <= 6 ? '0%' : pagadas <= 12 ? '50%' : '100%'
              return (
                <div key={p.id} style={{ background: 'white', borderRadius: 16, border: '1px solid #e8e4de', padding: '24px', boxShadow: '0 1px 4px rgba(30,26,22,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>
                      {p.nombre ?? 'Plan de previsión'}
                    </p>
                    <span style={{ fontSize: 12, fontWeight: 500, background: p.estado === 'activo' ? '#f0fdf4' : '#f3f4f6', color: p.estado === 'activo' ? '#15803d' : '#6b7280', padding: '3px 10px', borderRadius: 20 }}>
                      {p.estado}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: '#6b7280' }}>Cuotas pagadas</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{pagadas} / {p.cuotasTotales}</span>
                  </div>
                  <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden', marginBottom: 14 }}>
                    <div style={{ width: `${progreso}%`, height: '100%', background: '#111827', borderRadius: 4, transition: 'width 0.6s ease' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#f5f2ee', borderRadius: 12 }}>
                    <div>
                      <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cobertura actual</p>
                      <p style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>{cobertura}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Completado</p>
                      <p style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>{progreso}%</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Tab: Memorial */}
        {active === 'memorial' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mascotas.map(m => {
              const emoji = m.especie === 'perro' ? '🐕' : m.especie === 'gato' ? '🐈' : '🐾'
              return (
                <button key={m.id} onClick={() => setMemorialAbierto(m)} style={{ textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer', width: '100%' }}>
                  <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e8e4de', padding: '20px', boxShadow: '0 1px 4px rgba(30,26,22,0.06)', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#f0ede8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0, overflow: 'hidden' }}>
                      {m.foto ? (
                        <img src={m.foto} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 16, fontWeight: 600, color: '#1e1a16', margin: '0 0 2px' }}>{m.nombre}</p>
                      <p style={{ fontSize: 13, color: '#6b6259', margin: '0 0 2px', textTransform: 'capitalize' }}>
                        {m.especie}{m.raza ? ` · ${m.raza}` : ''}
                      </p>
                      {m.fechaFallecimiento && (
                        <p style={{ fontSize: 12, color: '#a89f94', margin: 0 }}>
                          {new Date(m.fechaFallecimiento).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                    <span style={{ fontSize: 13, color: '#a89f94', flexShrink: 0 }}>Ver →</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Tab: Novedades */}
        {active === 'novedades' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {novedades.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af', fontSize: 14 }}>
                <p style={{ margin: 0 }}>No hay novedades publicadas todavía.</p>
              </div>
            ) : (
              novedades.map(n => (
                <article key={n.id} style={{ background: 'white', borderRadius: 16, border: '1px solid #e8e4de', overflow: 'hidden', boxShadow: '0 1px 4px rgba(30,26,22,0.06)' }}>
                  {n.imagen && (
                    <div style={{ height: 180, overflow: 'hidden', position: 'relative' }}>
                      <img src={n.imagen} alt={n.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)' }} />
                      <span style={{ position: 'absolute', bottom: 12, left: 16, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {formatFecha(n.creadoEn)}
                      </span>
                    </div>
                  )}
                  <div style={{ padding: '18px 20px' }}>
                    {!n.imagen && (
                      <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                        {formatFecha(n.creadoEn)}
                      </p>
                    )}
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                      {n.titulo}
                    </h3>
                    <p style={{ fontSize: 14, color: '#4b5563', margin: 0, lineHeight: 1.65 }}>
                      {n.contenido}
                    </p>
                  </div>
                </article>
              ))
            )}
          </div>
        )}

      </div>

      {/* Memorial bottom sheet */}
      {memorialAbierto && (
        <MemorialSheet
          mascota={memorialAbierto}
          token={token}
          esEditor={esClienteLogueado}
          servicioId={servicios.find(s => s.mascotaId === memorialAbierto.id)?.id ?? null}
          onClose={() => setMemorialAbierto(null)}
        />
      )}

      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1 } 50% { opacity: 0.3 } }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        .memorial-sheet-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  )
}

function MemorialSheet({ mascota, token, esEditor, servicioId, onClose }: {
  mascota: Mascota
  token: string
  esEditor: boolean
  servicioId: string | null
  onClose: () => void
}) {
  const galeria = mascota.galeria ?? []

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  // Cast local type to full DB type for edit components (unused fields are null/defaults)
  const mascotaDb: MascotaDB = {
    id: mascota.id,
    clienteId: '',
    nombre: mascota.nombre,
    especie: mascota.especie,
    raza: mascota.raza ?? null,
    color: null,
    fechaNacimiento: mascota.fechaNacimiento ?? null,
    fechaFallecimiento: mascota.fechaFallecimiento ?? null,
    foto: mascota.foto ?? null,
    galeria: mascota.galeria,
    notas: null,
    creadoEn: new Date(),
    actualizadoEn: new Date(),
    dedicatoria: mascota.dedicatoria ?? null,
    memoriaPublica: mascota.memoriaPublica,
  }

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, animation: 'fadeIn 0.2s ease' }} />

      {/* Sheet */}
      <div
        className="memorial-sheet-scroll"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
          background: '#f5f2ee',
          borderRadius: '20px 20px 0 0',
          maxHeight: '92vh',
          overflowY: 'auto',
          animation: 'slideUp 0.32s cubic-bezier(0.32, 0.72, 0, 1)',
          scrollbarWidth: 'none',
        }}
      >
        {/* Handle + cerrar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px', position: 'relative' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#ddd8d0' }} />
          <button onClick={onClose} style={{ position: 'absolute', right: 16, top: 8, background: 'white', border: '1px solid #e8e4de', borderRadius: '50%', width: 30, height: 30, color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div style={{ maxWidth: 480, margin: '0 auto', padding: '4px 16px 52px' }}>

          {/* Hero con foto editable */}
          <CambiarFotoMascota
            mascotaId={mascota.id}
            token={token}
            fotoActual={mascota.foto ?? null}
            nombre={mascota.nombre}
            especie={mascota.especie}
            raza={mascota.raza ?? null}
            esEditor={esEditor}
          />

          {/* Fechas */}
          {(mascota.fechaNacimiento || mascota.fechaFallecimiento) && (
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e8e4de', padding: '16px 20px', marginTop: 12, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {mascota.fechaNacimiento && (
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <p style={{ fontSize: 10, color: '#a89f94', margin: '0 0 3px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Nació</p>
                  <p style={{ fontSize: 13, color: '#374151', margin: 0, fontWeight: 500 }}>{formatDate(mascota.fechaNacimiento)}</p>
                </div>
              )}
              {mascota.fechaNacimiento && mascota.fechaFallecimiento && (
                <span style={{ fontSize: 16, padding: '0 12px', opacity: 0.35 }}>🕯️</span>
              )}
              {mascota.fechaFallecimiento && (
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <p style={{ fontSize: 10, color: '#a89f94', margin: '0 0 3px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Partió</p>
                  <p style={{ fontSize: 13, color: '#374151', margin: 0, fontWeight: 500 }}>{formatDate(mascota.fechaFallecimiento)}</p>
                </div>
              )}
            </div>
          )}

          {/* Dedicatoria */}
          {mascota.dedicatoria && (
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e8e4de', padding: '18px 20px', marginTop: 12, display: 'flex', gap: 14 }}>
              <div style={{ width: 3, flexShrink: 0, background: 'linear-gradient(to bottom, #2d8a54, rgba(45,138,84,0.1))', borderRadius: 2 }} />
              <div>
                <p style={{ fontSize: 10, color: '#a89f94', margin: '0 0 8px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Dedicatoria</p>
                <p style={{ fontSize: 15, color: '#374151', margin: 0, lineHeight: 1.75, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
                  {mascota.dedicatoria}
                </p>
              </div>
            </div>
          )}

          {/* Galería */}
          {galeria.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: 10, color: '#a89f94', margin: '0 0 10px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, paddingLeft: 2 }}>Galería</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {galeria.map((url, i) => (
                  <div key={i} style={{ aspectRatio: '1', borderRadius: 14, overflow: 'hidden', border: '1px solid #e8e4de' }}>
                    <img src={url} alt={`Foto ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botones: compartir + certificado */}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <CompartirButtonClient nombre={mascota.nombre} />
            {servicioId && (
              <a
                href={`/api/portal/certificado/${servicioId}?token=${token}`}
                target="_blank"
                style={{ flex: 1, padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 500, border: '1px solid #e8e4de', background: 'white', color: '#374151', textDecoration: 'none', textAlign: 'center' as const, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                Certificado
              </a>
            )}
          </div>

          {/* Editar memorial — siempre visible, el API valida el token */}
          <div style={{ marginTop: 10 }}>
            <EditarMemorialInline mascota={mascotaDb} token={token} />
          </div>

        </div>
      </div>
    </>
  )
}
