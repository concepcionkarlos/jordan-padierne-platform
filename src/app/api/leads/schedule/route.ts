import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServiceClient } from '@/lib/supabase'
import { requireUser } from '@/lib/auth'
import { sendCalendarInvite } from '@/lib/email'
import { buildIcs } from '@/lib/ics'
import { isGoogleMeetConfigured, createGoogleMeetEvent } from '@/lib/google-meet'

const FROM = process.env.SMTP_FROM || 'info@jordanpadierne.com'

function whenLabel(d: Date): string {
  return (
    d.toLocaleString('en-US', {
      timeZone: 'America/New_York',
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }) + ' ET'
  )
}

// Schedule an appointment for a lead from the CRM and invite the client.
// Video → real Google Meet (if a service account is configured) with Google's
// native calendar invite; otherwise a Jitsi link + our own .ics invite.
// In-person → our branded .ics invite with the address.
export async function POST(req: NextRequest) {
  const denied = await requireUser(); if (denied) return denied
  try {
    const supabase = createServiceClient()
    const { lead_id, starts_at, duration_minutes, mode, location, title, notes, send_invite } = await req.json()

    if (!lead_id || !starts_at) {
      return NextResponse.json({ success: false, error: 'lead_id and starts_at required' }, { status: 400 })
    }
    const start = new Date(starts_at)
    if (isNaN(start.getTime())) {
      return NextResponse.json({ success: false, error: 'Invalid date/time' }, { status: 400 })
    }

    const { data: lead } = await supabase.from('leads').select('id, full_name, email').eq('id', lead_id).single()
    if (!lead) return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 })

    const dur = Number(duration_minutes) > 0 ? Number(duration_minutes) : 30
    const isVideo = mode === 'video'
    const evtTitle = String(title || '').trim() || `Consultation with Jordan Padierne`
    const when = whenLabel(start)
    const firstName = (lead.full_name || '').trim().split(' ')[0] || 'there'
    const hasRealEmail = lead.email && !/placeholder|no-email/i.test(lead.email)

    // ── Video: prefer real Google Meet (Google emails the native invite) ──
    let videoUrl = ''
    let viaGoogle = false
    if (isVideo && isGoogleMeetConfigured() && hasRealEmail) {
      const g = await createGoogleMeetEvent({
        title: evtTitle,
        description: [notes, 'Questions? Call or text Jordan at 305-799-6973.'].filter(Boolean).join('\n\n'),
        start,
        durationMinutes: dur,
        attendeeEmail: lead.email,
        attendeeName: lead.full_name,
      })
      if (g) { videoUrl = g.meetUrl; viaGoogle = true }
    }
    if (isVideo && !videoUrl) {
      videoUrl = `https://meet.jit.si/JordanPadierne-${crypto.randomBytes(5).toString('hex')}`
    }

    const loc = isVideo ? videoUrl : (String(location || '').trim() || 'Location to be confirmed')

    // ── Our own branded .ics invite (skipped when Google already sent one) ──
    const wantInvite = send_invite !== false
    let sent = viaGoogle
    if (!viaGoogle && wantInvite && hasRealEmail) {
      const ics = buildIcs({
        uid: `${crypto.randomBytes(8).toString('hex')}@jordanpadierne.com`,
        title: evtTitle,
        description: [
          notes,
          isVideo ? `Join the video call: ${videoUrl}` : (location ? `Where: ${location}` : ''),
          'Questions? Call or text Jordan at 305-799-6973.',
        ].filter(Boolean).join('\n\n'),
        location: loc,
        start,
        durationMinutes: dur,
        organizerName: 'Jordan Padierne',
        organizerEmail: FROM,
        attendeeName: lead.full_name,
        attendeeEmail: lead.email,
      })
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F4F7FA;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td>
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto">
  <tr><td style="background:#0A1628;padding:26px;border-radius:12px 12px 0 0;text-align:center">
    <p style="margin:0;font-size:22px;font-weight:700;color:#fff;font-family:Georgia,serif">Jordan Padierne</p>
    <p style="margin:6px 0 0;font-size:10px;color:#7BA7C2;text-transform:uppercase;letter-spacing:1.5px">Realtor · South Florida</p>
  </td></tr>
  <tr><td style="background:#fff;padding:30px 28px;border-radius:0 0 12px 12px">
    <p style="font-size:30px;margin:0 0 10px;text-align:center">📅</p>
    <h2 style="margin:0 0 6px;font-size:20px;color:#0A1628;font-family:Georgia,serif;text-align:center">You're scheduled, ${firstName}!</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#64748B;text-align:center;line-height:1.6">${evtTitle} is confirmed. The invite is attached — tap it to add it to your calendar.</p>
    <table width="100%" style="background:#F4F7FA;border-radius:10px;padding:18px 20px;margin-bottom:18px">
      <tr><td style="font-size:14px;color:#0A1628;line-height:2">
        <strong>When:</strong> ${when}<br/>
        <strong>${isVideo ? 'Video call' : 'Where'}:</strong> ${isVideo ? `<a href="${videoUrl}" style="color:#1A3A6B;font-weight:600">${videoUrl}</a>` : loc}
      </td></tr>
    </table>
    ${isVideo ? `<div style="text-align:center;margin-bottom:18px"><a href="${videoUrl}" style="display:inline-block;background:#8B1A2F;color:#fff;padding:13px 30px;border-radius:8px;font-size:15px;font-weight:700;text-decoration:none">Join video call →</a></div>` : ''}
    <p style="margin:0;font-size:13px;color:#94A3B8;text-align:center">Need to reschedule? Call or text Jordan at <a href="tel:+13057996973" style="color:#1A3A6B;font-weight:600">305-799-6973</a></p>
  </td></tr>
</table></td></tr></table></body></html>`
      sent = await sendCalendarInvite(lead.email, `📅 ${evtTitle} — ${when}`, html, ics, FROM)
    }

    // Record the appointment in the CRM.
    const endsAt = new Date(start.getTime() + dur * 60000).toISOString()
    const { data: appt } = await supabase
      .from('appointments')
      .insert({
        lead_id: lead.id,
        title: evtTitle,
        type: isVideo ? 'video' : 'showing',
        starts_at: start.toISOString(),
        ends_at: endsAt,
        location: loc,
        notes: notes || null,
        status: 'scheduled',
      })
      .select('id, title, type, starts_at, location, status')
      .single()

    const channel = viaGoogle
      ? ' — Google Meet invite sent via Google Calendar'
      : sent ? ` — invite sent to ${lead.email}` : ' — invite not emailed'
    await supabase.from('notes').insert({
      content: `📅 ${isVideo ? 'Video' : 'In-person'} appointment scheduled for ${when}${channel}`,
      lead_id: lead.id,
      author: 'CRM',
    })

    return NextResponse.json({ success: true, appointment: appt, videoUrl, invite_sent: sent, via_google: viaGoogle })
  } catch (err) {
    console.error('[leads/schedule] error', err)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}
