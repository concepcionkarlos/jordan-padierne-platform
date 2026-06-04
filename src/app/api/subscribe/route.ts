import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { sendPushToAll } from '@/lib/push'

// Lead capture from Insights articles:
//  - type 'guide'      → lead magnet (name + email), warm lead + instant push
//  - type 'newsletter' → email only, cold lead tagged 'newsletter'
export async function POST(req: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { type, email, full_name, source_article } = await req.json()

    if (!email || !/^\S+@\S+\.\S+$/.test(String(email))) {
      return NextResponse.json({ success: false, error: 'Valid email required' }, { status: 400 })
    }

    const isGuide = type === 'guide'
    const source = isGuide ? 'Guide Download' : 'Newsletter'
    const name = (full_name && String(full_name).trim()) || String(email).split('@')[0]

    // Light dedupe: don't create a second identical lead for the same email+source.
    const { data: existing } = await supabase
      .from('leads').select('id').eq('email', email).eq('source', source).limit(1)
    if (existing && existing.length) {
      return NextResponse.json({ success: true, deduped: true })
    }

    const { data: lead } = await supabase
      .from('leads')
      .insert({
        full_name: name,
        email,
        phone: '',
        client_type: 'Buyer',
        source,
        status: 'new',
        pipeline_stage: 'NEW',
        hot_score: isGuide ? 2 : 1,
        tags: isGuide ? ['hot', 'newsletter'] : ['newsletter'],
        metadata: { type: source, source_article: source_article ?? null },
      })
      .select('id')
      .single()

    // Log a CRM message so it surfaces in the inbox
    await supabase.from('messages').insert({
      type: 'contact',
      full_name: name,
      email,
      subject: isGuide ? `📘 Guide download — ${name}` : `📩 Newsletter signup — ${email}`,
      body: isGuide
        ? `Requested the buyer/seller guide${source_article ? ` from article: ${source_article}` : ''}.`
        : `Subscribed to the newsletter${source_article ? ` from article: ${source_article}` : ''}.`,
      status: 'unread',
      lead_id: lead?.id ?? null,
    })

    // Instant push only for the warmer lead-magnet capture
    if (isGuide) {
      sendPushToAll({
        title: `📘 Guide download: ${name}`,
        body: `${email} — wants the guide. Tap to follow up.`,
        url: lead?.id ? `/admin/leads/${lead.id}` : '/admin/leads',
        tag: `guide-${lead?.id ?? 'new'}`,
      }).catch(() => {})
    }

    return NextResponse.json({ success: true, lead_id: lead?.id })
  } catch (err) {
    console.error('[subscribe] error', err)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}
