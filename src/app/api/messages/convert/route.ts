import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { requireUser } from '@/lib/auth'
import { buildLeadDraftFromMessage } from '@/lib/message-convert'

// Convert/link a message to a lead. If a lead with the same email already exists,
// link to it (no duplicate); otherwise create a new lead from the message. Marks
// the message handled and returns the lead id so the UI can deep-link.
export async function POST(req: NextRequest) {
  const denied = await requireUser(); if (denied) return denied
  try {
    const supabase = createServiceClient()
    const { message_id } = await req.json()
    if (!message_id) return NextResponse.json({ success: false, error: 'message_id required' }, { status: 400 })

    const { data: msg } = await supabase.from('messages').select('*').eq('id', message_id).single()
    if (!msg) return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 })

    // Already linked → just hand back the lead.
    if (msg.lead_id) return NextResponse.json({ success: true, lead_id: msg.lead_id, already: true })

    // Reuse an existing lead with the same real email (dedup) before creating one.
    let leadId: string | null = null
    let linked = false
    if (msg.email && !/placeholder|no-email/i.test(msg.email)) {
      const { data: existing } = await supabase.from('leads').select('id').eq('email', msg.email).limit(1)
      if (existing && existing.length > 0) { leadId = existing[0].id; linked = true }
    }

    if (!leadId) {
      const { data: created, error } = await supabase
        .from('leads')
        .insert(buildLeadDraftFromMessage(msg))
        .select('id')
        .single()
      if (error) throw error
      leadId = created.id
    }

    await supabase.from('messages').update({ lead_id: leadId, status: 'handled' }).eq('id', message_id)

    return NextResponse.json({ success: true, lead_id: leadId, linked })
  } catch (err) {
    console.error('[messages/convert]', err)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}
