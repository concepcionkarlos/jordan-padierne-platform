import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { guardPublic } from '@/lib/antispam'
import { createPending } from '@/lib/intake'
import { sendVerificationEmail } from '@/lib/email'

// Newsletter / lead-magnet signups — double opt-in: the lead is only added to
// the CRM after the person confirms their email.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, email, full_name } = body

    const spam = guardPublic(req, body, { requireEmail: true })
    if (spam) return spam

    const isGuide = type === 'guide'
    const source = isGuide ? 'Guide Download' : 'Newsletter'
    const name = (full_name && String(full_name).trim()) || String(email).split('@')[0]

    // Already a confirmed subscriber? Don't re-send.
    const supabase = createServiceClient()
    const { data: existing } = await supabase
      .from('leads').select('id').eq('email', String(email).toLowerCase()).eq('source', source).limit(1)
    if (existing && existing.length) {
      return NextResponse.json({ success: true, deduped: true })
    }

    const token = await createPending('subscribe', String(email).toLowerCase(), body)
    if (!token) {
      return NextResponse.json({ success: false, error: 'Could not process. Please try again.' }, { status: 500 })
    }

    const url = `https://jordanpadierne.com/verify?token=${encodeURIComponent(token)}`
    await sendVerificationEmail(String(email), name, url)

    return NextResponse.json({ success: true, pending: true })
  } catch (err) {
    console.error('[subscribe] error', err)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}
