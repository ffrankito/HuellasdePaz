'use client'

import { useState, useEffect } from 'react'

type ItemInventario = {
  id: string
  nombre: string
  descripcion: string | null
  categoria: string
  stockActual: number
  precioUnitario: string | null
  foto: string | null
}

const CATEGORIA_LABEL: Record<string, string> = {
  urna: 'Urna',
  caja: 'Caja',
  accesorio: 'Accesorio',
}

const CATEGORIA_COLOR: Record<string, { bg: string; text: string }> = {
  urna:      { bg: '#f0faf5', text: '#2d8a54' },
  caja:      { bg: '#f0f9ff', text: '#0369a1' },
  accesorio: { bg: '#faf5ff', text: '#7c3aed' },
}

export function SelectorProducto({
  value,
  onChange,
  items: itemsProp,
}: {
  value: string | null
  onChange: (id: string | null) => void
  items?: ItemInventario[]
}) {
  const [items, setItems] = useState<ItemInventario[]>(itemsProp ?? [])
  const [cargando, setCargando] = useState(!itemsProp)

  useEffect(() => {
    if (itemsProp !== undefined) {
      setItems(itemsProp)
      setCargando(false)
      return
    }
    fetch('/api/inventario?selector=true')
      .then(r => r.ok ? r.json() : [])
      .then(data => { setItems(data); setCargando(false) })
      .catch(() => setCargando(false))
  }, [itemsProp])

  if (cargando) return (
    <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Cargando productos...</p>
  )

  if (items.length === 0) return (
    <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>No hay productos con stock disponible.</p>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Opción: sin producto */}
      <button
        type="button"
        onClick={() => onChange(null)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 14px', borderRadius: 10, textAlign: 'left',
          border: `1.5px solid ${value === null ? '#111827' : '#e5e7eb'}`,
          background: value === null ? '#f9fafb' : 'white',
          cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>
        <span style={{ fontSize: 13, color: '#6b7280' }}>Sin producto adicional</span>
        {value === null && (
          <svg style={{ marginLeft: 'auto' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </button>

      {items.map(item => {
        const seleccionado = value === item.id
        const colores = CATEGORIA_COLOR[item.categoria] ?? { bg: '#f9fafb', text: '#6b7280' }
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(seleccionado ? null : item.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 10, textAlign: 'left',
              border: `1.5px solid ${seleccionado ? '#2d8a54' : '#e5e7eb'}`,
              background: seleccionado ? '#f0faf5' : 'white',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {/* Foto o placeholder */}
            <div style={{
              width: 40, height: 40, borderRadius: 8, flexShrink: 0, overflow: 'hidden',
              background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {item.foto
                ? <img src={item.foto} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                  </svg>
              }
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.nombre}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 20,
                  background: colores.bg, color: colores.text, flexShrink: 0,
                }}>
                  {CATEGORIA_LABEL[item.categoria] ?? item.categoria}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                {item.precioUnitario && (
                  <span style={{ color: '#6b7280' }}>${Number(item.precioUnitario).toLocaleString('es-AR')}</span>
                )}
                <span style={{ color: item.stockActual <= 3 ? '#d97706' : '#9ca3af' }}>
                  Stock: {item.stockActual}
                </span>
              </div>
            </div>

            {seleccionado && (
              <svg style={{ flexShrink: 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2d8a54" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </button>
        )
      })}
    </div>
  )
}
