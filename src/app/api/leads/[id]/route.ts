import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { requireUser } from '@/lib/auth'
import { scoreLead } from '@/lib/leads'
import { getNextAction } from '@/lib/coach'

export const dynamic = 'force-dynamic'

// Single-lead detail for the native app: the lead + its Smart Score + temperature +
// the Coach's next-best-action + the timeline (notes + appointments), in one call.
// Reuses the same getNextAction / scoreLead the web uses — no new business logic.
// (Next resolves the static siblings /api/leads/search|import|… before this [id] route.)
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await requireUser()
  if (denied) return denied

  try {
    const supabase = createServiceClient()
    const id = params.id

    const [leadRes, notesRes, apptRes] = await Promise.all([
      supabase.from('leads').select('*').eq('id', id).single(),
      supabase.from('notes').select('id, content, author, created_at').eq('lead_id', id).order('created_at', { ascending: false }).limit(200),
      supabase.from('appointments').select('id, title, type, starts_at, status').eq('lead_id', id).order('starts_at', { ascending: true }).limit(100),
    ])

    const lead = leadRes.data
    if (!lead) return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 })
    const notes = (notesRes.data ?? []) as any[]
    const appointments = (apptRes.data ?? []) as any[]

    const now = new Date()
    const upcoming = appointments.find((a) => new Date(a.starts_at) >= now && a.status === 'scheduled')
    const pastAppt = appointments.find((a) => new Date(a.starts_at) < now)
    const lastNote = notes[0]?.created_at // desc → first is latest

    const action = getNextAction(lead, {
      noteCount: notes.length,
      hasUpcomingAppt: !!upcoming,
      nextApptAt: upcoming?.starts_at ?? null,
      hasPastApptNoFollowup: !!pastAppt && (!lastNote || new Date(lastNote) < new Date(pastAppt.starts_at)),
    })

    return NextResponse.json({
      success: true,
      data: {
        lead,
        score: scoreLead(lead).score,
        temperature: lead.hot_score ?? null,
        coach: {
          title: action.title,
          reason: action.reason,
          urgency: action.urgency,
          emoji: action.emoji,
          actionType: action.actionType,
          actionLabel: action.actionLabel,
          stage: action.stage ?? null,
        },
        notes,
        appointments,
      },
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
