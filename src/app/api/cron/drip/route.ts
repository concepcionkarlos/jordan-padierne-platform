import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { sendEmail } from '@/lib/email'
import { trackFor, buildDueStep, DRIP_WINDOW_DAYS } from '@/lib/drip'

// Runs daily via Vercel Cron. Sends the next due follow-up email to leads that
// are still 'new' (Jordan hasn't engaged them yet). Stops automatically once a
// lead is moved out of 'new', once the sequence finishes, or after the window.
export async function GET(req: NextRequest) {
  // Protect: only Vercel Cron (or someone with the secret) may trigger this.
  // Fail CLOSED — if CRON_SECRET is missing, deny rather than run for everyone.
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServiceClient()
    const now = Date.now()
    const windowStart = new Date(now - DRIP_WINDOW_DAYS * 86400000).toISOString()
    const today = new Date(now).toISOString().slice(0, 10)

    // Only leads Jordan hasn't engaged yet, created within the drip window.
    const { data: leads, error } = await supabase
      .from('leads')
      .select('id, full_name, email, client_type, status, metadata, created_at')
      .eq('status', 'new')
      .gte('created_at', windowStart)
      .limit(300)

    if (error) throw error

    let sent = 0
    for (const lead of leads ?? []) {
      const meta = (lead.metadata ?? {}) as Record<string, unknown>
      if (meta.drip_stopped) continue
      if (!lead.email || lead.email.includes('placeholder') || lead.email.includes('example')) continue

      // Don't double-email on a day the profile reminder already went out.
      const reminderSent = typeof meta.reminder_sent === 'string' ? meta.reminder_sent.slice(0, 10) : null
      if (reminderSent === today) continue

      const ageDays = Math.floor((now - new Date(lead.created_at).getTime()) / 86400000)
      const sentDays = Array.isArray(meta.drip_sent) ? (meta.drip_sent as number[]) : []
      const track = trackFor(lead.client_type)
      const first = (lead.full_name || '').trim().split(' ')[0]

      const step = buildDueStep(track, ageDays, sentDays, first, lead.id)
      if (!step) continue

      const ok = await sendEmail(lead.email, step.subject, step.html)
      if (ok) {
        await supabase.from('leads').update({
          metadata: {
            ...meta,
            drip_sent: [...sentDays, step.day],
            drip_last: new Date(now).toISOString(),
            drip_track: track,
          },
        }).eq('id', lead.id)
        sent++
      }
    }

    return NextResponse.json({ success: true, checked: leads?.length ?? 0, sent })
  } catch (err) {
    console.error('[cron/drip]', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
