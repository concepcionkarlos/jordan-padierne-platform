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
  // seller-specific
  property_address?: string | null
  condition?: string | null
  why_selling?: string | null
  occupancy?: string | null
  expected_price?: number | null
  mortgage_balance?: number | null
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
  const tl = (a.timeline ?? '').toLowerCase()
  const intent = (a.intent ?? '').toLowerCase()

  // ─── Seller path — different signals entirely ───
  if (intent.includes('sell')) {
    return evaluateSeller(a, name, tl)
  }

  const tags = new Set<string>()
  let points = 0

  const fin = (a.financing_status ?? '').toLowerCase()
  const budget = a.budget_max ?? a.budget_min ?? 0
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

// ─── Seller evaluation ──────────────────────────────────────────────────────────
function evaluateSeller(a: QualAnswers, name: string, tl: string): Evaluation {
  const tags = new Set<string>(['referral']) // seller flag for the pipeline
  let points = 1 // sellers are inherently valuable (a listing)

  const why = (a.why_selling ?? '').toLowerCase()
  const motivated = why.includes('relocat') || why.includes('financ') || why.includes('downsiz')
  if (motivated) { points += 3; tags.add('urgent') }
  else if (why.includes('upgrad') || why.includes('investment')) points += 1

  const urgent = tl.includes('asap') || tl.includes('1-30') || tl.includes('1-3')
  if (urgent) points += 2

  // Equity signal — if they expect a high price and low/no mortgage, strong listing
  const price = a.expected_price ?? 0
  const mortgage = a.mortgage_balance ?? 0
  if (price >= 1_000_000) { tags.add('vip'); points += 1 }
  if (price > 0 && mortgage < price * 0.5) points += 1 // strong equity

  let hot_score = 1
  let temperature: Evaluation['temperature'] = 'Cool'
  if (points >= 5) { hot_score = 3; temperature = 'Hot'; tags.add('hot') }
  else if (points >= 3) { hot_score = 2; temperature = 'Warm' }

  const tasks: TaskSpec[] = []
  if (temperature === 'Hot') {
    tasks.push({ title: `🔥 Call ${name} NOW — motivated seller${urgent ? ', wants to sell fast' : ''}`, priority: 'high' })
  } else {
    tasks.push({ title: `Call ${name} to discuss listing their home`, priority: temperature === 'Warm' ? 'high' : 'medium' })
  }
  tasks.push({ title: `Prepare a home valuation / CMA for ${name}${a.property_address ? ` (${a.property_address})` : ''}`, priority: 'high' })
  tasks.push({ title: `Schedule a listing appointment with ${name}`, priority: temperature === 'Cool' ? 'low' : 'medium' })

  const priceTxt = a.expected_price ? formatCurrency(a.expected_price) : ''
  const lines = [
    `🏡 ${a.full_name} wants to SELL — evaluated as ${temperature.toUpperCase()}.`,
    a.property_address && `Property: ${a.property_address}`,
    a.property_type && `Type: ${a.property_type}`,
    a.condition && `Condition: ${a.condition}`,
    a.why_selling && `Reason: ${a.why_selling}`,
    a.timeline && `Timeline: ${a.timeline}`,
    a.occupancy && `Occupancy: ${a.occupancy}`,
    priceTxt && `Hopes to get: ${priceTxt}`,
    a.mortgage_balance ? `Mortgage balance: ${formatCurrency(a.mortgage_balance)}` : null,
    a.motivation && `Notes: ${a.motivation}`,
    a.best_time && `Best time to reach: ${a.best_time}`,
  ].filter(Boolean)

  return { hot_score, tags: Array.from(tags), tasks, summary: lines.join('\n'), temperature }
}
