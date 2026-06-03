// Animated SVG wave divider — clearly visible horizontal motion at a section edge.
// Two layered waves scroll at different speeds for depth. GPU-only (translateX).

export default function AnimatedWave({ className = '' }: { className?: string }) {
  // A wave path tiled twice (200% wide) so translateX(-50%) loops seamlessly.
  const path =
    'M0,40 C150,80 350,0 600,40 C850,80 1050,0 1200,40 L1200,120 L0,120 Z ' +
    'M1200,40 C1350,80 1550,0 1800,40 C2050,80 2250,0 2400,40 L2400,120 L1200,120 Z'

  return (
    <div className={`absolute bottom-0 left-0 right-0 overflow-hidden leading-none pointer-events-none ${className}`} aria-hidden="true">
      {/* Back wave — slower, more transparent */}
      <div className="wave-track" style={{ width: '200%', animationDuration: '12s' }}>
        <svg viewBox="0 0 2400 120" className="w-full h-16 sm:h-20" preserveAspectRatio="none">
          <path d={path} fill="rgba(123,167,194,0.25)" />
        </svg>
      </div>
      {/* Front wave — faster, brighter, offset */}
      <div className="wave-track absolute bottom-0 left-0" style={{ width: '200%', animationDuration: '8s', animationDirection: 'reverse' }}>
        <svg viewBox="0 0 2400 120" className="w-full h-12 sm:h-16" preserveAspectRatio="none">
          <path d={path} fill="rgba(46,105,172,0.35)" />
        </svg>
      </div>
    </div>
  )
}
