import type { ReactNode, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds a hover lift on shadow — use for clickable cards. */
  interactive?: boolean
  children: ReactNode
}

// 7.3 — the shared surface. Surface radius (rounded-2xl), card shadow, hairline
// border. One definition so every panel reads as the same material.
export default function Card({ interactive = false, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden',
        interactive && 'transition-shadow duration-200 hover:shadow-card-hover',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
