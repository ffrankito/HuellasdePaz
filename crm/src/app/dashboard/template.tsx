'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    bar.style.transition = 'none'
    bar.style.width = '0%'
    bar.style.opacity = '1'

    requestAnimationFrame(() => {
      bar.style.transition = 'width 0.25s ease'
      bar.style.width = '60%'

      const t1 = setTimeout(() => {
        bar.style.transition = 'width 0.4s ease'
        bar.style.width = '85%'
      }, 250)

      const t2 = setTimeout(() => {
        bar.style.transition = 'width 0.2s ease'
        bar.style.width = '100%'
      }, 500)

      const t3 = setTimeout(() => {
        bar.style.transition = 'opacity 0.3s ease'
        bar.style.opacity = '0'
      }, 720)

      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
    })
  }, [pathname])

  return (
    <>
      {/* Barra de progreso */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 9999, pointerEvents: 'none' }}>
        <div
          ref={barRef}
          style={{
            height: '100%',
            width: '0%',
            background: 'linear-gradient(90deg, #2d8a54, #4ade80)',
            boxShadow: '0 0 8px rgba(45,138,84,0.5)',
            opacity: 0,
          }}
        />
      </div>

      {/* Contenido con fade-in */}
      <div style={{ animation: 'dash-enter 0.2s ease-out', height: '100%' }}>
        {children}
      </div>

      <style>{`
        @keyframes dash-enter {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
