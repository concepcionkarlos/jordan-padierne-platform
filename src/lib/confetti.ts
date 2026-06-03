// Lightweight canvas confetti — no dependencies. Fires a burst then cleans up.

export function fireConfetti(opts?: { count?: number; spread?: number }) {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const count = opts?.count ?? 130
  const colors = ['#8B1A2F', '#7BA7C2', '#1A3A6B', '#F4B740', '#FFFFFF', '#2E69AC']

  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999'
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')!

  const cx = canvas.width / 2
  const cy = canvas.height * 0.35

  interface P { x: number; y: number; vx: number; vy: number; rot: number; vr: number; size: number; color: string; life: number }
  const particles: P[] = []
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
    const speed = 6 + Math.random() * 9
    particles.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed * (0.6 + Math.random()),
      vy: Math.sin(angle) * speed - 4,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      size: 6 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
    })
  }

  let frame = 0
  const maxFrames = 140
  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    particles.forEach((p) => {
      p.vy += 0.28 // gravity
      p.vx *= 0.99
      p.x += p.vx
      p.y += p.vy
      p.rot += p.vr
      p.life = Math.max(0, 1 - frame / maxFrames)
      ctx.save()
      ctx.globalAlpha = p.life
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
      ctx.restore()
    })
    frame++
    if (frame < maxFrames) requestAnimationFrame(tick)
    else canvas.remove()
  }
  requestAnimationFrame(tick)
}
