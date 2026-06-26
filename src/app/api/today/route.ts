import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { requireUser } from '@/lib/auth'
import { getLeadFreshness, getFollowupStatus } from '@/lib/leads'

export const dynamic = 'force-dynamic'

// Read-only "Today" payload for the native iOS shell (Milestone 1). One call →
// next appointment + the four counts. Authenticated via the shared guard, which
// accepts both the web cookie and a native Bearer access token. Count definitions
// mirror the web dashboard so the app's numbers match the CRM exactly.
//
//   GET /api/today    Authorization: Bearer <supabase access token>

function isActive(l: { status?: string; pipeline_stage?: string }): boolean {
  return !['closed', 'lost'].includes(l.status ?? '') && !['CLOSED', 'LOST'].includes(l.pipeline_stage ?? '')
}

export async function GET() {
  const denied = await requireUser()
  if (denied) return denied

  try {
    const supabase = createServiceClient()
    const nowIso = new Date().toISOString()

    const [leadsRes, tasksRes, apptRes] = await Promise.all([
      supabase
        .from('leads')
        .select('id, full_name, phone, pipeline_stage, status, hot_score, last_contact, next_followup, created_at')
        .limit(2000),
      supabase
        .from('tasks')
        .select('id, status, due_date')
        .neq('status', 'done')
        .limit(1000),
      supabase
        .from('appointments')
        .select('id, title, type, location, starts_at, leads(full_name, phone)')
        .gte('starts_at', nowIso)
        .order('starts_at', { ascending: true })
        .limit(1),
    ])

    const leads = (leadsRes.data ?? []) as any[]
    const tasks = (tasksRes.data ?? []) as any[]
    const appt = ((apptRes.data ?? []) as any[])[0] ?? null

    // 🔥 Hot — hot_score === 3 (same as the leads-page "Hot" stat).
    const hotLeads = leads.filter((l) => l.hot_score === 3).length

    // ⚡ Urgent — active leads whose freshness has gone stale or cold.
    const urgentLeads = leads.filter((l) => {
      if (!isActive(l)) return false
      const f = getLeadFreshness(l)
      return f.level === 'stale' || f.level === 'cold'
    }).length

    // ⏰ Overdue follow-ups — active leads with a past-due next_followup.
    const overdueFollowups = leads.filter((l) => {
      if (!isActive(l)) return false
      return !!getFollowupStatus(l.next_followup)?.overdue
    }).length

    // ✅ Today's tasks — open tasks due today or earlier.
    const today = nowIso.slice(0, 10)
    const todaysTasks = tasks.filter((t) => t.due_date && String(t.due_date).slice(0, 10) <= today).length

    const nextAppointment = appt
      ? {
          id: appt.id,
          title: appt.title,
          startTime: appt.starts_at,
          type: appt.type ?? null,
          location: appt.location ?? null,
          leadName: appt.leads?.full_name ?? null,
          leadPhone: appt.leads?.phone ?? null,
        }
      : null

    return NextResponse.json({
      success: true,
      data: {
        nextAppointment,
        counts: { hotLeads, urgentLeads, overdueFollowups, todaysTasks },
      },
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
