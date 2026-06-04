import nodemailer from 'nodemailer'
import { Resend } from 'resend'

// ─── Provider Detection ───────────────────────────────────────────────────────

type Provider = 'resend' | 'smtp' | 'none'

function getProvider(): Provider {
  if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('your-')) return 'resend'
  if (process.env.SMTP_USER && process.env.SMTP_PASSWORD && !process.env.SMTP_PASSWORD.includes('your-')) return 'smtp'
  return 'none'
}

export function isEmailConfigured(): boolean {
  return getProvider() !== 'none'
}

export function getEmailProvider(): Provider {
  return getProvider()
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LeadEmailData {
  full_name: string
  email: string
  phone?: string
  client_type?: string
  preferred_area?: string
  budget?: string
  timeline?: string
  financing_status?: string
  source?: string
  message?: string
  form_type: string
  lead_id?: string
}

// ─── HTML Templates ───────────────────────────────────────────────────────────

function buildAdminHtml(data: LeadEmailData): string {
  const adminDashUrl = `https://jordan-padierne-platform.vercel.app/admin/leads${data.lead_id ? `/${data.lead_id}` : ''}`

  const formLabels: Record<string, string> = {
    contact: 'General Contact Form',
    buyer_qualification: 'Buyer Qualification',
    investor_inquiry: 'Investor Inquiry',
    pre_construction_interest: 'Pre-Construction Interest',
    showing_request: 'Showing Request',
    open_house: 'Open House Check-In',
  }

  const rows = [
    { label: 'Email', value: `<a href="mailto:${data.email}" style="color:#1A3A6B">${data.email}</a>` },
    { label: 'Phone', value: data.phone ? `<a href="tel:${data.phone}" style="color:#1A3A6B">${data.phone}</a>` : null },
    { label: 'Client Type', value: data.client_type },
    { label: 'Area', value: data.preferred_area },
    { label: 'Budget', value: data.budget },
    { label: 'Timeline', value: data.timeline },
    { label: 'Financing', value: data.financing_status },
    { label: 'Source', value: data.source },
  ].filter((r) => r.value)

  const tableRows = rows.map((r) => `
    <tr>
      <td style="padding:10px 16px;background:#F4F7FA;font-size:12px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:.5px;white-space:nowrap;width:130px">${r.label}</td>
      <td style="padding:10px 16px;font-size:14px;color:#0A1628;background:#fff">${r.value}</td>
    </tr>`).join('')

  const msgSection = data.message
    ? `<div style="margin:20px 0;padding:16px 20px;background:#F4F7FA;border-left:4px solid #7BA7C2;border-radius:0 8px 8px 0">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:.5px">Message</p>
        <p style="margin:0;font-size:14px;color:#0A1628;line-height:1.7;white-space:pre-wrap">${data.message}</p>
       </div>`
    : ''

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F7FA;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7FA;padding:32px 16px"><tr><td>
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;margin:0 auto">
  <tr><td style="background:#0A1628;padding:24px 28px;border-radius:12px 12px 0 0">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><p style="margin:0;font-size:18px;font-weight:700;color:#fff;font-family:Georgia,serif">Jordan Padierne</p>
          <p style="margin:2px 0 0;font-size:10px;color:#7BA7C2;text-transform:uppercase;letter-spacing:1px">Real Estate · eXp Realty</p></td>
      <td style="text-align:right"><span style="background:#8B1A2F;color:#fff;font-size:11px;font-weight:700;padding:5px 12px;border-radius:20px;text-transform:uppercase;letter-spacing:.5px">New Lead</span></td>
    </tr></table>
  </td></tr>
  <tr><td style="background:#1A3A6B;padding:12px 28px">
    <p style="margin:0;font-size:12px;color:#B8D4E8">📋 <strong style="color:#fff">${formLabels[data.form_type] ?? data.form_type}</strong></p>
  </td></tr>
  <tr><td style="background:#fff;padding:24px 28px;border-radius:0 0 12px 12px">
    <h2 style="margin:0 0 16px;font-size:20px;color:#0A1628;font-family:Georgia,serif">${data.full_name}</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid #E2E8F0">${tableRows}</table>
    ${msgSection}
    <div style="margin-top:24px;text-align:center">
      <a href="${adminDashUrl}" style="display:inline-block;background:#0A1628;color:#fff;padding:13px 28px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none">View in Admin Dashboard →</a>
    </div>
    <p style="margin:20px 0 0;padding-top:16px;border-top:1px solid #E2E8F0;font-size:11px;color:#94A3B8;text-align:center">
      Jordan Padierne · eXp Realty · License SL3641062 · <a href="tel:+13057996973" style="color:#7BA7C2">305-799-6973</a>
    </p>
  </td></tr>
</table></td></tr></table></body></html>`
}

function buildClientHtml(clientName: string, formType: string, leadId?: string): string {
  const msgs: Record<string, string> = {
    contact: 'Your message has been received. Jordan will get back to you shortly.',
    buyer_qualification: 'Your buyer profile has been received. Jordan will review your details and reach out to discuss your home search.',
    investor_inquiry: 'Your investment inquiry has been received. Jordan will prepare personalized opportunities matching your goals.',
    pre_construction_interest: 'Your interest has been registered. Jordan will send you exclusive project details soon.',
    showing_request: 'Your showing request has been received. Jordan will confirm your appointment shortly.',
    open_house: 'Thank you for visiting! Jordan has your information and will follow up soon.',
    rental_application: 'Your rental application has been received. Jordan will review it and reach out shortly about next steps, including the secure background & credit check.',
  }

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F7FA;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7FA;padding:32px 16px"><tr><td>
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto">
  <tr><td style="background:#0A1628;padding:28px;border-radius:12px 12px 0 0;text-align:center">
    <p style="margin:0;font-size:22px;font-weight:700;color:#fff;font-family:Georgia,serif">Jordan Padierne</p>
    <p style="margin:6px 0 0;font-size:10px;color:#7BA7C2;text-transform:uppercase;letter-spacing:1.5px">Realtor · eXp Realty · South Florida</p>
  </td></tr>
  <tr><td style="background:#fff;padding:32px 28px;border-radius:0 0 12px 12px;text-align:center">
    <p style="font-size:32px;margin:0 0 12px">✉️</p>
    <h2 style="margin:0 0 8px;font-size:20px;color:#0A1628;font-family:Georgia,serif">Thank you, ${clientName}!</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#64748B;line-height:1.7">${msgs[formType] ?? msgs.contact}</p>
    ${leadId ? `
    <div style="background:linear-gradient(135deg,#0A1628,#1A3A6B);border-radius:12px;padding:22px;margin-bottom:24px">
      <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#fff">Help Jordan help you faster ⚡</p>
      <p style="margin:0 0 16px;font-size:13px;color:#B8D4E8;line-height:1.6">Take 60 seconds to tell us exactly what you're looking for. Jordan will match you with the right opportunities before your first call.</p>
      <a href="https://jordanpadierne.com/qualify/${leadId}" style="display:inline-block;background:#8B1A2F;color:#fff;padding:13px 28px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none">Complete My Profile →</a>
    </div>` : ''}
    <div style="background:#F4F7FA;border-radius:10px;padding:18px;margin-bottom:24px;text-align:left">
      <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:.5px">Contact Jordan directly</p>
      <p style="margin:0 0 6px;font-size:14px;color:#0A1628">📞 <a href="tel:+13057996973" style="color:#1A3A6B;font-weight:600">305-799-6973</a></p>
      <p style="margin:0 0 6px;font-size:14px;color:#0A1628">✉️ <a href="mailto:info@jordanpadierne.com" style="color:#1A3A6B;font-weight:600">info@jordanpadierne.com</a></p>
      <p style="margin:0;font-size:14px;color:#0A1628">💬 <a href="https://wa.me/13057996973" style="color:#1A3A6B;font-weight:600">WhatsApp</a></p>
    </div>
    <p style="margin:0;font-size:11px;color:#CBD5E1">License SL3641062 · eXp Realty · Florida · English / Español</p>
  </td></tr>
</table></td></tr></table></body></html>`
}

// ─── Send via Resend ──────────────────────────────────────────────────────────

async function sendViaResend(
  to: string | string[],
  subject: string,
  html: string,
  replyTo?: string
): Promise<boolean> {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const from = process.env.SMTP_FROM || 'info@jordanpadierne.com'

  const { error } = await resend.emails.send({
    from: `Jordan Padierne CRM <${from}>`,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    replyTo,
  })

  if (error) {
    console.error('[email/resend]', error)
    return false
  }
  return true
}

// ─── Send via SMTP ────────────────────────────────────────────────────────────

async function sendViaSMTP(
  to: string | string[],
  subject: string,
  html: string,
  replyTo?: string
): Promise<boolean> {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })

  // Always present as the brand inbox (info@), regardless of which mailbox
  // authenticates the SMTP connection. Override with SMTP_FROM if ever needed.
  const fromAddress = process.env.SMTP_FROM || 'info@jordanpadierne.com'

  await transporter.sendMail({
    from: `"Jordan Padierne" <${fromAddress}>`,
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    html,
    replyTo: replyTo || fromAddress,
  })
  return true
}

// ─── Public API ───────────────────────────────────────────────────────────────

async function send(
  to: string | string[],
  subject: string,
  html: string,
  replyTo?: string
): Promise<boolean> {
  const provider = getProvider()
  if (provider === 'none') return false
  try {
    return provider === 'resend'
      ? await sendViaResend(to, subject, html, replyTo)
      : await sendViaSMTP(to, subject, html, replyTo)
  } catch (err) {
    console.error(`[email/${provider}]`, err)
    return false
  }
}

// Generic branded sender for nurture/drip emails built elsewhere (see lib/drip).
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  replyTo: string = 'info@jordanpadierne.com'
): Promise<boolean> {
  return send(to, subject, html, replyTo)
}

export async function sendAdminNotification(data: LeadEmailData): Promise<boolean> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'info@jordanpadierne.com'
  const supportEmail = process.env.SUPPORT_NOTIFICATION_EMAIL

  const to = supportEmail ? [adminEmail, supportEmail] : adminEmail
  const html = buildAdminHtml(data)
  const subject = `🏠 New Lead: ${data.full_name} — Jordan Padierne Realtor`

  return send(to, subject, html, data.email)
}

export async function sendClientAutoReply(
  clientEmail: string,
  clientName: string,
  formType: string,
  leadId?: string
): Promise<boolean> {
  // Only show the profile questionnaire CTA for general first-touch forms,
  // not for forms that already collected detailed info.
  const showProfileCta = formType === 'contact' || formType === 'showing_request' || formType === 'open_house'
  const html = buildClientHtml(clientName, formType, showProfileCta ? leadId : undefined)
  const subject = 'Thank you for contacting Jordan Padierne — eXp Realty'

  return send(clientEmail, subject, html, 'info@jordanpadierne.com')
}

// ─── Jordan's alert when a lead completes their qualification profile ───
export async function sendQualificationAlert(data: {
  full_name: string; email: string; phone: string | null
  temperature: string; summary: string; tasks: string[]; lead_id: string
}): Promise<boolean> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'info@jordanpadierne.com'
  const tempColor = data.temperature === 'Hot' ? '#8B1A2F' : data.temperature === 'Warm' ? '#D97706' : '#46779A'
  const tempEmoji = data.temperature === 'Hot' ? '🔥' : data.temperature === 'Warm' ? '🌤️' : '❄️'
  const dashUrl = `https://jordan-padierne-platform.vercel.app/admin/leads/${data.lead_id}`

  const taskList = data.tasks.map((t) => `<li style="margin:0 0 6px;font-size:14px;color:#0A1628">${t}</li>`).join('')

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F4F7FA;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td>
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;margin:0 auto">
  <tr><td style="background:${tempColor};padding:22px 28px;border-radius:12px 12px 0 0">
    <p style="margin:0;font-size:12px;color:#fff;opacity:.8;text-transform:uppercase;letter-spacing:1px">Lead Qualified · Auto-Evaluated</p>
    <p style="margin:4px 0 0;font-size:22px;font-weight:700;color:#fff;font-family:Georgia,serif">${tempEmoji} ${data.full_name} — ${data.temperature} Lead</p>
  </td></tr>
  <tr><td style="background:#fff;padding:24px 28px;border-radius:0 0 12px 12px">
    <p style="margin:0 0 6px;font-size:13px;color:#64748B"><a href="tel:${data.phone}" style="color:#1A3A6B">${data.phone ?? ''}</a> · <a href="mailto:${data.email}" style="color:#1A3A6B">${data.email}</a></p>
    <div style="background:#F4F7FA;border-left:4px solid ${tempColor};border-radius:0 8px 8px 0;padding:14px 18px;margin:16px 0">
      <pre style="margin:0;font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#0A1628;line-height:1.7;white-space:pre-wrap">${data.summary}</pre>
    </div>
    <p style="margin:20px 0 8px;font-size:12px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:.5px">Your tasks (already added to the CRM)</p>
    <ul style="margin:0 0 20px;padding-left:20px">${taskList}</ul>
    <div style="text-align:center">
      <a href="${dashUrl}" style="display:inline-block;background:#0A1628;color:#fff;padding:13px 28px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none">Open in CRM →</a>
    </div>
  </td></tr>
</table></td></tr></table></body></html>`

  return send(adminEmail, `${tempEmoji} ${data.full_name} qualified as a ${data.temperature} lead`, html)
}

// ─── Consultation booking: confirmation to client + alert to Jordan ───
export async function sendBookingConfirmation(
  clientEmail: string, clientName: string, whenLabel: string, topic: string
): Promise<boolean> {
  const first = (clientName || '').trim().split(' ')[0] || 'there'
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F7FA;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7FA;padding:32px 16px"><tr><td>
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto">
  <tr><td style="background:#0A1628;padding:28px;border-radius:12px 12px 0 0;text-align:center">
    <p style="margin:0;font-size:22px;font-weight:700;color:#fff;font-family:Georgia,serif">Jordan Padierne</p>
    <p style="margin:6px 0 0;font-size:10px;color:#7BA7C2;text-transform:uppercase;letter-spacing:1.5px">Realtor · eXp Realty · South Florida</p>
  </td></tr>
  <tr><td style="background:#fff;padding:32px 28px;border-radius:0 0 12px 12px;text-align:center">
    <p style="font-size:32px;margin:0 0 10px">📅</p>
    <h2 style="margin:0 0 8px;font-size:21px;color:#0A1628;font-family:Georgia,serif">You're confirmed, ${first}!</h2>
    <p style="margin:0 0 22px;font-size:15px;color:#64748B;line-height:1.7">Your consultation with Jordan is booked. He'll call you at the time below.</p>
    <div style="background:linear-gradient(135deg,#0A1628,#1A3A6B);border-radius:12px;padding:22px;margin-bottom:22px">
      <p style="margin:0 0 4px;font-size:11px;color:#7BA7C2;text-transform:uppercase;letter-spacing:1px">Your appointment</p>
      <p style="margin:0;font-size:19px;font-weight:700;color:#fff">${whenLabel}</p>
      <p style="margin:8px 0 0;font-size:13px;color:#B8D4E8">Topic: ${topic}</p>
    </div>
    <div style="background:#F4F7FA;border-radius:10px;padding:16px;text-align:left">
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:.5px">Need to reschedule?</p>
      <p style="margin:0;font-size:14px;color:#0A1628">Just reply to this email or call <a href="tel:+13057996973" style="color:#1A3A6B;font-weight:600">305-799-6973</a>.</p>
    </div>
    <p style="margin:22px 0 0;font-size:11px;color:#CBD5E1">eXp Realty · License SL3641062 · English / Español</p>
  </td></tr>
</table></td></tr></table></body></html>`
  return send(clientEmail, `Confirmed: your consultation with Jordan — ${whenLabel}`, html, 'info@jordanpadierne.com')
}

export async function sendBookingAlert(data: {
  full_name: string; email: string; phone?: string; whenLabel: string; topic: string; message?: string; lead_id?: string
}): Promise<boolean> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'info@jordanpadierne.com'
  const dashUrl = `https://jordan-padierne-platform.vercel.app/admin/leads${data.lead_id ? `/${data.lead_id}` : ''}`
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F4F7FA;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td>
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto">
  <tr><td style="background:#8B1A2F;padding:22px 28px;border-radius:12px 12px 0 0">
    <p style="margin:0;font-size:12px;color:#fff;opacity:.85;text-transform:uppercase;letter-spacing:1px">📅 Consultation Booked</p>
    <p style="margin:4px 0 0;font-size:22px;font-weight:700;color:#fff;font-family:Georgia,serif">${data.full_name}</p>
  </td></tr>
  <tr><td style="background:#fff;padding:24px 28px;border-radius:0 0 12px 12px">
    <p style="margin:0 0 14px;font-size:18px;font-weight:700;color:#0A1628">${data.whenLabel}</p>
    <p style="margin:0 0 6px;font-size:14px;color:#475569"><strong>Topic:</strong> ${data.topic}</p>
    <p style="margin:0 0 6px;font-size:14px;color:#475569"><strong>Phone:</strong> <a href="tel:${data.phone ?? ''}" style="color:#1A3A6B">${data.phone ?? '—'}</a></p>
    <p style="margin:0 0 6px;font-size:14px;color:#475569"><strong>Email:</strong> <a href="mailto:${data.email}" style="color:#1A3A6B">${data.email}</a></p>
    ${data.message ? `<div style="margin:14px 0;padding:12px 16px;background:#F4F7FA;border-left:4px solid #7BA7C2;border-radius:0 8px 8px 0;font-size:14px;color:#0A1628;white-space:pre-wrap">${data.message}</div>` : ''}
    <div style="margin-top:20px;text-align:center">
      <a href="${dashUrl}" style="display:inline-block;background:#0A1628;color:#fff;padding:12px 26px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none">Open in CRM →</a>
    </div>
  </td></tr>
</table></td></tr></table></body></html>`
  return send(adminEmail, `📅 ${data.full_name} booked a consultation — ${data.whenLabel}`, html, data.email)
}

// ─── Google review request after a closing ───
export async function sendReviewRequest(
  clientEmail: string,
  clientName: string,
  reviewUrl: string
): Promise<boolean> {
  const first = (clientName || '').trim().split(' ')[0] || 'there'
  const stars = '⭐️⭐️⭐️⭐️⭐️'
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F7FA;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7FA;padding:32px 16px"><tr><td>
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto">
  <tr><td style="background:#0A1628;padding:28px;border-radius:12px 12px 0 0;text-align:center">
    <p style="margin:0;font-size:22px;font-weight:700;color:#fff;font-family:Georgia,serif">Jordan Padierne</p>
    <p style="margin:6px 0 0;font-size:10px;color:#7BA7C2;text-transform:uppercase;letter-spacing:1.5px">Realtor · eXp Realty · South Florida</p>
  </td></tr>
  <tr><td style="background:#fff;padding:34px 28px;border-radius:0 0 12px 12px;text-align:center">
    <p style="font-size:30px;margin:0 0 6px;letter-spacing:2px">${stars}</p>
    <h2 style="margin:0 0 12px;font-size:22px;color:#0A1628;font-family:Georgia,serif">Thank you, ${first}!</h2>
    <p style="margin:0 0 22px;font-size:15px;color:#475569;line-height:1.75">It was a true pleasure helping you. If you were happy with the experience, a quick Google review would mean the world to me — and it helps other families find someone they can trust. It only takes a minute.</p>
    <div style="margin:0 0 24px">
      <a href="${reviewUrl}" style="display:inline-block;background:#8B1A2F;color:#fff;padding:14px 34px;border-radius:8px;font-size:15px;font-weight:700;text-decoration:none">Leave a Google Review ${stars}</a>
    </div>
    <p style="margin:0;font-size:13px;color:#94A3B8;line-height:1.7">Thank you for trusting me with one of life's biggest decisions.<br>— Jordan</p>
    <p style="margin:18px 0 0;padding-top:16px;border-top:1px solid #E2E8F0;font-size:11px;color:#CBD5E1">
      Questions anytime? <a href="tel:+13057996973" style="color:#7BA7C2;font-weight:600">305-799-6973</a> · eXp Realty · License SL3641062
    </p>
  </td></tr>
</table></td></tr></table></body></html>`

  return send(clientEmail, `${first}, how did I do? ${stars}`, html, 'info@jordanpadierne.com')
}

// ─── Reminder to a client who hasn't completed their profile yet ───
export async function sendProfileReminder(clientEmail: string, clientName: string, leadId: string): Promise<boolean> {
  const first = (clientName || '').trim().split(' ')[0] || 'there'
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F4F7FA;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td>
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto">
  <tr><td style="background:#0A1628;padding:28px;border-radius:12px 12px 0 0;text-align:center">
    <p style="margin:0;font-size:22px;font-weight:700;color:#fff;font-family:Georgia,serif">Jordan Padierne</p>
    <p style="margin:6px 0 0;font-size:10px;color:#7BA7C2;text-transform:uppercase;letter-spacing:1.5px">Realtor · eXp Realty · South Florida</p>
  </td></tr>
  <tr><td style="background:#fff;padding:32px 28px;border-radius:0 0 12px 12px;text-align:center">
    <p style="font-size:32px;margin:0 0 12px">👋</p>
    <h2 style="margin:0 0 8px;font-size:20px;color:#0A1628;font-family:Georgia,serif">Still looking, ${first}?</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#64748B;line-height:1.7">Jordan noticed you haven't finished your profile yet. It takes just 60 seconds and helps him match you with the right opportunities before your first call.</p>
    <a href="https://jordanpadierne.com/qualify/${leadId}" style="display:inline-block;background:#8B1A2F;color:#fff;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:700;text-decoration:none">Complete My Profile →</a>
    <p style="margin:24px 0 0;font-size:13px;color:#94A3B8">Prefer to talk? Call or text Jordan at <a href="tel:+13057996973" style="color:#1A3A6B;font-weight:600">305-799-6973</a></p>
  </td></tr>
</table></td></tr></table></body></html>`

  return send(clientEmail, `${first}, complete your profile — Jordan Padierne Realtor`, html, 'info@jordanpadierne.com')
}
