import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { requireUser } from '@/lib/auth'
import { getLeadFreshness, getFollowupStatus, scoreLead } from '@/lib/leads'
import { getNextAction, urgencyRank } from '@/lib/coach'
import { buildMorningBrief } from '@/lib/morning-brief'
import { commissionFor, STAGE_PROBABILITY } from '@/lib/goals'

export const dynamic = 'force-dynamic'

// The native "Now" screen's brain. Extracts the SAME intelligence the web dashboard
// computes — Coach next-best-actions, the Morning Brief, Smart Score — and serves it
// to mobile, reorganized around action. Reuses the web's lib functions verbatim; no
// new business logic.
//   GET /api/today    Authorization: Bearer <supabase access token>

function isActive(l: any): boolean {
  return !['closed', 'lost'].includes(l.status ?? '') && !['CLOSED', 'LOST'].includes(l.pipeline_stage ?? '')
}

export async function GET() {
  const denied = await requireUser()
  if (denied) return denied

  try {
    const supabase = createServiceClient()
    const now = new Date()
    const nowIso = now.toISOString()

    const [leadsRes, notesRes, apptRes, taskRes] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(400),
      supabase.from('notes').select('created_at, lead_id').order('created_at', { ascending: false }).limit(800),
      supabase.from('appointments').select('*, leads(full_name, phone)').order('starts_at', { ascending: true }).limit(200),
      supabase.from('tasks').select('id, status, due_date').neq('status', 'done').limit(200),
    ])
    const leads = (leadsRes.data ?? []) as any[]
    const notes = (notesRes.data ?? []) as any[]
    const appts = (apptRes.data ?? []) as any[]
    const todoTasks = (taskRes.data ?? []) as any[]

    const active = leads.filter(isActive)

    // Per-lead note counts / latest note / appointments (Coach context).
    const noteCountBy: Record<string, number> = {}
    const lastNoteBy: Record<string, string> = {}
    for (const n of notes) {
      if (!n.lead_id) continue
      noteCountBy[n.lead_id] = (noteCountBy[n.lead_id] ?? 0) + 1
      if (!lastNoteBy[n.lead_id]) lastNoteBy[n.lead_id] = n.created_at // desc → first is latest
    }
    const apptByLead: Record<string, any[]> = {}
    for (const a of appts) { if (a.lead_id) (apptByLead[a.lead_id] ??= []).push(a) }

    // ─── Coach Action Feed: single best move per active lead, prioritized ───
    const feed = active
      .map((l: any) => {
        const la = apptByLead[l.id] ?? []
        const upcoming = la.find((a: any) => new Date(a.starts_at) >= now && a.status === 'scheduled')
        const pastAppt = la.find((a: any) => new Date(a.starts_at) < now)
        const lastNote = lastNoteBy[l.id]
        const action = getNextAction(l, {
          noteCount: noteCountBy[l.id] ?? 0,
          hasUpcomingAppt: !!upcoming,
          nextApptAt: upcoming?.starts_at ?? null,
          hasPastApptNoFollowup: !!pastAppt && (!lastNote || new Date(lastNote) < new Date(pastAppt.starts_at)),
        })
        return { lead: l, action }
      })
      .sort((a, b) => urgencyRank(a.action.urgency) - urgencyRank(b.action.urgency))
      .slice(0, 8)

    // ─── Demoted counts (secondary glance) ───
    const hotLeads = active.filter((l: any) => l.hot_score === 3)
    const urgentLeads = active.filter((l: any) => { const f = getLeadFreshness(l); return f.level === 'stale' || f.level === 'cold' })
    const overdueFollowups = active.filter((l: any) => getFollowupStatus(l.next_followup)?.overdue)
    const today = nowIso.slice(0, 10)
    const todaysTasks = todoTasks.filter((t: any) => t.due_date && String(t.due_date).slice(0, 10) <= today)

    // ─── Morning Brief inputs (reuse the dashboard's signals) ───
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endToday = new Date(startToday.getTime() + 86400000)
    const todaysAppts = appts.filter((a: any) => { const t = new Date(a.starts_at); return t >= startToday && t < endToday && a.status === 'scheduled' })
    const followupsDue = active.filter((l: any) => getFollowupStatus(l.next_followup)?.due)
    const dealsAtRisk = active
      .filter((l: any) => ['CONTACTED', 'SHOWING_SCHEDULED', 'NEGOTIATION'].includes(l.pipeline_stage))
      .map((l: any) => ({ lead: l, days: getLeadFreshness(l).ageDays }))
      .filter((x) => x.days >= 5)
      .sort((a, b) => b.days - a.days)
      .slice(0, 5)
    const closest = active
      .filter((l: any) => (l.deal_value ?? l.budget_max ?? 0) > 0)
      .map((l: any) => {
        const prob = l.close_probability != null ? l.close_probability / 100 : (STAGE_PROBABILITY[l.pipeline_stage] ?? 0.1)
        const value = l.deal_value ?? l.budget_max ?? 0
        return { lead: l, prob, value, commission: commissionFor(value, l.commission_rate ?? 3) }
      })
      .sort((a, b) => b.prob - a.prob || b.value - a.value)[0] ?? null

    const top = feed[0]
    const brief = buildMorningBrief({
      topMove: top ? { title: top.action.title, name: top.lead.full_name } : null,
      hottest: hotLeads[0] ? { name: hotLeads[0].full_name } : null,
      closest: closest ? { name: closest.lead.full_name, prob: closest.prob, commission: closest.commission } : null,
      risk: dealsAtRisk.map((x) => ({ name: x.lead.full_name, days: x.days })),
      todayAppts: todaysAppts.length,
      followups: followupsDue.length,
      overdue: overdueFollowups.length,
    })

    const actions = feed.map(({ lead, action }) => ({
      leadId: lead.id,
      name: lead.full_name,
      phone: lead.phone,
      stage: lead.pipeline_stage,
      score: scoreLead(lead).score,
      urgency: action.urgency,
      title: action.title,
      reason: action.reason,
      emoji: action.emoji,
      actionLabel: action.actionLabel,
    }))

    const appt = appts.find((a: any) => new Date(a.starts_at) >= now)
    const nextAppointment = appt
      ? {
          id: appt.id, title: appt.title, startTime: appt.starts_at,
          type: appt.type ?? null, location: appt.location ?? null,
          leadName: appt.leads?.full_name ?? null, leadPhone: appt.leads?.phone ?? null,
        }
      : null

    return NextResponse.json({
      success: true,
      data: {
        brief,
        actions,
        counts: {
          hotLeads: hotLeads.length,
          urgentLeads: urgentLeads.length,
          overdueFollowups: overdueFollowups.length,
          todaysTasks: todaysTasks.length,
        },
        nextAppointment,
      },
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
