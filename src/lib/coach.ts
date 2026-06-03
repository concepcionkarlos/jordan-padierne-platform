// ─── The Coach: Next Best Action engine ────────────────────────────────────────
// Rules-based (no AI) recommendation of the single most important thing Jordan
// should do for a given lead, based on its state. This is what turns the CRM
// from a passive list into a guide that tells him exactly what to do next.

import { getLeadFreshness, getFollowupStatus } from './leads'

export type ActionType = 'call' | 'whatsapp' | 'template' | 'schedule' | 'advance' | 'qualify'
export type Urgency = 'now' | 'today' | 'soon' | 'nurture'

export interface NextAction {
  id: string
  urgency: Urgency
  title: string          // what to do
  reason: string         // why — the coaching insight
  actionType: ActionType
  actionLabel: string    // button label
  templateId?: string    // for 'template' / 'whatsapp'
  stage?: string         // for 'advance'
  emoji: string
}

export interface CoachContext {
  noteCount: number
  hasUpcomingAppt: boolean
  nextApptAt?: string | null
  hasPastApptNoFollowup?: boolean
}

const URGENCY_META: Record<Urgency, { label: string; className: string; dot: string; rank: number }> = {
  now: { label: 'Do Now', className: 'bg-wine text-white', dot: 'bg-wine', rank: 0 },
  today: { label: 'Today', className: 'bg-amber-500 text-white', dot: 'bg-amber-500', rank: 1 },
  soon: { label: 'Soon', className: 'bg-sky-500 text-white', dot: 'bg-sky-500', rank: 2 },
  nurture: { label: 'Nurture', className: 'bg-gray-400 text-white', dot: 'bg-gray-400', rank: 3 },
}

export function urgencyMeta(u: Urgency) {
  return URGENCY_META[u]
}

/**
 * Returns the single recommended next action for a lead.
 * Rules are evaluated top-to-bottom; the first match wins (priority order).
 */
export function getNextAction(lead: any, ctx: CoachContext): NextAction {
  const stage = lead.pipeline_stage as string
  const status = lead.status as string
  const fresh = getLeadFreshness(lead)
  const fu = getFollowupStatus(lead.next_followup)
  const hot = lead.hot_score === 3
  const closed = status === 'closed' || status === 'lost'

  // Closed / lost — just nurture for referrals
  if (closed) {
    return {
      id: 'nurture-closed', urgency: 'nurture', emoji: '🤝',
      title: status === 'closed' ? 'Ask for a referral' : 'Keep the door open',
      reason: status === 'closed' ? 'Happy clients are your best source of new business.' : 'A polite check-in can revive a lost lead months later.',
      actionType: 'template', actionLabel: 'Send message', templateId: status === 'closed' ? 'thanks_referral' : 'followup_quiet',
    }
  }

  // 1) Brand-new lead, never contacted → speed to lead
  if (status === 'new' && ctx.noteCount === 0) {
    return {
      id: 'first-touch', urgency: 'now', emoji: '⚡',
      title: 'Call now — brand new lead',
      reason: 'Speed wins. Leads contacted within 5 minutes are far more likely to convert.',
      actionType: 'call', actionLabel: 'Call now',
    }
  }

  // 2) Follow-up is due / overdue
  if (fu?.due) {
    return {
      id: 'followup-due', urgency: fu.overdue ? 'now' : 'today', emoji: '📞',
      title: fu.overdue ? `Follow-up overdue (${fu.label})` : 'Follow-up due today',
      reason: 'You scheduled this follow-up. Showing up on time builds trust.',
      actionType: 'call', actionLabel: 'Call / reach out',
    }
  }

  // 3) Appointment today → confirm it
  if (ctx.hasUpcomingAppt && ctx.nextApptAt) {
    const appt = new Date(ctx.nextApptAt)
    const now = new Date()
    const sameDay = appt.toDateString() === now.toDateString()
    if (sameDay) {
      return {
        id: 'confirm-appt', urgency: 'today', emoji: '✅',
        title: "Confirm today's appointment",
        reason: 'A quick confirmation cuts no-shows dramatically.',
        actionType: 'template', actionLabel: 'Send confirmation', templateId: 'showing_confirm',
      }
    }
  }

  // 4) Just had a showing, no follow-up logged → get feedback
  if (ctx.hasPastApptNoFollowup) {
    return {
      id: 'post-showing', urgency: 'now', emoji: '💬',
      title: 'Follow up after the showing',
      reason: 'Strike while it\'s fresh — ask what they thought and gauge interest.',
      actionType: 'call', actionLabel: 'Get their feedback',
    }
  }

  // 5) In negotiation → stay on the offer
  if (stage === 'NEGOTIATION') {
    return {
      id: 'negotiation', urgency: 'today', emoji: '🤝',
      title: 'Push the deal forward',
      reason: 'Deals in negotiation go cold fast. Keep momentum on the offer.',
      actionType: 'call', actionLabel: 'Follow up on offer',
    }
  }

  // 6) Hot lead with no showing scheduled → schedule one
  if ((hot || (lead.budget_max ?? 0) >= 750000) && stage !== 'SHOWING_SCHEDULED' && !ctx.hasUpcomingAppt) {
    return {
      id: 'schedule-hot', urgency: 'now', emoji: '🔥',
      title: 'Schedule a showing — this lead is hot',
      reason: 'High intent or high budget. Get them in front of a property fast.',
      actionType: 'schedule', actionLabel: 'Schedule showing',
    }
  }

  // 7) Contacted but still NEW → qualify
  if (stage === 'NEW' && ctx.noteCount > 0) {
    return {
      id: 'qualify', urgency: 'today', emoji: '🎯',
      title: 'Qualify this lead',
      reason: 'You\'ve made contact — now confirm budget, timeline & financing, then advance them.',
      actionType: 'advance', actionLabel: 'Mark Qualified', stage: 'QUALIFIED',
    }
  }

  // 8) Going stale / cold → re-engage
  if (fresh.level === 'stale' || fresh.level === 'cold') {
    return {
      id: 're-engage', urgency: fresh.level === 'cold' ? 'now' : 'today', emoji: '🧊',
      title: `Re-engage — ${fresh.ageDays}d with no contact`,
      reason: 'This lead is cooling off. A friendly message can bring them back.',
      actionType: 'template', actionLabel: 'Send re-engage message', templateId: 'followup_quiet',
    }
  }

  // 9) Qualified, warm → keep nurturing with value
  if (stage === 'QUALIFIED' || stage === 'CONTACTED') {
    return {
      id: 'nurture-warm', urgency: 'soon', emoji: '🌤️',
      title: 'Send a fresh listing or check in',
      reason: 'Stay top of mind. Share a relevant opportunity to keep them engaged.',
      actionType: 'template', actionLabel: 'Send a message', templateId: 'followup_warm',
    }
  }

  // Default
  return {
    id: 'check-in', urgency: 'soon', emoji: '👋',
    title: 'Check in with this lead',
    reason: 'Regular touchpoints keep relationships warm.',
    actionType: 'template', actionLabel: 'Send a message', templateId: 'followup_warm',
  }
}

/** Sort helper for action feeds. */
export function urgencyRank(u: Urgency): number {
  return URGENCY_META[u].rank
}
