import { NextResponse } from 'next/server'
import { sendEmail, getEmailProvider, isEmailConfigured } from '@/lib/email'
import { requireUser } from '@/lib/auth'

// Sends a branded test email to the admin inbox so Jordan can confirm, at a
// glance, that email is connected and going out from the right address.
// Fixed recipient (admin inbox) — no arbitrary "to", so it can't be abused to spam.
export async function POST() {
  const denied = await requireUser(); if (denied) return denied
  if (!isEmailConfigured()) {
    return NextResponse.json({ success: false, error: 'Email not configured' }, { status: 400 })
  }

  const to = process.env.ADMIN_NOTIFICATION_EMAIL || 'info@jordanpadierne.com'
  const from = process.env.SMTP_FROM || 'info@jordanpadierne.com'

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F4F7FA;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td>
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto">
  <tr><td style="background:#0A1628;padding:24px;border-radius:12px 12px 0 0;text-align:center">
    <p style="margin:0;font-size:20px;font-weight:700;color:#fff;font-family:Georgia,serif">Jordan Padierne</p>
    <p style="margin:5px 0 0;font-size:10px;color:#7BA7C2;text-transform:uppercase;letter-spacing:1.5px">CRM · Email Test</p>
  </td></tr>
  <tr><td style="background:#fff;padding:30px 26px;border-radius:0 0 12px 12px;text-align:center">
    <p style="font-size:30px;margin:0 0 10px">✅</p>
    <h2 style="margin:0 0 8px;font-size:19px;color:#0A1628;font-family:Georgia,serif">Email is working!</h2>
    <p style="margin:0;font-size:14px;color:#64748B;line-height:1.7">If you're reading this, your CRM can send email and it's going out from <strong style="color:#0A1628">${from}</strong>.</p>
  </td></tr>
</table></td></tr></table></body></html>`

  const ok = await sendEmail(to, '✅ CRM email test — Jordan Padierne', html)
  return NextResponse.json({ success: ok, provider: getEmailProvider(), from, to })
}
