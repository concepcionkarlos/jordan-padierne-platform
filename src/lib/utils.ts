import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { stageBadge, statusBadge } from '@/lib/status-tokens'

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

// Status colours live in one place now — see src/lib/status-tokens.ts. These
// keep their original signatures (and exact class strings) so every existing
// caller is untouched; they just read from the shared map.
export function getPipelineStageColor(stage: string): string {
  return stageBadge(stage)
}

export function getStatusColor(status: string): string {
  return statusBadge(status)
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
