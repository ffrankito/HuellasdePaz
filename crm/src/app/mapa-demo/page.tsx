'use client'

import { useEffect, useRef, useState } from 'react'

// ── Coordenadas reales OSM Way 830425328 "Aires de Paz" ───────────────────────
const BOUNDARY: [number, number][] = [
  [-33.0796781, -60.5954656], [-33.0794398, -60.5949533],
  [-33.0794106, -60.5943391], [-33.0793319, -60.5923757],
  [-33.0792690, -60.5898088], [-33.0808489, -60.5897284],
  [-33.0811051, -60.5897874], [-33.0812849, -60.5898652],
  [-33.0814005, -60.5899490], [-33.0814468, -60.5899966],
  [-33.0815726, -60.5901334], [-33.0817254, -60.5902916],
  [-33.0818244, -60.5905116], [-33.0819322, -60.5908522],
  [-33.0819884, -60.5913537], [-33.0820738, -60.5932769],
  [-33.0820468, -60.5934486], [-33.0809029, -60.5944088],
]

// Borde oeste: diagonal node18[-33.0809,-60.5944] → node1[-33.0797,-60.5955]
// En lat -33.0807 (borde sur del Sector A) el límite oeste real es ≈ -60.5946.
// En lat -33.0819 (borde sur de Sector C) el límite oeste real es ≈ -60.5935.
// Los sectores respetan esa geometría.
const SECTORES = [
  {
    id: 'A', label: 'Sector A', color: '#2d8a54',
    // NW — parte norte, mitad oeste
    bounds: [[-33.0795, -60.5946], [-33.0807, -60.5922]] as [[number,number],[number,number]],
  },
  {
    id: 'B', label: 'Sector B', color: '#3b82f6',
    // NE — parte norte, mitad este
    bounds: [[-33.0794, -60.5920], [-33.0807, -60.5899]] as [[number,number],[number,number]],
  },
  {
    id: 'C', label: 'Sector C', color: '#f97316',
    // SW — parte sur, mitad oeste (estrecha por el límite diagonal)
    bounds: [[-33.0808, -60.5934], [-33.0819, -60.5922]] as [[number,number],[number,number]],
  },
  {
    id: 'D', label: 'Sector D', color: '#06b6d4',
    // SE — parte sur, mitad este
    bounds: [[-33.0808, -60.5920], [-33.0819, -60.5901]] as [[number,number],[number,number]],
  },
]

// Edificio del crematorio — posición aproximada basada en OSM
const CREMATORIO: [number, number] = [-33.0806, -60.5933]

// Parcela demo a destacar
const MASCOTA = { nombre: 'Simón', especie: 'Perro', raza: 'Golden Retriever', sector: 'A', fila: 2, parcela: 5 }

// Parcelas Sector A: 4 filas × 3 cols = 12 parcelas, idx 1–12
// idx=5 → r=1 (fila 2), c=1 (col central)
const LAT_START = -33.0795   // norte del área de parcelas (dentro del Sector A)
const LAT_END   = -33.0807   // sur
const LNG_START = -60.5944   // oeste (dentro del límite diagonal en todo el rango de lat)
const LNG_END   = -60.5924   // este
const N_ROWS = 4
const N_COLS = 3
const D_LAT = (LAT_END - LAT_START) / N_ROWS   // negativo → avanza hacia el sur
const D_LNG = (LNG_END - LNG_START) / N_COLS   // positivo → avanza hacia el este

export default function MapaDemoPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)
  const [mostrarPanel, setMostrarPanel] = useState(true)

  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return

    // Inyectar CSS de Leaflet y esperar que cargue antes de instanciar el mapa
    const ensureLeafletCSS = () =>
      new Promise<void>(resolve => {
        if (document.querySelector('link[href*="leaflet@1.9.4/dist/leaflet.css"]')) return resolve()
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        link.onload = () => resolve()
        link.onerror = () => resolve()  // continuar aunque falle el CDN
        document.head.appendChild(link)
      })

    ensureLeafletCSS()
      .then(() => import('leaflet'))
      .then(L => {
        delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        })

        const map = L.map(mapRef.current!, {
          center: [-33.0807, -60.5922],
          zoom: 16,
          zoomControl: true,
          attributionControl: false,
        })

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 20 }).addTo(map)

        // Contorno real del cementerio
        L.polygon(BOUNDARY, {
          color: '#2d8a54', weight: 3,
          fillColor: 'transparent', fillOpacity: 0,
          dashArray: '6,4',
        }).addTo(map)

        // Sectores
        SECTORES.forEach(s => {
          L.rectangle(s.bounds, {
            color: s.color, weight: 2,
            fillColor: s.color, fillOpacity: 0.13,
            dashArray: '4,3',
          })
            .bindTooltip(s.label, { permanent: true, direction: 'center', className: 'sector-label' })
            .addTo(map)
        })

        // Parcelas Sector A — 4 filas × 3 columnas, calibradas dentro del polígono
        const pad = 0.000015

        for (let r = 0; r < N_ROWS; r++) {
          for (let c = 0; c < N_COLS; c++) {
            const idx = r * N_COLS + c + 1
            const latA = LAT_START + r * D_LAT + pad
            const latB = LAT_START + (r + 1) * D_LAT - pad
            const lngA = LNG_START + c * D_LNG + pad
            const lngB = LNG_START + (c + 1) * D_LNG - pad
            const isDemo = idx === MASCOTA.parcela

            L.rectangle([[latA, lngA], [latB, lngB]], {
              color:       isDemo ? '#f59e0b' : '#2d8a54',
              weight:      isDemo ? 3 : 1.5,
              fillColor:   isDemo ? '#f59e0b' : '#2d8a54',
              fillOpacity: isDemo ? 0.7 : 0.35,
            })
              .bindTooltip(`A-${idx}`, { direction: 'center', className: 'parcel-label' })
              .addTo(map)
          }
        }

        // Marcador "Crematorio"
        const crematorioIcon = L.divIcon({
          html: `<div style="background:white;border:2px solid #64748b;border-radius:8px;padding:5px 9px;display:flex;align-items:center;gap:5px;box-shadow:0 2px 10px rgba(0,0,0,0.25);white-space:nowrap">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span style="font-size:11px;font-weight:700;color:#1e293b">Crematorio</span>
          </div>`,
          iconAnchor: [55, 18], className: '',
        })
        L.marker(CREMATORIO, { icon: crematorioIcon })
          .bindPopup('<b>Edificio del Crematorio</b><br><span style="color:#64748b;font-size:12px">Instalaciones de Huellas de Paz</span>')
          .addTo(map)

        // Marcador "Entrada"
        const entradaIcon = L.divIcon({
          html: `<div style="background:#f59e0b;color:white;font-size:11px;font-weight:700;padding:3px 9px;border-radius:12px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.3)">⬤ Entrada</div>`,
          iconAnchor: [36, 14], className: '',
        })
        L.marker([-33.0808, -60.5898], { icon: entradaIcon }).addTo(map)

        // Marcador parcela demo — idx=5 corresponde a r=1, c=1 (fila 2, col central)
        const demoLat = LAT_START + (1 + 0.5) * D_LAT   // centro de fila r=1
        const demoLng = LNG_START + (1 + 0.5) * D_LNG   // centro de col c=1
        const demoIcon = L.divIcon({
          html: `<div style="background:#f59e0b;border:3px solid white;border-radius:50%;width:18px;height:18px;box-shadow:0 0 0 3px rgba(245,158,11,0.4)"></div>`,
          iconAnchor: [9, 9], className: '',
        })
        L.marker([demoLat, demoLng], { icon: demoIcon })
          .bindPopup(`<b>${MASCOTA.nombre}</b><br>Sector ${MASCOTA.sector} · Fila ${MASCOTA.fila} · Parcela ${MASCOTA.parcela}`)
          .addTo(map)
          .openPopup()

        mapInstanceRef.current = map
      })

    return () => {
      if (mapInstanceRef.current) {
        ;(mapInstanceRef.current as { remove: () => void }).remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif', background: '#0f172a' }}>
      <style>{`
        .sector-label { background: transparent; border: none; box-shadow: none; font-weight: 800; font-size: 14px; color: white; text-shadow: 0 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5); letter-spacing: 0.04em; }
        .parcel-label { background: rgba(15,23,42,0.85); border: none; color: white; font-size: 10px; font-weight: 700; border-radius: 4px; padding: 2px 5px; }
        .leaflet-popup-content-wrapper { border-radius: 12px; font-size: 13px; box-shadow: 0 8px 24px rgba(0,0,0,0.18); border: 1px solid #e2e8f0; }
        .leaflet-popup-tip { background: white; }
        .leaflet-control-zoom { border-radius: 10px !important; overflow: hidden; border: none !important; box-shadow: 0 2px 10px rgba(0,0,0,0.15) !important; }
        .leaflet-control-zoom a { background: white !important; color: #1e293b !important; font-size: 16px !important; }
        .leaflet-control-zoom a:hover { background: #f1f5f9 !important; }
      `}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderBottom: '1px solid #334155', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: '#2d8a5420', border: '1px solid #2d8a5450', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🐾</div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'white', margin: 0, letterSpacing: '-0.01em' }}>Ubicación de <span style={{ color: '#4ade80' }}>{MASCOTA.nombre}</span></p>
            <p style={{ fontSize: 11, color: '#64748b', margin: 0, marginTop: 2 }}>Cementerio Parque Aires de Paz · Rosario, Santa Fe</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {SECTORES.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: `${s.color}18`, border: `1px solid ${s.color}40` }}>
              <div style={{ width: 7, height: 7, borderRadius: 2, background: s.color }} />
              <span style={{ fontSize: 11, color: s.color, fontWeight: 700 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mapa + Panel */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div ref={mapRef} style={{ flex: 1 }} />

        {mostrarPanel && (
          <div style={{ width: 280, background: '#1e293b', borderLeft: '1px solid #334155', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: 20, fontWeight: 700, color: 'white', margin: '0 0 3px' }}>{MASCOTA.nombre}</p>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{MASCOTA.especie} · {MASCOTA.raza}</p>
              </div>
              <button onClick={() => setMostrarPanel(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>

            <div>
              <p style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px', fontWeight: 600 }}>Ubicación</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { l: 'Sector', v: MASCOTA.sector, c: '#2d8a54' },
                  { l: 'Fila',   v: MASCOTA.fila,   c: '#f59e0b' },
                  { l: 'Parcela',v: MASCOTA.parcela, c: '#f59e0b' },
                ].map(item => (
                  <div key={item.l} style={{ flex: 1, background: '#0f172a', borderRadius: 8, padding: '10px 0', textAlign: 'center', border: '1px solid #334155' }}>
                    <p style={{ fontSize: 10, color: '#64748b', margin: '0 0 3px', textTransform: 'uppercase' }}>{item.l}</p>
                    <p style={{ fontSize: 22, fontWeight: 700, color: item.c, margin: 0 }}>{item.v}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px', fontWeight: 600 }}>Cómo llegar</p>
              {[
                { n: '1', t: 'Ingresá por la entrada principal' },
                { n: '2', t: 'Tomá el camino hacia el Sector A (noroeste)' },
                { n: '3', t: 'Fila 2, Parcela 5 — señalizada en el mapa' },
              ].map(p => (
                <div key={p.n} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#2d8a5430', border: '1px solid #2d8a54', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 10, color: '#2d8a54', fontWeight: 700 }}>{p.n}</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>{p.t}</p>
                </div>
              ))}
            </div>

            <a
              href="https://www.google.com/maps/dir/?api=1&destination=-33.0807,-60.5922"
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#2d8a54', color: 'white', borderRadius: 10, padding: '12px', fontSize: 13, fontWeight: 600, textDecoration: 'none', marginTop: 'auto' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Cómo llegar al cementerio
            </a>
          </div>
        )}
      </div>

      {!mostrarPanel && (
        <button
          onClick={() => setMostrarPanel(true)}
          style={{ position: 'fixed', bottom: 20, right: 20, background: '#2d8a54', color: 'white', border: 'none', borderRadius: 10, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 16px rgba(45,138,84,0.4)' }}
        >
          🐾 Ver info de {MASCOTA.nombre}
        </button>
      )}
    </div>
  )
}
