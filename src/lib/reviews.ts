import { createServiceClient } from '@/lib/supabase'
import { getSetting } from '@/lib/settings'
import { sendReviewRequest } from '@/lib/email'

// Where to send the happy client. Priority: CRM setting → env var → none.
// If nothing is configured we skip sending rather than send a broken link.
export async function getReviewUrl(): Promise<string | null> {
  const fromSetting = await getSetting('google_review_url')
  if (fromSetting && fromSetting.startsWith('http')) return fromSetting
  const fromEnv = process.env.GOOGLE_REVIEW_URL
  if (fromEnv && fromEnv.startsWith('http')) return fromEnv
  return null
}

// Fire-and-forget: when a deal closes, ask the client for a Google review — once.
// Safe to call on every "moved to CLOSED" event; it self-guards against repeats.
export async function requestReviewForLead(leadId: string): Promise<void> {
  try {
    const supabase = createServiceClient()
    const { data: lead } = await supabase
      .from('leads')
      .select('id, full_name, email, metadata')
      .eq('id', leadId)
      .single()

    if (!lead) return
    const meta = (lead.metadata ?? {}) as Record<string, unknown>
    if (meta.review_requested_at) return // already asked
    if (!lead.email || lead.email.includes('placeholder') || lead.email.includes('example')) return

    const url = await getReviewUrl()
    if (!url) return // no link configured yet — skip silently

    const ok = await sendReviewRequest(lead.email, lead.full_name, url)
    if (ok) {
      await supabase.from('leads').update({
        metadata: { ...meta, review_requested_at: new Date().toISOString() },
      }).eq('id', leadId)
    }
  } catch (err) {
    console.error('[reviews] requestReviewForLead', err)
  }
}
