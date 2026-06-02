// ─── Lead Tags ────────────────────────────────────────────────────────────────
// Reusable labels Jordan can apply to any lead for fast segmentation.

export interface TagDef {
  id: string
  label: string
  emoji: string
  className: string
}

export const LEAD_TAGS: TagDef[] = [
  { id: 'hot', label: 'Hot', emoji: '🔥', className: 'bg-red-50 text-red-600 border-red-200' },
  { id: 'pre_approved', label: 'Pre-Approved', emoji: '✅', className: 'bg-green-50 text-green-600 border-green-200' },
  { id: 'cash_buyer', label: 'Cash Buyer', emoji: '💵', className: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { id: 'international', label: 'International', emoji: '🌎', className: 'bg-sky-50 text-sky-600 border-sky-200' },
  { id: 'vip', label: 'VIP', emoji: '⭐', className: 'bg-amber-50 text-amber-600 border-amber-200' },
  { id: 'investor', label: 'Investor', emoji: '📈', className: 'bg-purple-50 text-purple-600 border-purple-200' },
  { id: 'referral', label: 'Referral', emoji: '🤝', className: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 'spanish', label: 'Español', emoji: '🗣️', className: 'bg-orange-50 text-orange-600 border-orange-200' },
  { id: 'urgent', label: 'Urgent', emoji: '⚡', className: 'bg-wine-50 text-wine border-wine-100' },
  { id: 'cold', label: 'Cold', emoji: '❄️', className: 'bg-slate-50 text-slate-500 border-slate-200' },
]

export function getTagDef(id: string): TagDef {
  return LEAD_TAGS.find((t) => t.id === id) ?? { id, label: id, emoji: '🏷️', className: 'bg-gray-50 text-gray-600 border-gray-200' }
}

// ─── Hot Score ────────────────────────────────────────────────────────────────

export const HOT_SCORES = [
  { value: 3, label: 'Hot', emoji: '🔥', className: 'bg-red-500 text-white', dot: 'bg-red-500' },
  { value: 2, label: 'Warm', emoji: '🌤️', className: 'bg-amber-400 text-white', dot: 'bg-amber-400' },
  { value: 1, label: 'Cold', emoji: '❄️', className: 'bg-sky-300 text-white', dot: 'bg-sky-300' },
]

export function getHotScore(value: number | null | undefined) {
  return HOT_SCORES.find((s) => s.value === (value ?? 1)) ?? HOT_SCORES[2]
}

// ─── Lead Age & Stale Detection ─────────────────────────────────────────────

export interface LeadFreshness {
  ageDays: number
  label: string
  level: 'fresh' | 'aging' | 'stale' | 'cold'
  className: string
  dotClassName: string
}

/**
 * Returns how "fresh" a lead is based on the last meaningful contact
 * (last_contact if set, otherwise created_at). Drives the urgency colors.
 */
export function getLeadFreshness(lead: { created_at: string; last_contact?: string | null; status?: string }): LeadFreshness {
  const reference = lead.last_contact ?? lead.created_at
  const refDate = new Date(reference)
  const now = new Date()
  const ageDays = Math.floor((now.getTime() - refDate.getTime()) / 86400000)

  // Closed/lost leads don't go stale
  const dormant = lead.status === 'closed' || lead.status === 'lost'

  if (dormant) {
    return { ageDays, label: lead.status === 'closed' ? 'Closed' : 'Lost', level: 'cold', className: 'text-gray-400', dotClassName: 'bg-gray-300' }
  }
  if (ageDays <= 2) {
    return { ageDays, label: 'Fresh', level: 'fresh', className: 'text-green-600', dotClassName: 'bg-green-500' }
  }
  if (ageDays <= 7) {
    return { ageDays, label: `${ageDays}d — follow up`, level: 'aging', className: 'text-amber-600', dotClassName: 'bg-amber-400' }
  }
  if (ageDays <= 21) {
    return { ageDays, label: `${ageDays}d — needs attention`, level: 'stale', className: 'text-orange-600', dotClassName: 'bg-orange-500' }
  }
  return { ageDays, label: `${ageDays}d — going cold`, level: 'cold', className: 'text-wine', dotClassName: 'bg-wine' }
}

// ─── Follow-up status ──────────────────────────────────────────────────────────

export function getFollowupStatus(nextFollowup: string | null | undefined): { due: boolean; overdue: boolean; today: boolean; label: string } | null {
  if (!nextFollowup) return null
  const date = new Date(nextFollowup)
  const now = new Date()
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((startTarget.getTime() - startToday.getTime()) / 86400000)

  if (diffDays < 0) return { due: true, overdue: true, today: false, label: `Overdue ${Math.abs(diffDays)}d` }
  if (diffDays === 0) return { due: true, overdue: false, today: true, label: 'Due today' }
  if (diffDays === 1) return { due: false, overdue: false, today: false, label: 'Tomorrow' }
  return { due: false, overdue: false, today: false, label: `In ${diffDays}d` }
}

// ─── Automatic Lead Scoring (0–100) ──────────────────────────────────────────────
// A "Smart Score" computed live from the data we already have — no AI, no migration.
// Mirrors what BoldTrail/kvCORE call lead scoring: budget + engagement + intent.

export interface LeadScore {
  score: number          // 0–100
  label: 'Hot' | 'Warm' | 'Cool' | 'Cold'
  emoji: string
  className: string
  breakdown: { label: string; points: number }[]
}

export function scoreLead(lead: {
  budget_max?: number | null
  budget_min?: number | null
  deal_value?: number | null
  pipeline_stage: string
  status?: string
  timeline?: string | null
  financing_status?: string | null
  tags?: string[] | null
  created_at: string
  last_contact?: string | null
  noteCount?: number
  apptCount?: number
}): LeadScore {
  const breakdown: { label: string; points: number }[] = []
  let score = 0
  const add = (label: string, points: number) => { if (points !== 0) { score += points; breakdown.push({ label, points }) } }

  // Budget / deal value — up to 25
  const value = lead.deal_value ?? lead.budget_max ?? lead.budget_min ?? 0
  let budgetPts = 0
  if (value >= 1_500_000) budgetPts = 25
  else if (value >= 1_000_000) budgetPts = 22
  else if (value >= 750_000) budgetPts = 18
  else if (value >= 500_000) budgetPts = 14
  else if (value >= 300_000) budgetPts = 10
  else if (value > 0) budgetPts = 6
  add('Budget', budgetPts)

  // Pipeline stage — up to 20
  const stagePts: Record<string, number> = {
    NEW: 3, QUALIFIED: 8, CONTACTED: 11, SHOWING_SCHEDULED: 15, NEGOTIATION: 20, CLOSED: 20, LOST: 0,
  }
  add('Stage', stagePts[lead.pipeline_stage] ?? 3)

  // Engagement — up to 25 (activity logged + appointments)
  const notes = lead.noteCount ?? 0
  const appts = lead.apptCount ?? 0
  const engagementPts = Math.min(25, notes * 4 + appts * 7)
  add('Engagement', engagementPts)

  // Financing / readiness — up to 15
  const fin = (lead.financing_status ?? '').toLowerCase()
  const tags = lead.tags ?? []
  let finPts = 0
  if (tags.includes('cash_buyer') || fin.includes('cash')) finPts = 15
  else if (tags.includes('pre_approved') || fin.includes('approved')) finPts = 12
  else if (fin.includes('process') || fin.includes('pre-approval')) finPts = 7
  add('Financing', finPts)

  // Timeline urgency — up to 10
  const tl = (lead.timeline ?? '').toLowerCase()
  let tlPts = 0
  if (tl.includes('asap') || tl.includes('1-30')) tlPts = 10
  else if (tl.includes('1-3')) tlPts = 7
  else if (tl.includes('3-6')) tlPts = 5
  else if (tl.includes('6-12')) tlPts = 2
  add('Timeline', tlPts)

  // Priority tags — up to 5
  if (tags.includes('vip')) add('VIP', 5)
  else if (tags.includes('hot')) add('Hot tag', 3)

  // Freshness penalty
  const fresh = getLeadFreshness(lead as any)
  if (fresh.level === 'stale') add('Going stale', -8)
  else if (fresh.level === 'cold' && lead.status !== 'closed') add('Cold', -15)

  score = Math.max(0, Math.min(100, Math.round(score)))

  let label: LeadScore['label'], emoji: string, className: string
  if (score >= 75) { label = 'Hot'; emoji = '🔥'; className = 'bg-red-50 text-red-600 border-red-200' }
  else if (score >= 50) { label = 'Warm'; emoji = '🌤️'; className = 'bg-amber-50 text-amber-600 border-amber-200' }
  else if (score >= 30) { label = 'Cool'; emoji = '🌥️'; className = 'bg-sky-50 text-sky-600 border-sky-200' }
  else { label = 'Cold'; emoji = '❄️'; className = 'bg-slate-50 text-slate-500 border-slate-200' }

  return { score, label, emoji, className, breakdown }
}

export function scoreColor(score: number): string {
  if (score >= 75) return '#EF4444'
  if (score >= 50) return '#F59E0B'
  if (score >= 30) return '#7BA7C2'
  return '#94A3B8'
}
