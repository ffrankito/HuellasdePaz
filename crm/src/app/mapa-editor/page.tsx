'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type Pt = { x: number; y: number }

type Shape =
  | { id: string; kind: 'polygon'; pts: Pt[];   color: string; label: string; visible: boolean; locked: boolean; opacity: number }
  | { id: string; kind: 'rect';    x: number; y: number; w: number; h: number; color: string; label: string; visible: boolean; locked: boolean; opacity: number }
  | { id: string; kind: 'marker';  pt: Pt;     color: string; label: string; visible: boolean; locked: boolean; opacity: number }

type Tool  = 'select' | 'pan' | 'polygon' | 'rect' | 'marker'
type VB    = { x: number; y: number; w: number; h: number }
type ResizeHandle = 'nw'|'n'|'ne'|'e'|'se'|'s'|'sw'|'w'
type Drag  =
  | { kind: 'pan';    startVb: VB; mx0: number; my0: number }
  | { kind: 'shape';  id: string; mx0: number; my0: number; snap: Shape }
  | { kind: 'vertex'; id: string; idx: number }
  | { kind: 'resize'; id: string; handle: ResizeHandle; snap: Extract<Shape,{kind:'rect'}> }
  | { kind: 'rect';   start: Pt }

// ─── Constants ────────────────────────────────────────────────────────────────
const COLORS   = ['#2d8a54','#3b82f6','#a855f7','#f59e0b','#ef4444','#06b6d4','#ec4899','#84cc16','#f97316','#ffffff']
const INIT_VB: VB = { x: 0, y: 0, w: 100, h: 66 }
const uid = () => Math.random().toString(36).slice(2, 9)

// Mapa base: OpenStreetMap "Aires de Paz" — Way 830425328
// viewBox 0 0 100 66
// Coordenadas reales OSM convertidas a SVG:
//   lng_min=-60.5954656, lng_range=0.0057372
//   lat_max=-33.0792690, lat_range=0.0028048
//   x = (lng - lng_min) / lng_range * 100
//   y = (lat_max - lat) / lat_range * 66
const INITIAL_SHAPES: Shape[] = [
  // ── Límite real del cementerio (19 nodos OSM exactos) ─────────────────
  {
    id: 'boundary', kind: 'polygon', label: 'Límite del cementerio',
    pts: [
      {x:0,  y:10}, {x:9,  y:4},  {x:20, y:3},  {x:54, y:1},
      {x:99, y:0},  {x:100,y:37}, {x:99, y:43}, {x:98, y:47},
      {x:96, y:50}, {x:95, y:51}, {x:93, y:54}, {x:90, y:58},
      {x:86, y:60}, {x:80, y:63}, {x:72, y:64}, {x:38, y:66},
      {x:35, y:65}, {x:18, y:38},
    ],
    color: '#ffffff', visible: true, locked: false, opacity: 0.5,
  },

  // ── Caminos (aproximados desde imagen OSM) ────────────────────────────
  {
    id: 'camino-horiz', kind: 'rect', label: 'Camino horizontal',
    x: 18, y: 29, w: 55, h: 2,
    color: '#e2e8f0', visible: true, locked: true, opacity: 0.6,
  },
  {
    id: 'camino-vert', kind: 'rect', label: 'Camino vertical',
    x: 36, y: 3, w: 2, h: 62,
    color: '#e2e8f0', visible: true, locked: true, opacity: 0.6,
  },
  {
    id: 'camino-der', kind: 'rect', label: 'Camino derecho',
    x: 68, y: 10, w: 30, h: 2,
    color: '#e2e8f0', visible: true, locked: true, opacity: 0.6,
  },

  // ── Edificios visibles en OSM (abajo derecha) ─────────────────────────
  {
    id: 'edificio-1', kind: 'rect', label: 'Edificio',
    x: 74, y: 44, w: 5, h: 4,
    color: '#94a3b8', visible: true, locked: false, opacity: 1,
  },
  {
    id: 'edificio-2', kind: 'rect', label: 'Edificio principal',
    x: 79, y: 47, w: 6, h: 5,
    color: '#94a3b8', visible: true, locked: false, opacity: 1,
  },
  {
    id: 'crematorio', kind: 'marker', label: 'Crematorio (fuera del mapa)',
    pt: {x: 3, y: 24},
    color: '#94a3b8', visible: true, locked: false, opacity: 0.8,
  },

  // ── Entrada principal ─────────────────────────────────────────────────
  {
    id: 'entrada', kind: 'marker', label: 'Entrada',
    pt: {x: 65, y: 31},
    color: '#f59e0b', visible: true, locked: false, opacity: 1,
  },

  // ── Sectores (render ANTES que parcelas) ──────────────────────────────
  // A: cuadrante superior izquierdo (x:3-35, y:3-28)
  { id: 'sector-a', kind: 'rect', label: 'Sector A', x: 3,  y: 3,  w: 32, h: 25, color: '#2d8a54', visible: true, locked: false, opacity: 0.7 },
  // B: cuadrante superior central (x:39-67, y:3-28)
  { id: 'sector-b', kind: 'rect', label: 'Sector B', x: 39, y: 3,  w: 28, h: 25, color: '#3b82f6', visible: true, locked: false, opacity: 0.7 },
  // C: cuadrante superior derecho (x:69-98, y:3-27)
  { id: 'sector-c', kind: 'rect', label: 'Sector C', x: 69, y: 3,  w: 28, h: 25, color: '#a855f7', visible: true, locked: false, opacity: 0.7 },
  // D: cuadrante inferior izquierdo (x:19-35, y:32-60)
  { id: 'sector-d', kind: 'rect', label: 'Sector D', x: 19, y: 32, w: 16, h: 26, color: '#f97316', visible: true, locked: false, opacity: 0.7 },
  // E: cuadrante inferior central (x:39-67, y:32-62)
  { id: 'sector-e', kind: 'rect', label: 'Sector E', x: 39, y: 32, w: 28, h: 28, color: '#06b6d4', visible: true, locked: false, opacity: 0.7 },

  // ── Parcelas demo (encima de sectores) ───────────────────────────────────
  // A: 4 cols x 4 filas en x:4-34, y:4-27
  ...Array.from({ length: 16 }, (_, i) => { const c=i%4,r=Math.floor(i/4); return { id:`pa-${i}`, kind:'rect' as const, label:`A-${i+1}`, x:4+c*7.5, y:4+r*5.5, w:6.5, h:4.5, color:'#2d8a54', visible:true, locked:false, opacity:0.65 } }),
  // B: 4 cols x 4 filas en x:40-66, y:4-27
  ...Array.from({ length: 16 }, (_, i) => { const c=i%4,r=Math.floor(i/4); return { id:`pb-${i}`, kind:'rect' as const, label:`B-${i+1}`, x:40+c*7, y:4+r*5.5, w:6, h:4.5, color:'#3b82f6', visible:true, locked:false, opacity:0.65 } }),
  // C: 4 cols x 4 filas en x:70-96, y:4-27
  ...Array.from({ length: 16 }, (_, i) => { const c=i%4,r=Math.floor(i/4); return { id:`pc-${i}`, kind:'rect' as const, label:`C-${i+1}`, x:70+c*7, y:4+r*5.5, w:6, h:4.5, color:'#a855f7', visible:true, locked:false, opacity:0.65 } }),
  // D: 2 cols x 4 filas en x:20-34, y:33-58
  ...Array.from({ length: 8 }, (_, i) => { const c=i%2,r=Math.floor(i/2); return { id:`pd-${i}`, kind:'rect' as const, label:`D-${i+1}`, x:20+c*7.5, y:33+r*6.5, w:6.5, h:5.5, color:'#f97316', visible:true, locked:false, opacity:0.65 } }),
  // E: 4 cols x 4 filas en x:40-66, y:33-60
  ...Array.from({ length: 16 }, (_, i) => { const c=i%4,r=Math.floor(i/4); return { id:`pe-${i}`, kind:'rect' as const, label:`E-${i+1}`, x:40+c*7, y:33+r*7, w:6, h:6, color:'#06b6d4', visible:true, locked:false, opacity:0.65 } }),
]

// ─── SVG Icon ─────────────────────────────────────────────────────────────────
function Ico({ d, size = 14, fill = 'none' }: { d: string; size?: number; fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

// ─── Color dot ────────────────────────────────────────────────────────────────
function ColorDot({ c, active, onClick }: { c: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} title={c} style={{
      width: 18, height: 18, borderRadius: 4, border: active ? '2px solid #f0f6fc' : '2px solid transparent',
      background: c, cursor: 'pointer', padding: 0, outline: 'none',
      boxShadow: active ? `0 0 0 1px ${c}` : 'none', transition: 'box-shadow 0.1s',
    }} />
  )
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 10, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px', fontWeight: 700 }}>{children}</p>
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function MapaEditor() {
  const [shapes,  setShapes]  = useState<Shape[]>(INITIAL_SHAPES)
  const [tool,    setTool]    = useState<Tool>('polygon')
  const [color,   setColor]   = useState(COLORS[0])
  const [label,   setLabel]   = useState('Sector A')
  const [selId,   setSelId]   = useState<string | null>(null)
  const [vb,      setVb]      = useState<VB>(INIT_VB)
  const [drawing, setDrawing] = useState<{ pts: Pt[]; color: string; label: string } | null>(null)
  const [drag,    setDrag]    = useState<Drag | null>(null)
  const [mouse,   setMouse]   = useState<Pt | null>(null)
  const [history, setHistory] = useState<Shape[][]>([])
  const [future,  setFuture]  = useState<Shape[][]>([])
  const [tab,     setTab]     = useState<'props' | 'layers'>('props')
  const [grid,    setGrid]    = useState(false)
  const [snap,    setSnap]    = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  const selected = shapes.find(s => s.id === selId) ?? null

  // ── Coordinate helpers ─────────────────────────────────────────────────────
  const toSvg = useCallback((cx: number, cy: number): Pt => {
    const r = svgRef.current!.getBoundingClientRect()
    let x = vb.x + (cx - r.left) / r.width  * vb.w
    let y = vb.y + (cy - r.top)  / r.height * vb.h
    if (snap) { x = Math.round(x * 2) / 2; y = Math.round(y * 2) / 2 }
    return { x: +x.toFixed(2), y: +y.toFixed(2) }
  }, [vb, snap])

  // ── History ────────────────────────────────────────────────────────────────
  const commit = useCallback((next: Shape[]) => {
    setHistory(h => [...h.slice(-40), shapes])
    setFuture([])
    setShapes(next)
  }, [shapes])

  const undo = useCallback(() => {
    setHistory(h => { if (!h.length) return h; setFuture(f => [shapes, ...f]); setShapes(h[h.length-1]); return h.slice(0,-1) })
    setSelId(null)
  }, [shapes])

  const redo = useCallback(() => {
    setFuture(f => { if (!f.length) return f; setHistory(h => [...h, shapes]); setShapes(f[0]); return f.slice(1) })
  }, [shapes])

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return
      const k = e.key
      if (k === 'Escape')    { setDrawing(null); setDrag(null) }
      if (k === 'Delete' || k === 'Backspace') {
        if (selId) { const s = shapes.find(x => x.id === selId); if (!s?.locked) { commit(shapes.filter(x => x.id !== selId)); setSelId(null) } }
      }
      if (e.ctrlKey && k === 'z') { e.preventDefault(); undo() }
      if (e.ctrlKey && (k === 'y' || (e.shiftKey && k === 'Z'))) { e.preventDefault(); redo() }
      if (e.ctrlKey && k === 'd') {
        e.preventDefault()
        if (selId) {
          const s = shapes.find(x => x.id === selId)
          if (s) {
            const clone: Shape = { ...s, id: uid() } as Shape
            if (clone.kind === 'polygon') clone.pts = clone.pts.map(p => ({x: p.x+2, y: p.y+2}))
            else if (clone.kind === 'rect') { (clone as Extract<Shape,{kind:'rect'}>).x += 2; (clone as Extract<Shape,{kind:'rect'}>).y += 2 }
            else (clone as Extract<Shape,{kind:'marker'}>).pt = {x: s.kind === 'marker' ? s.pt.x+2 : 0, y: s.kind === 'marker' ? s.pt.y+2 : 0}
            commit([...shapes, clone]); setSelId(clone.id)
          }
        }
      }
      if (!e.ctrlKey) {
        if (k === 'v') setTool('select')
        if (k === 'p') setTool('polygon')
        if (k === 'r') setTool('rect')
        if (k === 'm') setTool('marker')
        if (k === 'h') setTool('pan')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selId, shapes, undo, redo, commit])

  // ── Zoom ───────────────────────────────────────────────────────────────────
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const pt = toSvg(e.clientX, e.clientY)
    const f  = e.deltaY > 0 ? 1.1 : 0.9
    setVb(v => {
      const nw = Math.max(8, Math.min(100, v.w * f))
      const nh = nw * (66/100)
      return { x: pt.x - (pt.x - v.x) * nw/v.w, y: pt.y - (pt.y - v.y) * nh/v.h, w: nw, h: nh }
    })
  }, [toSvg])

  const zoomTo = (f: number) => setVb(v => {
    const nw = Math.max(8, Math.min(100, v.w * f))
    const nh = nw * (66/100)
    const cx = v.x + v.w/2, cy = v.y + v.h/2
    return { x: cx - nw/2, y: cy - nh/2, w: nw, h: nh }
  })

  // ── Mouse down ─────────────────────────────────────────────────────────────
  function onDown(e: React.MouseEvent) {
    if (e.button !== 0) return
    const pt = toSvg(e.clientX, e.clientY)

    if (tool === 'pan') { setDrag({ kind: 'pan', startVb: {...vb}, mx0: e.clientX, my0: e.clientY }); return }
    if (tool === 'marker') { commit([...shapes, { id: uid(), kind: 'marker', pt, color, label, visible: true, locked: false, opacity: 1 }]); return }
    if (tool === 'rect')   { setDrag({ kind: 'rect', start: pt }); return }
    if (tool === 'polygon') {
      if (!drawing) setDrawing({ pts: [pt], color, label })
      else           setDrawing(d => d ? { ...d, pts: [...d.pts, pt] } : null)
    }
    if (tool === 'select') setSelId(null)
  }

  function onMove(e: React.MouseEvent) {
    const pt = toSvg(e.clientX, e.clientY)
    setMouse(pt)

    if (!drag) return
    if (drag.kind === 'pan') {
      const r = svgRef.current!.getBoundingClientRect()
      const dx = (e.clientX - drag.mx0) / r.width  * drag.startVb.w
      const dy = (e.clientY - drag.my0) / r.height * drag.startVb.h
      setVb({ ...drag.startVb, x: drag.startVb.x - dx, y: drag.startVb.y - dy })
    }
    if (drag.kind === 'shape') {
      const dx = pt.x - toSvg(drag.mx0, drag.my0).x
      const dy = pt.y - toSvg(drag.mx0, drag.my0).y
      // We need raw delta — recalculate each frame from snap
      const snap = drag.snap
      setShapes(prev => prev.map(s => {
        if (s.id !== drag.id) return s
        if (snap.kind === 'polygon') return { ...s, pts: (snap as Extract<Shape,{kind:'polygon'}>).pts.map(p => ({x: p.x+dx, y: p.y+dy})) } as Shape
        if (snap.kind === 'rect')    { const rs = snap as Extract<Shape,{kind:'rect'}>; return { ...s, x: rs.x+dx, y: rs.y+dy } as Shape }
        if (snap.kind === 'marker')  return { ...s, pt: { x: (snap as Extract<Shape,{kind:'marker'}>).pt.x+dx, y: (snap as Extract<Shape,{kind:'marker'}>).pt.y+dy } } as Shape
        return s
      }))
    }
    if (drag.kind === 'vertex') {
      setShapes(prev => prev.map(s => {
        if (s.id !== drag.id || s.kind !== 'polygon') return s
        const pts = [...(s as Extract<Shape,{kind:'polygon'}>).pts]
        pts[drag.idx] = pt
        return { ...s, pts } as Shape
      }))
    }
    if (drag.kind === 'resize') {
      const { snap: s, handle } = drag
      let { x, y, w, h } = s
      const dx = pt.x - (s.x + (['ne','e','se'].includes(handle) ? s.w : ['nw','w','sw'].includes(handle) ? 0 : s.w/2))
      const dy = pt.y - (s.y + (['sw','s','se'].includes(handle) ? s.h : ['nw','n','ne'].includes(handle) ? 0 : s.h/2))
      if (handle.includes('e'))  { w = Math.max(1, s.w + dx) }
      if (handle.includes('w'))  { x = s.x + dx; w = Math.max(1, s.w - dx) }
      if (handle.includes('s'))  { h = Math.max(1, s.h + dy) }
      if (handle.includes('n'))  { y = s.y + dy; h = Math.max(1, s.h - dy) }
      setShapes(prev => prev.map(sh => sh.id === drag.id ? { ...sh, x, y, w, h } as Shape : sh))
    }
  }

  function onUp(e: React.MouseEvent) {
    const pt = toSvg(e.clientX, e.clientY)
    if (drag?.kind === 'rect') {
      const s = drag.start
      const x = Math.min(s.x, pt.x), y = Math.min(s.y, pt.y)
      const w = Math.abs(pt.x - s.x),  h = Math.abs(pt.y - s.y)
      if (w > 0.5 && h > 0.5) commit([...shapes, { id: uid(), kind: 'rect', x, y, w, h, color, label, visible: true, locked: false, opacity: 0.8 }])
    }
    if (drag?.kind === 'shape' || drag?.kind === 'vertex') commit([...shapes])
    setDrag(null)
  }

  function onDblClick() {
    if (tool === 'polygon' && drawing && drawing.pts.length >= 3) {
      commit([...shapes, { id: uid(), kind: 'polygon', pts: drawing.pts, color: drawing.color, label: drawing.label, visible: true, locked: false, opacity: 0.8 }])
      setDrawing(null)
    }
  }

  function clickShape(e: React.MouseEvent, id: string) {
    if (tool !== 'select') return
    e.stopPropagation()
    const s = shapes.find(x => x.id === id)!
    setSelId(id); setTab('props')
    if (!s.locked) setDrag({ kind: 'shape', id, mx0: e.clientX, my0: e.clientY, snap: s })
  }

  function clickVertex(e: React.MouseEvent, id: string, idx: number) {
    e.stopPropagation()
    if (tool !== 'select') return
    setDrag({ kind: 'vertex', id, idx })
  }

  function updateSel(patch: object) {
    setShapes(prev => prev.map(s => s.id === selId ? { ...s, ...patch } as Shape : s))
  }

  function exportData() {
    const data = shapes.filter(s => s.id !== 'boundary').map(s => {
      if (s.kind === 'polygon') return { kind: 'polygon', label: s.label, color: s.color, pts: s.pts }
      if (s.kind === 'rect')    return { kind: 'rect', label: s.label, color: s.color, x: s.x, y: s.y, w: s.w, h: s.h }
      return { kind: 'marker', label: s.label, color: s.color, pt: s.pt }
    })
    const json = JSON.stringify(data, null, 2)
    navigator.clipboard.writeText(json).catch(() => {})
    const blob = new Blob([json], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'mapa-cementerio.json'; a.click()
  }

  const pts2str = (pts: Pt[]) => pts.map(p => `${p.x},${p.y}`).join(' ')
  const zoomPct  = Math.round(100 / vb.w * 100)

  const TOOLS = [
    { id: 'select' as Tool, icon: 'M5 3l14 9-7 2-4 7z', tip: 'Seleccionar (V)' },
    { id: 'pan'    as Tool, icon: 'M18 11V6l-2-2H8L6 6v5M6 13v5l2 2h8l2-2v-5M6 11h12', tip: 'Mover (H)' },
    { id: 'polygon'as Tool, icon: 'M12 3l8 15H4z', tip: 'Polígono (P)' },
    { id: 'rect'   as Tool, icon: 'M3 3h18v18H3z',  tip: 'Rectángulo (R)' },
    { id: 'marker' as Tool, icon: 'M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z M12 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4', tip: 'Marcador (M)' },
  ]

  const cursor = drag?.kind === 'pan' || tool === 'pan' ? 'grabbing'
    : drag?.kind === 'shape' ? 'move'
    : drag?.kind === 'vertex' ? 'crosshair'
    : tool === 'select' ? 'default'
    : 'crosshair'

  return (
    <div onMouseUp={onUp} style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0d1117', fontFamily: '"Inter",system-ui,sans-serif', userSelect: 'none', overflow: 'hidden' }}>

      {/* ═══ Top bar ══════════════════════════════════════════════════════════ */}
      <div style={{ height: 46, background: '#161b22', borderBottom: '1px solid #21262d', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 6, flexShrink: 0 }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 6 }}>
          <span style={{ fontSize: 15 }}>🗺</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#f0f6fc' }}>Editor de Mapa</span>
          <span style={{ fontSize: 11, color: '#30363d', background: '#21262d', padding: '1px 6px', borderRadius: 4 }}>Huellas de Paz</span>
        </div>

        <div style={{ width: 1, height: 22, background: '#21262d', margin: '0 4px' }} />

        {/* Undo/Redo */}
        {[
          { tip: 'Deshacer Ctrl+Z', off: !history.length, fn: undo, d: 'M3 9l4-4 4 4M7 5v14' },
          { tip: 'Rehacer Ctrl+Y',  off: !future.length,  fn: redo,  d: 'M21 9l-4-4-4 4M17 5v14' },
        ].map((b,i) => (
          <button key={i} onClick={b.fn} disabled={b.off} title={b.tip} style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: 'transparent', color: b.off ? '#21262d' : '#8b949e', cursor: b.off ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ico d={b.d} />
          </button>
        ))}

        <div style={{ width: 1, height: 22, background: '#21262d', margin: '0 4px' }} />

        {/* Zoom */}
        <button onClick={() => zoomTo(0.75)} title="Zoom +" style={btnSm}><span style={{ fontSize: 14, lineHeight: 1 }}>+</span></button>
        <span style={{ fontSize: 11, color: '#484f58', minWidth: 42, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{zoomPct}%</span>
        <button onClick={() => zoomTo(1.33)} title="Zoom -" style={btnSm}><span style={{ fontSize: 14, lineHeight: 1 }}>−</span></button>
        <button onClick={() => setVb(INIT_VB)} title="Ajustar pantalla" style={{ ...btnSm, fontSize: 11 }}>Fit</button>

        <div style={{ width: 1, height: 22, background: '#21262d', margin: '0 4px' }} />

        {/* Toggles */}
        {[
          { label: 'Grid', val: grid, set: setGrid },
          { label: 'Snap', val: snap, set: setSnap },
        ].map(t => (
          <button key={t.label} onClick={() => t.set(!t.val)} style={{ ...btnSm, background: t.val ? '#1f6feb20' : 'transparent', color: t.val ? '#58a6ff' : '#484f58', border: `1px solid ${t.val ? '#1f6feb40' : '#21262d'}`, fontSize: 11, padding: '0 8px', width: 'auto' }}>
            {t.label}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        {mouse && <span style={{ fontSize: 11, color: '#30363d', fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace' }}>x:{mouse.x.toFixed(1)} y:{mouse.y.toFixed(1)}</span>}

        <div style={{ width: 1, height: 22, background: '#21262d', margin: '0 4px' }} />

        <button onClick={exportData} disabled={shapes.filter(s=>s.id!=='boundary').length===0}
          style={{ padding: '0 14px', height: 30, borderRadius: 6, border: 'none', background: '#238636', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, opacity: shapes.filter(s=>s.id!=='boundary').length===0 ? 0.4 : 1 }}>
          <Ico d="M12 15V3M5 20h14M9 10l3 5 3-5" />
          Exportar JSON
        </button>
      </div>

      {/* ═══ Body ══════════════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Left toolbar ── */}
        <div style={{ width: 48, background: '#161b22', borderRight: '1px solid #21262d', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0', gap: 2, flexShrink: 0 }}>
          {TOOLS.map(t => (
            <button key={t.id} title={t.tip} onClick={() => { setTool(t.id); setDrawing(null); setDrag(null) }}
              style={{ width: 36, height: 36, borderRadius: 7, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s', background: tool === t.id ? '#1f6feb' : 'transparent', color: tool === t.id ? '#ffffff' : '#8b949e' }}>
              <Ico d={t.icon} size={15} />
            </button>
          ))}

          <div style={{ flex: 1 }} />
          <div style={{ width: 28, height: 1, background: '#21262d', margin: '4px 0' }} />

          {/* Active color swatch */}
          <div title="Color activo" style={{ width: 28, height: 28, borderRadius: 6, background: color, border: '2px solid #30363d', cursor: 'pointer' }} />
        </div>

        {/* ── Canvas ── */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#010409' }}>

          {/* Grid overlay */}
          {grid && (
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.08 }} viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id="grid" width="5" height="3.3" patternUnits="userSpaceOnUse">
                  <path d="M 5 0 L 0 0 0 3.3" fill="none" stroke="#ffffff" strokeWidth="0.1" />
                </pattern>
              </defs>
              <rect width="100" height="66" fill="url(#grid)" />
            </svg>
          )}

          <svg ref={svgRef}
            viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ width: '100%', height: '100%', display: 'block', cursor }}
            onMouseDown={onDown}
            onMouseMove={onMove}
            onDoubleClick={onDblClick}
            onWheel={onWheel}
          >
            {/* Imagen satelital */}
            <image href="/mapa-cementerio.png" x="0" y="0" width="100" height="66" preserveAspectRatio="xMidYMid slice" />
            <rect x="0" y="0" width="100" height="66" fill="rgba(0,0,0,0.1)" />

            {/* Shapes */}
            {shapes.map(s => {
              if (!s.visible) return null
              const sel = s.id === selId
              const sw  = sel ? 0.5 : 0.35

              if (s.kind === 'polygon') {
                const cx = s.pts.reduce((a, p) => a + p.x, 0) / s.pts.length
                const cy = s.pts.reduce((a, p) => a + p.y, 0) / s.pts.length
                return (
                  <g key={s.id} style={{ cursor: tool === 'select' && !s.locked ? 'move' : 'default' }}
                    onMouseDown={e => clickShape(e, s.id)}>
                    <polygon points={pts2str(s.pts)}
                      fill={`${s.color}${Math.round(s.opacity * 0.28 * 255).toString(16).padStart(2,'0')}`}
                      stroke={sel ? 'white' : s.color} strokeWidth={sw}
                      strokeDasharray={sel ? 'none' : '1.8,0.9'}
                      style={{ filter: sel ? `drop-shadow(0 0 2px ${s.color})` : 'none' }}
                    />
                    {/* Vertex handles when selected */}
                    {sel && s.pts.map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r="0.9"
                        fill="white" stroke={s.color} strokeWidth="0.35"
                        style={{ cursor: 'crosshair' }}
                        onMouseDown={e => clickVertex(e, s.id, i)}
                      />
                    ))}
                    <text x={cx} y={cy + 0.8} textAnchor="middle" fontSize="2.2" fill={s.color} fontWeight="700"
                      paintOrder="stroke" stroke="#000" strokeWidth="1" style={{ pointerEvents: 'none' }}>
                      {s.label}
                    </text>
                  </g>
                )
              }

              if (s.kind === 'rect') {
                const cx = s.x + s.w/2, cy = s.y + s.h/2
                const handles: { h: ResizeHandle; cx: number; cy: number; cur: string }[] = [
                  { h:'nw', cx:s.x,        cy:s.y,        cur:'nwse-resize' },
                  { h:'n',  cx:s.x+s.w/2,  cy:s.y,        cur:'ns-resize'   },
                  { h:'ne', cx:s.x+s.w,    cy:s.y,        cur:'nesw-resize' },
                  { h:'e',  cx:s.x+s.w,    cy:s.y+s.h/2,  cur:'ew-resize'   },
                  { h:'se', cx:s.x+s.w,    cy:s.y+s.h,    cur:'nwse-resize' },
                  { h:'s',  cx:s.x+s.w/2,  cy:s.y+s.h,    cur:'ns-resize'   },
                  { h:'sw', cx:s.x,        cy:s.y+s.h,    cur:'nesw-resize' },
                  { h:'w',  cx:s.x,        cy:s.y+s.h/2,  cur:'ew-resize'   },
                ]
                return (
                  <g key={s.id} style={{ cursor: tool === 'select' && !s.locked ? 'move' : 'default' }}
                    onMouseDown={e => clickShape(e, s.id)}>
                    <rect x={s.x} y={s.y} width={s.w} height={s.h}
                      fill={`${s.color}28`} stroke={sel ? 'white' : s.color} strokeWidth={sw}
                      strokeDasharray={sel ? 'none' : '1.8,0.9'}
                      style={{ filter: sel ? `drop-shadow(0 0 2px ${s.color})` : 'none' }}
                    />
                    {sel && handles.map(hd => (
                      <rect key={hd.h}
                        x={hd.cx - 0.9} y={hd.cy - 0.9} width={1.8} height={1.8}
                        fill="white" stroke={s.color} strokeWidth="0.3" rx="0.2"
                        style={{ cursor: hd.cur }}
                        onMouseDown={e => {
                          e.stopPropagation()
                          setDrag({ kind: 'resize', id: s.id, handle: hd.h, snap: s })
                        }}
                      />
                    ))}
                    <text x={cx} y={cy + 0.8} textAnchor="middle" fontSize="1.8" fill={s.color} fontWeight="700"
                      paintOrder="stroke" stroke="#000" strokeWidth="0.8" style={{ pointerEvents: 'none' }}>
                      {s.label}
                    </text>
                  </g>
                )
              }

              // marker
              return (
                <g key={s.id} style={{ cursor: tool === 'select' ? 'move' : 'default' }}
                  onMouseDown={e => clickShape(e, s.id)}>
                  <circle cx={s.pt.x} cy={s.pt.y} r={sel ? 2.8 : 2.2} fill={s.color}
                    stroke={sel ? 'white' : 'rgba(255,255,255,0.7)'} strokeWidth={sw}
                    style={{ filter: sel ? `drop-shadow(0 0 2px ${s.color})` : 'none' }}
                  />
                  <circle cx={s.pt.x} cy={s.pt.y} r="0.7" fill="rgba(255,255,255,0.9)" style={{ pointerEvents: 'none' }} />
                  <text x={s.pt.x} y={s.pt.y - 3} textAnchor="middle" fontSize="1.9" fill="white" fontWeight="600"
                    paintOrder="stroke" stroke="#000" strokeWidth="0.8" style={{ pointerEvents: 'none' }}>
                    {s.label}
                  </text>
                </g>
              )
            })}

            {/* In-progress polygon */}
            {drawing && (
              <g style={{ pointerEvents: 'none' }}>
                {drawing.pts.length > 1 && <polyline points={pts2str(drawing.pts)} fill={`${drawing.color}20`} stroke={drawing.color} strokeWidth="0.4" />}
                {mouse && drawing.pts.length > 0 && (
                  <>
                    <line x1={drawing.pts[drawing.pts.length-1].x} y1={drawing.pts[drawing.pts.length-1].y}
                          x2={mouse.x} y2={mouse.y} stroke={drawing.color} strokeWidth="0.35" strokeDasharray="1,0.5" opacity="0.7" />
                    {drawing.pts.length >= 2 && (
                      <line x1={mouse.x} y1={mouse.y} x2={drawing.pts[0].x} y2={drawing.pts[0].y}
                        stroke={drawing.color} strokeWidth="0.2" strokeDasharray="0.6,0.4" opacity="0.3" />
                    )}
                  </>
                )}
                {drawing.pts.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={i === 0 ? 1.1 : 0.7}
                    fill={i === 0 ? 'white' : drawing.color} stroke={drawing.color} strokeWidth="0.3" />
                ))}
              </g>
            )}

            {/* In-progress rect */}
            {drag?.kind === 'rect' && mouse && (
              <rect x={Math.min(drag.start.x, mouse.x)} y={Math.min(drag.start.y, mouse.y)}
                width={Math.abs(mouse.x - drag.start.x)} height={Math.abs(mouse.y - drag.start.y)}
                fill={`${color}18`} stroke={color} strokeWidth="0.35" strokeDasharray="1.2,0.6"
                style={{ pointerEvents: 'none' }} />
            )}

            {/* Crosshair */}
            {mouse && tool !== 'pan' && tool !== 'select' && !drag && (
              <g style={{ pointerEvents: 'none' }}>
                <line x1={mouse.x-4} y1={mouse.y} x2={mouse.x+4} y2={mouse.y} stroke="rgba(255,255,255,0.35)" strokeWidth="0.15" />
                <line x1={mouse.x} y1={mouse.y-4} x2={mouse.x} y2={mouse.y+4} stroke="rgba(255,255,255,0.35)" strokeWidth="0.15" />
              </g>
            )}
          </svg>

          {/* Polygon hint */}
          {drawing && (
            <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', background: 'rgba(13,17,23,0.92)', border: '1px solid #30363d', borderRadius: 8, padding: '6px 14px', fontSize: 12, color: '#8b949e', display: 'flex', gap: 14, alignItems: 'center', backdropFilter: 'blur(6px)', whiteSpace: 'nowrap' }}>
              <span style={{ color: '#58a6ff' }}>{drawing.pts.length} pts</span>
              <span>Click para agregar · Doble click para cerrar</span>
              <button onClick={() => { if (drawing.pts.length >= 3) { commit([...shapes, { id: uid(), kind: 'polygon', pts: drawing.pts, color: drawing.color, label: drawing.label, visible: true, locked: false, opacity: 0.8 }]); setDrawing(null) } }}
                disabled={drawing.pts.length < 3}
                style={{ background: '#238636', border: 'none', borderRadius: 5, padding: '3px 10px', color: 'white', cursor: drawing.pts.length < 3 ? 'not-allowed' : 'pointer', fontSize: 12, opacity: drawing.pts.length < 3 ? 0.4 : 1 }}>
                Cerrar polígono
              </button>
              <button onClick={() => setDrawing(null)} style={{ background: '#21262d', border: 'none', borderRadius: 5, padding: '3px 8px', color: '#8b949e', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
            </div>
          )}
        </div>

        {/* ── Right panel ── */}
        <div style={{ width: 260, background: '#161b22', borderLeft: '1px solid #21262d', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #21262d', flexShrink: 0 }}>
            {([['props','Propiedades'],['layers',`Capas (${shapes.length})`]] as const).map(([id, lbl]) => (
              <button key={id} onClick={() => setTab(id)}
                style={{ flex: 1, height: 36, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: tab === id ? '#f0f6fc' : '#484f58', borderBottom: `2px solid ${tab === id ? '#1f6feb' : 'transparent'}` }}>
                {lbl}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ── Props tab ── */}
            {tab === 'props' && (
              <>
                {/* New shape settings */}
                <div>
                  <SectionLabel>Nueva forma</SectionLabel>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Nombre de la forma"
                      style={inputStyle} />
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {COLORS.map(c => <ColorDot key={c} c={c} active={color === c} onClick={() => setColor(c)} />)}
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {TOOLS.slice(2).map(t => (
                        <button key={t.id} onClick={() => { setTool(t.id); setDrawing(null) }}
                          style={{ flex: 1, padding: '6px 0', borderRadius: 6, border: `1px solid ${tool === t.id ? '#1f6feb' : '#30363d'}`, background: tool === t.id ? '#1f6feb20' : 'transparent', color: tool === t.id ? '#58a6ff' : '#484f58', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Ico d={t.icon} size={13} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ height: 1, background: '#21262d' }} />

                {/* Selected shape */}
                {selected ? (
                  <div>
                    <SectionLabel>Forma seleccionada</SectionLabel>
                    <div style={{ background: '#0d1117', border: `1px solid ${selected.color}50`, borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: selected.kind === 'marker' ? '50%' : 2, background: selected.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: '#484f58', flex: 1 }}>
                          {selected.kind === 'polygon' ? `Polígono · ${selected.pts.length} pts`
                           : selected.kind === 'rect' ? `Rectángulo · ${selected.w.toFixed(1)}×${selected.h.toFixed(1)}`
                           : 'Marcador'}
                        </span>
                        {selected.locked && <span style={{ fontSize: 10, color: '#484f58', background: '#21262d', padding: '1px 5px', borderRadius: 3 }}>🔒 bloqueado</span>}
                      </div>

                      <div>
                        <label style={{ fontSize: 11, color: '#8b949e', display: 'block', marginBottom: 3 }}>Nombre</label>
                        <input value={selected.label} onChange={e => updateSel({ label: e.target.value })} disabled={selected.locked} style={inputStyle} />
                      </div>

                      <div>
                        <label style={{ fontSize: 11, color: '#8b949e', display: 'block', marginBottom: 4 }}>Color</label>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {COLORS.map(c => <ColorDot key={c} c={c} active={selected.color === c} onClick={() => !selected.locked && updateSel({ color: c })} />)}
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: 11, color: '#8b949e', display: 'block', marginBottom: 4 }}>
                          Opacidad — {Math.round(selected.opacity * 100)}%
                        </label>
                        <input type="range" min={0.1} max={1} step={0.05}
                          value={selected.opacity}
                          onChange={e => updateSel({ opacity: parseFloat(e.target.value) })}
                          style={{ width: '100%', accentColor: selected.color }} />
                      </div>

                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => updateSel({ locked: !selected.locked })}
                          style={{ flex: 1, padding: '6px', borderRadius: 6, border: '1px solid #30363d', background: '#0d1117', color: '#8b949e', cursor: 'pointer', fontSize: 11 }}>
                          {selected.locked ? '🔓 Desbloquear' : '🔒 Bloquear'}
                        </button>
                        <button onClick={() => updateSel({ visible: !selected.visible })}
                          style={{ flex: 1, padding: '6px', borderRadius: 6, border: '1px solid #30363d', background: '#0d1117', color: '#8b949e', cursor: 'pointer', fontSize: 11 }}>
                          {selected.visible ? '👁 Ocultar' : '👁 Mostrar'}
                        </button>
                      </div>

                      {!selected.locked && (
                        <button onClick={() => { commit(shapes.filter(s => s.id !== selId!)); setSelId(null) }}
                          style={{ padding: '7px', borderRadius: 6, border: '1px solid #f8514930', background: '#f8514912', color: '#f85149', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                          🗑 Eliminar forma
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <p style={{ fontSize: 12, color: '#30363d', margin: 0 }}>Seleccioná una forma<br />para editar sus propiedades</p>
                  </div>
                )}
              </>
            )}

            {/* ── Layers tab ── */}
            {tab === 'layers' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {shapes.length === 0 && <p style={{ fontSize: 12, color: '#30363d', textAlign: 'center', marginTop: 20 }}>Sin formas todavía</p>}
                {[...shapes].reverse().map(s => (
                  <div key={s.id}
                    onClick={() => { setSelId(s.id === selId ? null : s.id); setTab('props') }}
                    style={{
                      padding: '7px 10px', borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
                      background: s.id === selId ? '#1f2937' : 'transparent',
                      border: `1px solid ${s.id === selId ? s.color + '50' : 'transparent'}`,
                      opacity: s.visible ? 1 : 0.4, transition: 'background 0.1s',
                    }}>
                    <div style={{ width: 10, height: 10, borderRadius: s.kind === 'marker' ? '50%' : 2, background: s.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: '#c9d1d9', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.label}</span>
                    {s.locked && <span style={{ fontSize: 10, color: '#484f58' }}>🔒</span>}
                    <button onClick={e => { e.stopPropagation(); setShapes(prev => prev.map(x => x.id === s.id ? {...x, visible: !x.visible} as Shape : x)) }}
                      style={iconBtnStyle} title="Visibilidad">{s.visible ? '👁' : '🚫'}</button>
                    {!s.locked && (
                      <button onClick={e => { e.stopPropagation(); commit(shapes.filter(x => x.id !== s.id)); if (selId === s.id) setSelId(null) }}
                        style={iconBtnStyle} title="Eliminar">×</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Shortcuts */}
          <div style={{ borderTop: '1px solid #21262d', padding: '10px 12px', flexShrink: 0 }}>
            <SectionLabel>Atajos</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 6px' }}>
              {[['V','Seleccionar'],['P','Polígono'],['R','Rect'],['M','Marcador'],['H','Mover'],['Ctrl+Z','Deshacer'],['Del','Eliminar'],['Ctrl+D','Duplicar']].map(([k,v]) => (
                <div key={k} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <kbd style={{ fontSize: 9, color: '#484f58', background: '#0d1117', border: '1px solid #21262d', borderRadius: 3, padding: '1px 4px', fontFamily: 'monospace', flexShrink: 0 }}>{k}</kbd>
                  <span style={{ fontSize: 10, color: '#30363d' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Status bar ════════════════════════════════════════════════════════ */}
      <div style={{ height: 24, background: '#1f6feb', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 12, flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>
          {tool === 'polygon' ? (drawing ? `Dibujando polígono — ${drawing.pts.length} puntos` : 'Click para empezar polígono') :
           tool === 'rect'    ? 'Arrastrá para dibujar rectángulo' :
           tool === 'marker'  ? 'Click para colocar marcador' :
           tool === 'select'  ? (selected ? `Seleccionado: ${selected.label}` : 'Click para seleccionar una forma') :
           'Arrastrá para mover el mapa'}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>·</span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{shapes.length} formas</span>
        {history.length > 0 && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{history.length} cambios</span>}
      </div>
    </div>
  )
}

// ─── Style helpers ─────────────────────────────────────────────────────────────
const btnSm: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 6, border: '1px solid #30363d',
  background: '#21262d', color: '#8b949e', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #30363d',
  background: '#010409', color: '#f0f6fc', fontSize: 13, boxSizing: 'border-box', outline: 'none',
}
const iconBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', color: '#484f58', cursor: 'pointer', fontSize: 13, padding: 0, lineHeight: 1,
}
