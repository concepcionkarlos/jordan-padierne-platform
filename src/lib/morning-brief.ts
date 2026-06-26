// Morning AI Brief — a concise, action-oriented summary composed from the data
// the Dashboard already computes. Deterministic and always-on (no external AI
// call), so it's accurate at any time of day and never "feels broken". This is
// the graceful path that runs whether or not AI keys are configured.

import { formatCurrency } from '@/lib/utils'

export interface MorningBriefInput {
  topMove?: { title: string; name: string } | null
  hottest?: { name: string } | null
  closest?: { name: string; prob: number; commission: number } | null
  risk: { name: string; days: number }[]
  todayAppts: number
  followups: number
  overdue: number
}

function joinList(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? ''
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`
  return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`
}

// Returns 1–4 short sentences, most important first.
export function buildMorningBrief(i: MorningBriefInput): string[] {
  const s: string[] = []

  // 1) What to do first.
  if (i.topMove) s.push(`Start here: ${i.topMove.title} — ${i.topMove.name}.`)
  else if (i.hottest) s.push(`Start with ${i.hottest.name}, your hottest lead.`)

  // 2) Closest to close.
  if (i.closest) {
    s.push(`${i.closest.name} is closest to closing — ${Math.round(i.closest.prob * 100)}% likely, ${formatCurrency(i.closest.commission)} commission.`)
  }

  // 3) Deals at risk.
  if (i.risk.length > 0) {
    const r = i.risk[0]
    s.push(`${i.risk.length} deal${i.risk.length > 1 ? 's' : ''} at risk — ${r.name} has gone quiet for ${r.days} day${r.days > 1 ? 's' : ''}.`)
  }

  // 4) Today's load.
  const bits: string[] = []
  if (i.todayAppts > 0) bits.push(`${i.todayAppts} appointment${i.todayAppts > 1 ? 's' : ''}`)
  if (i.followups > 0) bits.push(`${i.followups} follow-up${i.followups > 1 ? 's' : ''}`)
  if (i.overdue > 0) bits.push(`${i.overdue} overdue item${i.overdue > 1 ? 's' : ''}`)
  if (bits.length > 0) s.push(`On your plate today: ${joinList(bits)}.`)

  // Quiet pipeline → an encouraging, action-oriented nudge (never "broken").
  if (s.length === 0) s.push(`Your pipeline is calm right now — a great moment to prospect. Add a lead, schedule a showing, or check in with a past client.`)

  return s
}
