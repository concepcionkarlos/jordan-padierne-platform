import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { SEMANTIC, type SemanticTone } from '@/lib/status-tokens'

interface StatusBadgeProps {
  /** Semantic tone from the shared token map. */
  tone?: SemanticTone
  /** Show a leading status dot. */
  dot?: boolean
  className?: string
  children: ReactNode
}

// 7.3 / 7.4 — the shared pill. Colours come from the one token map, never
// hand-written, so a "success" badge here matches a green dot anywhere else.
export default function StatusBadge({ tone = 'neutral', dot = false, className, children }: StatusBadgeProps) {
  const t = SEMANTIC[tone]
  return (
    <span className={cn('badge', t.bg, t.text, className)}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', t.dot)} aria-hidden="true" />}
      {children}
    </span>
  )
}
