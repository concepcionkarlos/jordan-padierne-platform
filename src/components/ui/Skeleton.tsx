import { cn } from '@/lib/utils'

// 7.5 — the loading primitive. A calm pulsing block (no spinners). Honours
// reduced-motion automatically: Tailwind's animate-pulse is disabled by the
// browser when the user prefers reduced motion.
export default function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-gray-100', className)} aria-hidden="true" />
}

/** A row of skeleton text lines; `lines` defaults to 3, last line shorter. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn('animate-pulse rounded-lg bg-gray-100 h-3', i === lines - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  )
}
