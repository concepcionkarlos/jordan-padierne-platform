import type { ReactNode } from 'react'

interface PageHeaderProps {
  /** Page title — rendered as the single h1. */
  title: string
  /** Optional supporting line (string or rich node, e.g. counts). */
  subtitle?: ReactNode
  /** Optional primary action(s), right-aligned on desktop. */
  action?: ReactNode
}

// 7.1 — the one header every admin page inherits. Title + subtitle + optional
// primary action, in the exact layout pages used to hand-roll, so adopting it
// changes nothing visually — it just removes the duplication.
export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div className="min-w-0">
        <h1 className="font-serif text-2xl font-bold text-navy-900">{title}</h1>
        {subtitle != null && <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  )
}
