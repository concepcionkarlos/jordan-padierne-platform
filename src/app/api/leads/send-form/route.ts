import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { requireUser } from '@/lib/auth'
import { sendProfileReminder } from '@/lib/email'

// Manually send the buyer qualification form to a lead from the CRM.
// Emails the lead a link to /qualify/[id]; their answers flow back into the
// lead profile via /api/qualify. Logs the send so Jordan sees it in the timeline.
export async function POST(req: NextRequest) {
  const denied = await requireUser(); if (denied) return denied
  try {
    const supabase = createServiceClient()
    const { lead_id } = await req.json()
    if (!lead_id) {
      return NextResponse.json({ success: false, error: 'lead_id required' }, { status: 400 })
    }

    const { data: lead } = await supabase
      .from('leads')
      .select('id, full_name, email, metadata')
      .eq('id', lead_id)
      .single()

    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 })
    }
    if (!lead.email || /placeholder|no-email/i.test(lead.email)) {
      return NextResponse.json({ success: false, error: 'This lead has no real email on file.' }, { status: 400 })
    }

    const ok = await sendProfileReminder(lead.email, lead.full_name ?? 'there', lead.id)
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Email could not be sent. Check email settings.' }, { status: 502 })
    }

    const sentAt = new Date().toISOString()

    // Mark on the lead + log it in the activity timeline.
    await supabase
      .from('leads')
      .update({ metadata: { ...(lead.metadata ?? {}), form_sent_at: sentAt } })
      .eq('id', lead.id)

    const { data: note } = await supabase
      .from('notes')
      .insert({ content: `📨 Buyer form sent to ${lead.email}`, lead_id: lead.id, author: 'CRM' })
      .select('id, content, author, created_at')
      .single()

    return NextResponse.json({ success: true, sent_at: sentAt, note })
  } catch (err) {
    console.error('[leads/send-form] error', err)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}
