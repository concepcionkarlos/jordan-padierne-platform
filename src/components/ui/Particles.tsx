// Floating light particles — clearly-visible upward drift (like embers / dust).
// Deterministic config (no Math.random) so SSR and client match.
// Pure CSS animation, GPU-only. Server component, no JS shipped.

// left%, size(px), driftX(px), delay(s), duration(s)
const PARTICLES: [number, number, number, number, number][] = [
  [6, 4, 14, 0, 9], [14, 3, -10, 2.5, 11], [22, 5, 18, 5, 8],
  [31, 3, -14, 1.2, 12], [39, 4, 8, 6.5, 10], [47, 6, -18, 3.4, 9],
  [55, 3, 12, 7.8, 13], [63, 4, -8, 0.8, 10], [71, 5, 16, 4.6, 8],
  [79, 3, -12, 2, 12], [86, 4, 10, 6, 9], [93, 5, -16, 3, 11],
  [10, 3, 8, 8.5, 10], [42, 4, -10, 9.2, 9], [68, 3, 14, 5.7, 12], [88, 4, -8, 1.6, 13],
]

export default function Particles({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      {PARTICLES.map(([left, size, driftX, delay, duration], i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: `${left}%`,
            width: `${size}px`,
            height: `${size}px`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
            // @ts-expect-error — CSS custom property
            '--px': `${driftX}px`,
          }}
        />
      ))}
    </div>
  )
}
