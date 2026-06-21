import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { sendProfileReminder } from '@/lib/email'

// Runs daily via Vercel Cron. Finds leads who got the "complete your profile"
// invite but never finished it, and sends a single reminder after ~2 days.
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
    const twoDaysAgo = new Date(now - 2 * 86400000).toISOString()
    const fiveDaysAgo = new Date(now - 5 * 86400000).toISOString()

    // Candidates: still 'new' (never qualified), created 2–5 days ago, has a real email
    const { data: leads, error } = await supabase
      .from('leads')
      .select('id, full_name, email, status, metadata, created_at')
      .eq('status', 'new')
      .lte('created_at', twoDaysAgo)
      .gte('created_at', fiveDaysAgo)
      .limit(200)

    if (error) throw error

    let sent = 0
    for (const lead of leads ?? []) {
      const meta = (lead.metadata ?? {}) as Record<string, unknown>
      // Skip if already qualified, already reminded, or no usable email
      if (meta.qualified_at || meta.reminder_sent) continue
      if (!lead.email || lead.email.includes('placeholder')) continue

      const ok = await sendProfileReminder(lead.email, lead.full_name, lead.id)
      if (ok) {
        await supabase.from('leads').update({
          metadata: { ...meta, reminder_sent: new Date().toISOString() },
        }).eq('id', lead.id)
        sent++
      }
    }

    return NextResponse.json({ success: true, checked: leads?.length ?? 0, sent })
  } catch (err) {
    console.error('[cron/reminders]', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
