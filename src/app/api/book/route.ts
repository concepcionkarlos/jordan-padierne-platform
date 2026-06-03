import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { sendBookingConfirmation, sendBookingAlert } from '@/lib/email'
import { sendPushToAll } from '@/lib/push'
import { slotToISO, isoToEtParts, formatSlotLabel, SLOT_MINUTES } from '@/lib/schedule'
import type { ClientType } from '@/lib/types'

const TOPIC_TO_TYPE: Record<string, ClientType> = {
  buy: 'Buyer',
  sell: 'Seller',
  invest: 'Investor',
  other: 'Buyer',
}
const TOPIC_LABEL: Record<string, string> = {
  buy: 'Buying a home', sell: 'Selling a home', invest: 'Investing', other: 'General consultation',
}

// Hours already taken on a given ET date (so the UI can grey them out).
export async function GET(req: NextRequest) {
  try {
    const date = new URL(req.url).searchParams.get('date')
    if (!date) return NextResponse.json({ success: false, error: 'date required' }, { status: 400 })

    const supabase = createServiceClient()
    const nowIso = new Date().toISOString()
    const { data } = await supabase
      .from('appointments')
      .select('starts_at, status')
      .eq('type', 'consultation')
      .neq('status', 'cancelled')
      .gte('starts_at', nowIso)
      .limit(500)

    const taken = (data ?? [])
      .map((a) => isoToEtParts(a.starts_at))
      .filter((p) => p.date === date)
      .map((p) => p.hour)

    return NextResponse.json({ success: true, taken })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServiceClient()
    const body = await req.json()
    const { full_name, email, phone, date, hour, topic, message } = body

    if (!full_name || !email || !date || hour == null) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const startsAt = slotToISO(date, Number(hour))

    // Double-booking guard: re-check this slot is still free.
    const { data: existing } = await supabase
      .from('appointments')
      .select('starts_at, status')
      .eq('type', 'consultation')
      .neq('status', 'cancelled')
      .gte('starts_at', new Date().toISOString())
      .limit(500)
    const clash = (existing ?? []).some((a) => a.starts_at === startsAt)
    if (clash) {
      return NextResponse.json({ success: false, error: 'taken' }, { status: 409 })
    }

    const endsAt = new Date(new Date(startsAt).getTime() + SLOT_MINUTES * 60000).toISOString()
    const topicLabel = TOPIC_LABEL[topic] ?? TOPIC_LABEL.other
    const whenLabel = formatSlotLabel(startsAt)

    // 1. Create the lead — a booked call is strong intent. Skip drip (real meeting set).
    const { data: lead } = await supabase
      .from('leads')
      .insert({
        full_name, email, phone: phone ?? '',
        client_type: TOPIC_TO_TYPE[topic] ?? 'Buyer',
        source: 'Website',
        status: 'new',
        pipeline_stage: 'SHOWING_SCHEDULED',
        message: message ?? null,
        hot_score: 3,
        tags: ['hot'],
        metadata: { booked_consultation: startsAt, topic: topicLabel, drip_stopped: true },
      })
      .select('id')
      .single()

    // 2. Create the appointment
    await supabase.from('appointments').insert({
      lead_id: lead?.id ?? null,
      title: `Consultation — ${full_name}`,
      type: 'consultation',
      starts_at: startsAt,
      ends_at: endsAt,
      location: 'Phone / Video call',
      notes: `${topicLabel}${message ? ` — ${message}` : ''}`,
      status: 'scheduled',
    })

    // 3. Log a CRM message
    await supabase.from('messages').insert({
      type: 'contact',
      full_name, email, phone: phone ?? null,
      subject: `📅 Consultation booked — ${whenLabel}`,
      body: `Topic: ${topicLabel}\nWhen: ${whenLabel}${message ? `\n\nMessage: ${message}` : ''}`,
      status: 'unread',
      lead_id: lead?.id ?? null,
      metadata: body,
    })

    // 4. Instant push to Jordan
    sendPushToAll({
      title: `📅 Consultation booked: ${full_name}`,
      body: `${whenLabel} · ${topicLabel}${phone ? ` · ${phone}` : ''}`,
      url: lead?.id ? `/admin/leads/${lead.id}` : '/admin/calendar',
      tag: `booking-${lead?.id ?? 'new'}`,
    }).catch(() => {})

    // 5. Emails (non-blocking)
    await Promise.allSettled([
      sendBookingConfirmation(email, full_name, whenLabel, topicLabel),
      sendBookingAlert({ full_name, email, phone, whenLabel, topic: topicLabel, message, lead_id: lead?.id }),
    ])

    return NextResponse.json({ success: true, when: whenLabel, lead_id: lead?.id })
  } catch (err) {
    console.error('[book] error', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
