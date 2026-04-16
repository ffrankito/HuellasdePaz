'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PERMISOS, type Permiso } from '@/db/schema'

const permisoLabel: Record<Permiso, { label: string; descripcion: string }> = {
  gestion_equipo: {
    label: 'Gestión de equipo',
    descripcion: 'Ver agentes, rendimiento y reportes del equipo de ventas',
  },
  ver_reportes: {
    label: 'Ver reportes',
    descripcion: 'Acceso al módulo de reportes generales del negocio',
  },
  configuracion: {
    label: 'Configuración',
    descripcion: 'Acceso a la configuración del sistema',
  },
  cobranzas: {
    label: 'Cobranzas',
    descripcion: 'Acceso al módulo de cobranzas y pagos',
  },
}

type UsuarioConPermisos = {
  id: string
  nombre: string
  email: string
  rol: string
  permisos: string[]
}

export function GestionPermisosUsuario({ usuario }: { usuario: UsuarioConPermisos }) {
  const router = useRouter()
  const [permisos, setPermisos] = useState<string[]>(usuario.permisos ?? [])
  const [loading, setLoading] = useState(false)
  const [guardado, setGuardado] = useState(false)

  // Admin ya tiene todo — no necesita permisos extra
  if (usuario.rol === 'admin') return null

  function togglePermiso(permiso: Permiso) {
    setPermisos(prev =>
      prev.includes(permiso)
        ? prev.filter(p => p !== permiso)
        : [...prev, permiso]
    )
  }

  async function guardar() {
    setLoading(true)
    await fetch(`/api/usuarios/${usuario.id}/permisos`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permisos }),
    })
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2000)
    router.refresh()
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {PERMISOS.map((permiso) => {
        const activo = permisos.includes(permiso)
        const info = permisoLabel[permiso]
        return (
          <div
            key={permiso}
            onClick={() => togglePermiso(permiso)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '12px 16px',
              borderRadius: 10,
              border: `1px solid ${activo ? '#111827' : '#e5e7eb'}`,
              background: activo ? '#f9fafb' : 'white',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {/* Toggle */}
            <div style={{
              width: 36, height: 20, borderRadius: 10, flexShrink: 0,
              background: activo ? '#111827' : '#e5e7eb',
              position: 'relative', transition: 'background 0.2s',
            }}>
              <div style={{
                position: 'absolute', top: 2,
                left: activo ? 18 : 2,
                width: 16, height: 16, borderRadius: '50%',
                background: 'white', transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#111827', margin: 0 }}>
                {info.label}
              </p>
              <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>
                {info.descripcion}
              </p>
            </div>
          </div>
        )
      })}

      <button
        onClick={guardar}
        disabled={loading}
        style={{
          marginTop: 4,
          padding: '10px 20px',
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 500,
          border: 'none',
          background: guardado ? '#15803d' : '#111827',
          color: 'white',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
          alignSelf: 'flex-end',
          transition: 'background 0.2s',
        }}
      >
        {guardado ? '✓ Guardado' : loading ? 'Guardando...' : 'Guardar permisos'}
      </button>
    </div>
  )
}