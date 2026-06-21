import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(typeof date === 'string' ? new Date(date) : date)
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const target = typeof date === 'string' ? new Date(date) : date
  const diffMs = now.getTime() - target.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(target)
}

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

export function getPipelineStageLabel(stage: string): string {
  const labels: Record<string, string> = {
    NEW: 'New',
    QUALIFIED: 'Qualified',
    CONTACTED: 'Contacted',
    SHOWING_SCHEDULED: 'Showing Scheduled',
    NEGOTIATION: 'In Negotiation',
    CLOSED: 'Closed',
    LOST: 'Lost',
  }
  return labels[stage] ?? stage
}

export function getPipelineStageColor(stage: string): string {
  const colors: Record<string, string> = {
    NEW: 'bg-sky-100 text-sky-700',
    QUALIFIED: 'bg-blue-100 text-blue-700',
    CONTACTED: 'bg-purple-100 text-purple-700',
    SHOWING_SCHEDULED: 'bg-orange-100 text-orange-700',
    NEGOTIATION: 'bg-amber-100 text-amber-700',
    CLOSED: 'bg-green-100 text-green-700',
    LOST: 'bg-red-100 text-red-700',
  }
  return colors[stage] ?? 'bg-gray-100 text-gray-700'
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    new: 'bg-sky-100 text-sky-700',
    contacted: 'bg-blue-100 text-blue-700',
    qualified: 'bg-purple-100 text-purple-700',
    active: 'bg-green-100 text-green-700',
    closed: 'bg-navy-100 text-navy-700',
    lost: 'bg-red-100 text-red-700',
    unread: 'bg-wine-50 text-wine-600',
    read: 'bg-gray-100 text-gray-600',
    replied: 'bg-green-100 text-green-700',
    archived: 'bg-gray-100 text-gray-500',
  }
  return colors[status] ?? 'bg-gray-100 text-gray-700'
}

export const AREAS = [
  'Miami-Dade',
  'Brickell',
  'Downtown Miami',
  'Doral',
  'Coral Gables',
  'Hialeah',
  'Coconut Grove',
  'Wynwood',
  'Edgewater',
  'Miami Beach',
  'Aventura',
  'Other',
]

export const CLIENT_TYPES = [
  'Buyer',
  'Investor',
  'International Buyer',
  'Luxury Buyer',
  'Pre-Construction Buyer',
  'Seller',
]

export const TIMELINES = [
  'ASAP (1-30 days)',
  '1-3 months',
  '3-6 months',
  '6-12 months',
  'More than a year',
  'Just exploring',
]

export const FINANCING_OPTIONS = [
  'Cash buyer',
  'Pre-approved',
  'In process of pre-approval',
  'Need financing guidance',
  'Not sure yet',
]

export const BUDGET_RANGES = [
  'Under $300K',
  '$300K - $500K',
  '$500K - $750K',
  '$750K - $1M',
  '$1M - $2M',
  '$2M - $5M',
  '$5M+',
]
