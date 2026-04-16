'use client'

type Segmento = {
  label: string
  valor: number
  color: string
}

function calcularSegmentos(data: Segmento[]) {
  const total = data.reduce((acc, d) => acc + d.valor, 0)
  if (total === 0) return []

  let angulo = -Math.PI / 2
  return data.map(d => {
    const porcentaje = d.valor / total
    const inicio = angulo
    angulo += porcentaje * 2 * Math.PI
    return { ...d, inicio, fin: angulo, porcentaje }
  })
}

function sectorPath(cx: number, cy: number, r: number, inicio: number, fin: number) {
  const x1 = cx + r * Math.cos(inicio)
  const y1 = cy + r * Math.sin(inicio)
  const x2 = cx + r * Math.cos(fin)
  const y2 = cy + r * Math.sin(fin)
  const largeArc = fin - inicio > Math.PI ? 1 : 0
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
}

export function GraficoPie({ data, titulo }: { data: Segmento[], titulo: string }) {
  const segmentos = calcularSegmentos(data)
  const total = data.reduce((acc, d) => acc + d.valor, 0)

  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 24px' }}>{titulo}</h2>

      {total === 0 ? (
        <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>Sin datos todavía</p>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <svg width={180} height={180} viewBox="0 0 180 180">
            {segmentos.map((s, i) => (
              <path
                key={i}
                d={sectorPath(90, 90, 80, s.inicio, s.fin)}
                fill={s.color}
                stroke="white"
                strokeWidth={2}
              />
            ))}
            <circle cx={90} cy={90} r={40} fill="white" />
            <text x={90} y={86} textAnchor="middle" fontSize={20} fontWeight="bold" fill="#111827">{total}</text>
            <text x={90} y={102} textAnchor="middle" fontSize={9} fill="#9ca3af">total</text>
          </svg>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            {segmentos.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#374151', flex: 1 }}>{s.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{s.valor}</span>
                <span style={{ fontSize: 12, color: '#9ca3af', width: 36, textAlign: 'right' }}>
                  {Math.round(s.porcentaje * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}