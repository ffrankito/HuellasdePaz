'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Servicio = {
  id: string
  mascotaId: string | null
  tipo: string
  estado: string
}

type Mascota = {
  id: string
  nombre: string
  foto: string | null
  especie: string
}

const estadoColors: Record<string, { bg: string; color: string; label: string }> = {
  pendiente:  { bg: '#fefce8', color: '#a16207', label: 'Pendiente' },
  en_proceso: { bg: '#eff6ff', color: '#1d4ed8', label: 'En proceso' },
  listo:      { bg: '#f0fdf4', color: '#15803d', label: 'Listo para retirar' },
  entregado:  { bg: '#f0fdf4', color: '#15803d', label: 'Entregado' },
  cancelado:  { bg: '#fef2f2', color: '#dc2626', label: 'Cancelado' },
}

const pasos = ['pendiente', 'en_proceso', 'listo', 'entregado']

export function ServiciosRealtime({
  initialServicios,
  mascotas,
  clienteId,
}: {
  initialServicios: Servicio[]
  mascotas: Mascota[]
  clienteId: string
}) {
  const [serviciosActivos, setServiciosActivos] = useState(
    initialServicios.filter(s => s.estado !== 'entregado' && s.estado !== 'cancelado')
  )
  const [actualizacion, setActualizacion] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`servicios-cliente-${clienteId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'servicios',
          filter: `cliente_id=eq.${clienteId}`,
        },
        (payload) => {
          const updated = payload.new as Servicio
          setServiciosActivos(prev => {
            const filtered = prev.filter(s => s.id !== updated.id)
            if (updated.estado === 'entregado' || updated.estado === 'cancelado') return filtered
            return [{ ...updated }, ...filtered.filter(s => s.id !== updated.id)]
          })
          const badge = estadoColors[updated.estado]
          if (badge) {
            const mascota = mascotas.find(m => m.id === updated.mascotaId)
            setActualizacion(`${mascota?.nombre ?? 'Tu servicio'}: ${badge.label}`)
            setTimeout(() => setActualizacion(null), 5000)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [clienteId, mascotas])

  return (
    <>
      {/* Toast de actualización */}
      {actualizacion && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 999,
          background: '#111827', color: 'white', padding: '12px 20px', borderRadius: 50,
          fontSize: 13, fontWeight: 500, boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2d8a54', display: 'inline-block' }} />
          {actualizacion}
        </div>
      )}

      {serviciosActivos.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>Servicios en curso</h2>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#9ca3af' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2d8a54', display: 'inline-block', animation: 'blink 2s infinite' }} />
              En vivo
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {serviciosActivos.map(s => {
              const mascota = mascotas.find(m => m.id === s.mascotaId)
              const badge = estadoColors[s.estado] ?? { bg: '#f3f4f6', color: '#374151', label: s.estado }
              const pasoActual = pasos.indexOf(s.estado)
              return (
                <div key={s.id} style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>
                        {mascota?.nombre ?? 'Mascota'}
                      </p>
                      <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
                        {s.tipo.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())}
                      </p>
                    </div>
                    <span style={{ background: badge.bg, color: badge.color, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                      {badge.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>Progreso</span>
                    <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{Math.max(pasoActual + 1, 1)} de {pasos.length}</span>
                  </div>
                  <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${((Math.max(pasoActual + 1, 1)) / pasos.length) * 100}%`, height: '100%', background: '#111827', borderRadius: 3, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <style>{`@keyframes blink { 0%, 100% { opacity: 1 } 50% { opacity: 0.3 } }`}</style>
    </>
  )
}
