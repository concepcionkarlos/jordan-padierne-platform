import nodemailer from 'nodemailer'

// ─── Configuration ────────────────────────────────────────────────────────────

export function isEmailConfigured(): boolean {
  return !!(
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD &&
    !process.env.SMTP_USER.includes('your-email')
  )
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // STARTTLS on port 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: true,
    },
  })
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

// ─── Email: Admin Notification ─────────────────────────────────────────────

export async function sendAdminNotification(data: LeadEmailData): Promise<boolean> {
  if (!isEmailConfigured()) return false

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'info@jordanpadierne.com'
  const supportEmail = process.env.SUPPORT_NOTIFICATION_EMAIL || ''
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jordanpadierne.com'

  const formLabels: Record<string, string> = {
    contact: 'General Contact Form',
    buyer_qualification: 'Buyer Qualification Form',
    investor_inquiry: 'Investor Inquiry',
    pre_construction_interest: 'Pre-Construction Interest',
    showing_request: 'Showing Request',
    open_house: 'Open House Check-In',
  }

  const formLabel = formLabels[data.form_type] ?? data.form_type

  const rows = [
    { label: 'Full Name', value: data.full_name },
    { label: 'Email', value: `<a href="mailto:${data.email}" style="color:#1A3A6B">${data.email}</a>` },
    { label: 'Phone', value: data.phone ? `<a href="tel:${data.phone}" style="color:#1A3A6B">${data.phone}</a>` : null },
    { label: 'Client Type', value: data.client_type },
    { label: 'Preferred Area', value: data.preferred_area },
    { label: 'Budget', value: data.budget },
    { label: 'Timeline', value: data.timeline },
    { label: 'Financing', value: data.financing_status },
    { label: 'Source', value: data.source },
  ].filter((r) => r.value)

  const tableRows = rows.map((r) => `
    <tr>
      <td style="padding:10px 16px;background:#F4F7FA;font-size:12px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap;width:140px">
        ${r.label}
      </td>
      <td style="padding:10px 16px;font-size:14px;color:#0A1628;background:#fff">
        ${r.value}
      </td>
    </tr>
  `).join('')

  const messageSection = data.message ? `
    <div style="margin-top:24px;padding:20px;background:#F4F7FA;border-left:4px solid #7BA7C2;border-radius:0 8px 8px 0">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:0.5px">Message</p>
      <p style="margin:0;font-size:14px;color:#0A1628;line-height:1.7;white-space:pre-wrap">${data.message}</p>
    </div>
  ` : ''

  const dashboardUrl = `${siteUrl.replace('https://jordanpadierne.com', 'https://jordan-padierne-platform.vercel.app')}/admin/leads${data.lead_id ? `/${data.lead_id}` : ''}`

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F7FA;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7FA;padding:40px 20px">
    <tr><td>
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto">

        <!-- Header -->
        <tr>
          <td style="background:#0A1628;padding:28px 32px;border-radius:12px 12px 0 0">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0;font-size:20px;font-weight:700;color:#fff;font-family:Georgia,serif">Jordan Padierne</p>
                  <p style="margin:4px 0 0;font-size:11px;color:#7BA7C2;text-transform:uppercase;letter-spacing:1px">Real Estate · eXp Realty</p>
                </td>
                <td style="text-align:right">
                  <span style="display:inline-block;background:#8B1A2F;color:#fff;font-size:11px;font-weight:700;padding:5px 12px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px">
                    New Lead
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Subheader -->
        <tr>
          <td style="background:#1A3A6B;padding:14px 32px">
            <p style="margin:0;font-size:13px;color:#B8D4E8">
              📋 <strong style="color:#fff">${formLabel}</strong>
              &nbsp;·&nbsp; Received now
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#fff;padding:28px 32px;border-radius:0 0 12px 12px">

            <h2 style="margin:0 0 20px;font-size:22px;color:#0A1628;font-family:Georgia,serif">
              ${data.full_name}
            </h2>

            <!-- Info table -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid #E2E8F0">
              ${tableRows}
            </table>

            ${messageSection}

            <!-- CTA -->
            <div style="margin-top:28px;text-align:center">
              <a href="${dashboardUrl}"
                style="display:inline-block;background:#0A1628;color:#fff;padding:14px 32px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.3px">
                View in Admin Dashboard →
              </a>
            </div>

            <p style="margin:24px 0 0;padding-top:20px;border-top:1px solid #E2E8F0;font-size:11px;color:#94A3B8;text-align:center">
              Jordan Padierne · eXp Realty · License SL3641062<br>
              Miami-Dade County, Florida · <a href="tel:+13057996973" style="color:#7BA7C2">305-799-6973</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  const to = supportEmail
    ? `${adminEmail}, ${supportEmail}`
    : adminEmail

  try {
    const transporter = createTransporter()
    await transporter.sendMail({
      from: `"Jordan Padierne CRM" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject: `🏠 New Lead: ${data.full_name} — Jordan Padierne Realtor`,
      html,
      replyTo: data.email,
    })
    return true
  } catch (err) {
    console.error('[email] Admin notification failed:', err)
    return false
  }
}

// ─── Email: Client Auto-Reply ──────────────────────────────────────────────

export async function sendClientAutoReply(
  clientEmail: string,
  clientName: string,
  formType: string
): Promise<boolean> {
  if (!isEmailConfigured()) return false

  const formMessages: Record<string, string> = {
    contact: 'Your message has been received and Jordan will get back to you shortly.',
    buyer_qualification: 'Your buyer profile has been received. Jordan will review your details and reach out to discuss your home search.',
    investor_inquiry: 'Your investment inquiry has been received. Jordan will prepare personalized opportunities matching your goals.',
    pre_construction_interest: 'Your pre-construction interest has been registered. Jordan will send you exclusive project details soon.',
    showing_request: 'Your showing request has been received. Jordan will confirm your appointment shortly.',
    open_house: 'Thank you for visiting! Jordan has recorded your information and will follow up soon.',
  }

  const customMessage = formMessages[formType] ?? formMessages.contact

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F7FA;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7FA;padding:40px 20px">
    <tr><td>
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto">

        <!-- Header -->
        <tr>
          <td style="background:#0A1628;padding:32px;border-radius:12px 12px 0 0;text-align:center">
            <p style="margin:0;font-size:24px;font-weight:700;color:#fff;font-family:Georgia,serif">Jordan Padierne</p>
            <p style="margin:6px 0 0;font-size:11px;color:#7BA7C2;text-transform:uppercase;letter-spacing:1.5px">Realtor · eXp Realty · South Florida</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#fff;padding:36px 32px;border-radius:0 0 12px 12px;text-align:center">

            <div style="width:56px;height:56px;background:#EAF3FB;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;font-size:28px">
              ✉️
            </div>

            <h2 style="margin:0 0 8px;font-size:22px;color:#0A1628;font-family:Georgia,serif">
              Thank you, ${clientName}!
            </h2>

            <p style="margin:0 0 24px;font-size:15px;color:#64748B;line-height:1.7">
              ${customMessage}
            </p>

            <div style="background:#F4F7FA;border-radius:10px;padding:20px;margin-bottom:28px;text-align:left">
              <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:0.5px">Contact Jordan directly</p>
              <p style="margin:0 0 6px;font-size:14px;color:#0A1628">
                📞 <a href="tel:+13057996973" style="color:#1A3A6B;font-weight:600">305-799-6973</a>
              </p>
              <p style="margin:0 0 6px;font-size:14px;color:#0A1628">
                ✉️ <a href="mailto:info@jordanpadierne.com" style="color:#1A3A6B;font-weight:600">info@jordanpadierne.com</a>
              </p>
              <p style="margin:0;font-size:14px;color:#0A1628">
                💬 <a href="https://wa.me/13057996973" style="color:#1A3A6B;font-weight:600">WhatsApp</a>
              </p>
            </div>

            <p style="margin:0 0 6px;font-size:13px;color:#94A3B8">
              English · Español &nbsp;|&nbsp; Miami-Dade, Brickell, Doral, Coral Gables
            </p>
            <p style="margin:0;font-size:11px;color:#CBD5E1">
              License SL3641062 · eXp Realty · Florida
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  try {
    const transporter = createTransporter()
    await transporter.sendMail({
      from: `"Jordan Padierne · eXp Realty" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: clientEmail,
      subject: 'Thank you for contacting Jordan Padierne — eXp Realty',
      html,
      replyTo: 'info@jordanpadierne.com',
    })
    return true
  } catch (err) {
    console.error('[email] Auto-reply failed:', err)
    return false
  }
}
