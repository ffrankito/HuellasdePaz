import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

/* Canvas de huellas — igual que la landing */
;(function () {
  const canvas = document.createElement('canvas')
  canvas.id = 'paw-canvas'
  document.body.prepend(canvas)
  const ctx = canvas.getContext('2d')
  let W, H, paws = [], mouse = { x: -9999, y: -9999 }

  const PALETTE = [
    [45, 138, 84],
    [77, 184, 122],
    [170, 223, 194],
    [107, 98, 89],
    [168, 159, 148],
  ]

  function resize() {
    W = canvas.width  = window.innerWidth
    H = canvas.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY })
  window.addEventListener('touchmove', e => { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY }, { passive: true })

  class Paw {
    constructor(init = false) {
      const c = PALETTE[Math.floor(Math.random() * PALETTE.length)]
      this.r = c[0]; this.g = c[1]; this.b = c[2]
      this.size  = 9 + Math.random() * 20
      this.x     = Math.random() * W
      this.y     = init ? Math.random() * H : H + 80
      this.vy    = -(0.12 + Math.random() * 0.32)
      this.vx    = (Math.random() - .5) * 0.22
      this.angle = Math.random() * Math.PI * 2
      this.spin  = (Math.random() - .5) * 0.005
      this.alpha = 0.18 + Math.random() * 0.22
      this.mx = 0; this.my = 0
    }
    update() {
      const dx = this.x - mouse.x, dy = this.y - mouse.y
      const d = Math.sqrt(dx * dx + dy * dy), R = 140
      if (d < R && d > 1) { const f = (R - d) / R * 0.9; this.mx += dx / d * f; this.my += dy / d * f }
      this.mx *= 0.92; this.my *= 0.92
      this.x += this.vx + this.mx; this.y += this.vy + this.my
      this.angle += this.spin
      if (this.y < -100) {
        const c = PALETTE[Math.floor(Math.random() * PALETTE.length)]
        this.r = c[0]; this.g = c[1]; this.b = c[2]
        this.x = Math.random() * W; this.y = H + 80
        this.vy = -(0.12 + Math.random() * 0.32)
        this.vx = (Math.random() - .5) * 0.22
        this.size = 9 + Math.random() * 20
        this.alpha = 0.18 + Math.random() * 0.22
      }
    }
    draw() {
      ctx.save()
      ctx.translate(this.x, this.y)
      ctx.rotate(this.angle)
      ctx.globalAlpha = this.alpha
      ctx.fillStyle = `rgb(${this.r},${this.g},${this.b})`
      const s = this.size
      ctx.beginPath(); ctx.ellipse(0, s * .28, s * .52, s * .42, 0, 0, Math.PI * 2); ctx.fill()
      ;[[-s*.44,-s*.26,s*.21,s*.17,-0.38],[-s*.14,-s*.50,s*.19,s*.16,-0.10],[s*.17,-s*.50,s*.19,s*.16,0.10],[s*.44,-s*.26,s*.21,s*.17,0.38]]
        .forEach(([dx,dy,rx,ry,rot]) => { ctx.beginPath(); ctx.ellipse(dx,dy,rx,ry,rot,0,Math.PI*2); ctx.fill() })
      ctx.restore()
    }
  }

  const N = Math.min(55, Math.max(20, Math.floor(W * H / 20000)))
  for (let i = 0; i < N; i++) paws.push(new Paw(true))

  function loop() {
    ctx.clearRect(0, 0, W, H)
    paws.forEach(p => { p.update(); p.draw() })
    requestAnimationFrame(loop)
  }
  loop()
})()