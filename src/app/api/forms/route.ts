import { NextRequest, NextResponse } from 'next/server'
import { guardPublic, isValidEmail, isPlaceholderEmail } from '@/lib/antispam'
import { createPending, finalizeFormLead } from '@/lib/intake'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { form_type, ...formData } = body

    if (!form_type || !formData.full_name || !formData.email) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    // Anti-spam: rate limit + honeypot/time-trap + reject malformed/disposable emails.
    const spam = guardPublic(req, body, { requireEmail: true })
    if (spam) return spam

    // Never persist SSN — the real credit/background check is done by a screening service.
    delete (body as Record<string, unknown>).ssn_last4
    delete (formData as Record<string, unknown>).ssn_last4

    const meta = {
      ip: req.headers.get('x-forwarded-for') ?? 'unknown',
      ua: req.headers.get('user-agent') ?? 'unknown',
    }

    // Phone-only popups submit a placeholder email — nothing to verify, so create
    // the lead immediately (the phone is the real contact).
    if (isPlaceholderEmail(formData.email) || !isValidEmail(formData.email)) {
      await finalizeFormLead(body, meta)
      return NextResponse.json({ success: true, verified: true })
    }

    // Real email → double opt-in: hold as pending and email a confirmation link.
    // The lead is created in the CRM only after they confirm.
    const token = await createPending('form', String(formData.email).toLowerCase(), body)
    if (!token) {
      // If the pending store isn't available, fall back to creating the lead directly.
      await finalizeFormLead(body, meta)
      return NextResponse.json({ success: true, verified: true })
    }

    const url = `https://jordanpadierne.com/verify?token=${encodeURIComponent(token)}`
    await sendVerificationEmail(String(formData.email), String(formData.full_name), url)

    return NextResponse.json({ success: true, pending: true })
  } catch (err) {
    console.error('[forms] API error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
