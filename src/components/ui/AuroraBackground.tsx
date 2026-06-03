// Brand-colored "aurora / smoke" background — soft drifting orbs.
// Pure CSS, transform/opacity animation, no heavy blur filter → smooth on phones.
// Server component (no JS shipped). Sits behind content, ignores pointer events.

interface Props {
  variant?: 'dark' | 'light'
  className?: string
}

export default function AuroraBackground({ variant = 'dark', className = '' }: Props) {
  const orbs =
    variant === 'dark'
      ? [
          { cls: 'aurora-1', style: { top: '-18%', left: '-12%', width: '66vw', height: '66vw', maxWidth: '820px', maxHeight: '820px', background: 'radial-gradient(circle, rgba(123,167,194,0.85) 0%, rgba(123,167,194,0) 66%)' } },
          { cls: 'aurora-2', style: { bottom: '-22%', right: '-14%', width: '62vw', height: '62vw', maxWidth: '780px', maxHeight: '780px', background: 'radial-gradient(circle, rgba(46,105,172,0.80) 0%, rgba(46,105,172,0) 68%)' } },
          { cls: 'aurora-3', style: { top: '15%', right: '8%', width: '46vw', height: '46vw', maxWidth: '560px', maxHeight: '560px', background: 'radial-gradient(circle, rgba(139,26,47,0.55) 0%, rgba(139,26,47,0) 70%)' } },
          { cls: 'aurora-4', style: { bottom: '5%', left: '20%', width: '40vw', height: '40vw', maxWidth: '480px', maxHeight: '480px', background: 'radial-gradient(circle, rgba(168,199,219,0.55) 0%, rgba(168,199,219,0) 72%)' } },
        ]
      : [
          { cls: 'aurora-1', style: { top: '-22%', left: '-10%', width: '56vw', height: '56vw', maxWidth: '700px', maxHeight: '700px', background: 'radial-gradient(circle, rgba(123,167,194,0.45) 0%, rgba(123,167,194,0) 68%)' } },
          { cls: 'aurora-2', style: { bottom: '-24%', right: '-10%', width: '52vw', height: '52vw', maxWidth: '660px', maxHeight: '660px', background: 'radial-gradient(circle, rgba(46,105,172,0.34) 0%, rgba(46,105,172,0) 70%)' } },
          { cls: 'aurora-3', style: { top: '20%', right: '12%', width: '38vw', height: '38vw', maxWidth: '460px', maxHeight: '460px', background: 'radial-gradient(circle, rgba(139,26,47,0.22) 0%, rgba(139,26,47,0) 72%)' } },
          { cls: 'aurora-4', style: { bottom: '0%', left: '18%', width: '34vw', height: '34vw', maxWidth: '420px', maxHeight: '420px', background: 'radial-gradient(circle, rgba(46,105,172,0.24) 0%, rgba(46,105,172,0) 73%)' } },
        ]

  return (
    <div className={`aurora ${className}`} aria-hidden="true">
      {orbs.map((o) => (
        <div key={o.cls} className={`aurora-orb ${o.cls}`} style={o.style} />
      ))}
    </div>
  )
}
