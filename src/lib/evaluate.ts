// ─── Intelligent lead evaluation ───────────────────────────────────────────────
// When a client completes their qualification profile, this engine reads the
// answers and decides: how hot they are, what tags apply, and which concrete
// tasks Jordan should do next. Rules-based, no AI.

import { formatCurrency } from './utils'

export interface QualAnswers {
  full_name: string
  intent?: string            // Buy / Sell / Invest / Rent
  client_type?: string
  budget_min?: number | null
  budget_max?: number | null
  timeline?: string | null
  financing_status?: string | null
  preferred_area?: string | null
  property_type?: string | null
  bedrooms?: string | null
  must_haves?: string | null
  motivation?: string | null
  best_time?: string | null
  contact_method?: string | null
}

export interface TaskSpec {
  title: string
  priority: 'low' | 'medium' | 'high'
}

export interface Evaluation {
  hot_score: number          // 1–3
  tags: string[]
  tasks: TaskSpec[]
  summary: string            // human-readable note for the activity log
  temperature: 'Hot' | 'Warm' | 'Cool'
}

function firstName(full: string) {
  return (full || '').trim().split(' ')[0] || 'this lead'
}

export function evaluateLead(a: QualAnswers): Evaluation {
  const name = firstName(a.full_name)
  const tags = new Set<string>()
  let points = 0

  const fin = (a.financing_status ?? '').toLowerCase()
  const tl = (a.timeline ?? '').toLowerCase()
  const budget = a.budget_max ?? a.budget_min ?? 0
  const intent = (a.intent ?? '').toLowerCase()
  const ctype = (a.client_type ?? '').toLowerCase()

  // Financing readiness — biggest signal
  const isCash = fin.includes('cash')
  const isPreApproved = fin.includes('approved') || fin.includes('pre-approv')
  if (isCash) { tags.add('cash_buyer'); points += 3 }
  else if (isPreApproved) { tags.add('pre_approved'); points += 3 }
  else if (fin.includes('process')) { points += 1 }

  // Urgency
  const urgent = tl.includes('asap') || tl.includes('1-30') || tl.includes('1-3')
  if (urgent) { points += 2; tags.add('urgent') }

  // Budget tier
  if (budget >= 1_000_000) { tags.add('vip'); points += 2 }
  else if (budget >= 600_000) { points += 1 }

  // Type
  if (intent.includes('invest') || ctype.includes('investor')) tags.add('investor')
  if (ctype.includes('international')) tags.add('international')
  if (intent.includes('sell')) tags.add('referral') // seller — flag for valuation follow-up

  // Temperature from points
  let hot_score = 1
  let temperature: Evaluation['temperature'] = 'Cool'
  if (points >= 5) { hot_score = 3; temperature = 'Hot'; tags.add('hot') }
  else if (points >= 2) { hot_score = 2; temperature = 'Warm' }

  // ─── Generate concrete tasks ───
  const tasks: TaskSpec[] = []
  const budgetText = a.budget_max
    ? `${a.budget_min ? formatCurrency(a.budget_min) : ''}–${formatCurrency(a.budget_max)}`
    : a.budget_min ? `${formatCurrency(a.budget_min)}+` : ''

  if (temperature === 'Hot') {
    const why = isCash ? 'cash buyer' : isPreApproved ? 'pre-approved' : 'high intent'
    tasks.push({ title: `🔥 Call ${name} NOW — ${why}${urgent ? ' & ready to move' : ''}`, priority: 'high' })
  } else {
    tasks.push({ title: `Call ${name} to review their profile`, priority: temperature === 'Warm' ? 'high' : 'medium' })
  }

  // Send matching listings
  if (a.preferred_area || budgetText || a.property_type) {
    const bits = [a.property_type, a.preferred_area, budgetText].filter(Boolean).join(' · ')
    tasks.push({ title: `Send ${name} matching listings — ${bits}`, priority: temperature === 'Hot' ? 'high' : 'medium' })
  }

  // Financing nudge
  if (!isCash && !isPreApproved) {
    tasks.push({ title: `Connect ${name} with a lender to get pre-approved`, priority: 'medium' })
  }

  // Seller → valuation
  if (intent.includes('sell')) {
    tasks.push({ title: `Prepare a home valuation / CMA for ${name}`, priority: 'high' })
  }

  // ─── Summary note ───
  const lines = [
    `✅ ${a.full_name} completed their profile — evaluated as ${temperature.toUpperCase()}.`,
    a.intent && `Goal: ${a.intent}`,
    budgetText && `Budget: ${budgetText}`,
    a.timeline && `Timeline: ${a.timeline}`,
    a.financing_status && `Financing: ${a.financing_status}`,
    a.preferred_area && `Area: ${a.preferred_area}`,
    a.property_type && `Type: ${a.property_type}${a.bedrooms ? `, ${a.bedrooms} bd` : ''}`,
    a.must_haves && `Must-haves: ${a.must_haves}`,
    a.motivation && `Motivation: ${a.motivation}`,
    a.best_time && `Best time to reach: ${a.best_time}`,
  ].filter(Boolean)

  return { hot_score, tags: Array.from(tags), tasks, summary: lines.join('\n'), temperature }
}
