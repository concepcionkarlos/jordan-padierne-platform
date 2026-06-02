import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color?: 'navy' | 'sky' | 'wine' | 'green' | 'orange'
  trend?: { value: string; positive: boolean }
}

const colorMap = {
  navy: 'bg-navy-50 text-navy-700',
  sky: 'bg-sky-50 text-sky-600',
  wine: 'bg-wine-50 text-wine-600',
  green: 'bg-green-50 text-green-600',
  orange: 'bg-orange-50 text-orange-600',
}

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'navy', trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">{title}</p>
          <p className="font-serif text-3xl font-bold text-navy-900 mt-1">{value}</p>
          {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', colorMap[color])}>
          <Icon size={20} />
        </div>
      </div>
      {trend && (
        <div className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full', trend.positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500')}>
          {trend.positive ? '↑' : '↓'} {trend.value}
        </div>
      )}
    </div>
  )
}
