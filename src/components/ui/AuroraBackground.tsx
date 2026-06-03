// Subtle brand-colored "aurora / smoke" background — soft drifting orbs.
// Pure CSS, transform-only animation, no heavy blur filter → smooth on phones.
// Server component (no JS shipped). Sits behind content, ignores pointer events.

interface Props {
  variant?: 'dark' | 'light'
  className?: string
}

export default function AuroraBackground({ variant = 'dark', className = '' }: Props) {
  // Soft radial gradients fade to transparent on their own (no filter:blur needed)
  const orbs =
    variant === 'dark'
      ? [
          { cls: 'aurora-1', style: { top: '-15%', left: '-10%', width: '60vw', height: '60vw', maxWidth: '720px', maxHeight: '720px', background: 'radial-gradient(circle, rgba(123,167,194,0.45) 0%, rgba(123,167,194,0) 68%)' } },
          { cls: 'aurora-2', style: { bottom: '-20%', right: '-12%', width: '55vw', height: '55vw', maxWidth: '680px', maxHeight: '680px', background: 'radial-gradient(circle, rgba(46,105,172,0.40) 0%, rgba(46,105,172,0) 70%)' } },
          { cls: 'aurora-3', style: { top: '20%', right: '15%', width: '38vw', height: '38vw', maxWidth: '460px', maxHeight: '460px', background: 'radial-gradient(circle, rgba(139,26,47,0.22) 0%, rgba(139,26,47,0) 72%)' } },
        ]
      : [
          { cls: 'aurora-1', style: { top: '-25%', left: '-8%', width: '50vw', height: '50vw', maxWidth: '600px', maxHeight: '600px', background: 'radial-gradient(circle, rgba(123,167,194,0.22) 0%, rgba(123,167,194,0) 70%)' } },
          { cls: 'aurora-2', style: { bottom: '-25%', right: '-8%', width: '45vw', height: '45vw', maxWidth: '560px', maxHeight: '560px', background: 'radial-gradient(circle, rgba(46,105,172,0.16) 0%, rgba(46,105,172,0) 72%)' } },
          { cls: 'aurora-3', style: { top: '30%', right: '20%', width: '30vw', height: '30vw', maxWidth: '380px', maxHeight: '380px', background: 'radial-gradient(circle, rgba(139,26,47,0.10) 0%, rgba(139,26,47,0) 74%)' } },
        ]

  return (
    <div className={`aurora ${className}`} aria-hidden="true">
      {orbs.map((o) => (
        <div key={o.cls} className={`aurora-orb ${o.cls}`} style={o.style} />
      ))}
    </div>
  )
}
