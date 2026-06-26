import type { ComponentType, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  /** A lucide icon component, e.g. UserCircle. */
  icon?: ComponentType<{ size?: number; className?: string }>
  title: string
  description?: string
  /** Optional call-to-action (button/link). */
  action?: ReactNode
  className?: string
}

// 7.3 / 7.7 — one calm, accessible empty state. Replaces the half-dozen
// hand-rolled "nothing here yet" blocks so they all look and read the same.
export default function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('bg-white rounded-2xl border border-gray-100 p-12 text-center', className)}>
      {Icon && <Icon size={36} className="text-gray-200 mx-auto mb-3" />}
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      {description && <p className="text-gray-400 text-xs mt-1 max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  )
}
