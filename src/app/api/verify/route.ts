import { NextRequest, NextResponse } from 'next/server'
import { consumePending, finalizeFormLead, finalizeSubscribe } from '@/lib/intake'
import { createServiceClient } from '@/lib/supabase'
import { sendProfileReminder } from '@/lib/email'

// Public: the customer clicked the confirmation link. Consume the one-time token
// and only NOW create the lead in the CRM (double opt-in).
export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()
    const pending = await consumePending(String(token || ''))
    if (!pending) {
      return NextResponse.json({ success: false, error: 'This link is invalid or has expired.' }, { status: 400 })
    }

    const result =
      pending.kind === 'subscribe'
        ? await finalizeSubscribe(pending.payload)
        : await finalizeFormLead(pending.payload)

    // The moment they confirm their email, auto-send the buyer qualification form.
    // The form is the most important step (Jordan works from it) — this makes sure
    // every verified lead receives it immediately, with no manual action. Their
    // answers flow back into the CRM and trigger the AI evaluation.
    const payload = pending.payload as Record<string, any>
    const email = String(payload?.email ?? pending.email ?? '')
    const name = String(payload?.full_name ?? payload?.name ?? email.split('@')[0] ?? 'there')
    if (result?.leadId && email && !/placeholder|no-email/i.test(email)) {
      try {
        await sendProfileReminder(email, name, result.leadId)
        const supabase = createServiceClient()
        const { data: row } = await supabase.from('leads').select('metadata').eq('id', result.leadId).single()
        await supabase
          .from('leads')
          .update({ metadata: { ...((row?.metadata as Record<string, unknown>) ?? {}), form_sent_at: new Date().toISOString() } })
          .eq('id', result.leadId)
        await supabase
          .from('notes')
          .insert({ content: '📨 Buyer form auto-sent on email confirmation', lead_id: result.leadId, author: 'CRM' })
      } catch (e) {
        console.error('[verify] auto-send form', e)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[verify]', err)
    return NextResponse.json({ success: false, error: 'Could not confirm. Please try again.' }, { status: 500 })
  }
}
