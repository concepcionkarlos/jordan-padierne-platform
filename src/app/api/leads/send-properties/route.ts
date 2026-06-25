import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { requireUser } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
import { formatCurrency } from '@/lib/utils'

function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function propertyCard(p: any): string {
  const img = Array.isArray(p.images) && p.images[0] ? String(p.images[0]) : ''
  const lt = p.listing_type ?? 'sale'
  const price = `${formatCurrency(Number(p.price))}${lt === 'rent' ? '/mo' : ''}`
  const specs = [
    p.bedrooms ? `${p.bedrooms} bd` : '',
    p.bathrooms ? `${p.bathrooms} ba` : '',
    p.sqft ? `${Number(p.sqft).toLocaleString()} sqft` : '',
  ].filter(Boolean).join(' &nbsp;·&nbsp; ')
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #EAEFF4;border-radius:12px;overflow:hidden;margin-bottom:16px">
    ${img ? `<tr><td><img src="${esc(img)}" alt="${esc(p.title)}" width="520" style="width:100%;max-width:520px;height:auto;display:block" /></td></tr>` : ''}
    <tr><td style="padding:16px 20px">
      <p style="margin:0 0 2px;font-size:11px;color:#46779A;text-transform:uppercase;letter-spacing:1px;font-weight:700">${esc(p.city ?? '')}</p>
      <p style="margin:0 0 6px;font-size:17px;color:#0A1628;font-family:Georgia,serif;font-weight:700">${esc(p.title ?? '')}</p>
      <p style="margin:0 0 8px;font-size:20px;color:#0A1628;font-weight:700">${esc(price)}</p>
      ${specs ? `<p style="margin:0;font-size:13px;color:#64748B">${specs}</p>` : ''}
    </td></tr>
  </table>`
}

// Send a curated set of properties to a lead by email — photos, price, specs,
// plus Jordan's personal note. Logged on the lead's timeline.
export async function POST(req: NextRequest) {
  const denied = await requireUser(); if (denied) return denied
  try {
    const supabase = createServiceClient()
    const { lead_id, property_ids, message } = await req.json()

    if (!lead_id || !Array.isArray(property_ids) || property_ids.length === 0) {
      return NextResponse.json({ success: false, error: 'lead_id and property_ids required' }, { status: 400 })
    }

    const { data: lead } = await supabase.from('leads').select('id, full_name, email, metadata').eq('id', lead_id).single()
    if (!lead) return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 })
    if (!lead.email || /placeholder|no-email/i.test(lead.email)) {
      return NextResponse.json({ success: false, error: 'This lead has no real email on file.' }, { status: 400 })
    }

    const { data: props } = await supabase
      .from('properties')
      .select('id, title, city, price, listing_type, bedrooms, bathrooms, sqft, images')
      .in('id', property_ids.slice(0, 12))
    if (!props || props.length === 0) {
      return NextResponse.json({ success: false, error: 'No matching properties' }, { status: 400 })
    }

    const firstName = (lead.full_name || '').trim().split(' ')[0] || 'there'
    const note = String(message || '').trim()
    const portalUrl = `https://jordanpadierne.com/portal/${lead.id}`
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F4F7FA;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:28px 16px"><tr><td>
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto">
  <tr><td style="background:#0A1628;padding:24px;border-radius:12px 12px 0 0;text-align:center">
    <p style="margin:0;font-size:22px;font-weight:700;color:#fff;font-family:Georgia,serif">Jordan Padierne</p>
    <p style="margin:6px 0 0;font-size:10px;color:#7BA7C2;text-transform:uppercase;letter-spacing:1.5px">Realtor · South Florida</p>
  </td></tr>
  <tr><td style="background:#F4F7FA;padding:24px 4px">
    <h2 style="margin:0 0 6px;font-size:19px;color:#0A1628;font-family:Georgia,serif;text-align:center">Hand-picked for you, ${esc(firstName)} 🏡</h2>
    <p style="margin:0 0 18px;font-size:14px;color:#64748B;text-align:center;line-height:1.6;padding:0 18px">${note ? esc(note) : 'Jordan found a few homes that match what you’re looking for. Take a look and tell him which ones catch your eye.'}</p>
    ${props.map(propertyCard).join('')}
    <div style="text-align:center;margin:8px 0 4px">
      <a href="${portalUrl}" style="display:inline-block;background:#1A3A6B;color:#fff;padding:13px 30px;border-radius:8px;font-size:15px;font-weight:700;text-decoration:none;margin-bottom:10px">View your home portal →</a><br/>
      <a href="tel:+13057996973" style="display:inline-block;background:#8B1A2F;color:#fff;padding:13px 30px;border-radius:8px;font-size:15px;font-weight:700;text-decoration:none">Talk to Jordan →</a>
      <p style="margin:14px 0 0;font-size:13px;color:#94A3B8">Reply to this email or call/text <a href="tel:+13057996973" style="color:#1A3A6B;font-weight:600">305-799-6973</a></p>
    </div>
  </td></tr>
</table></td></tr></table></body></html>`

    const sent = await sendEmail(lead.email, `🏡 ${props.length} home${props.length > 1 ? 's' : ''} Jordan picked for you`, html)

    await supabase.from('notes').insert({
      content: `🏡 Sent ${props.length} propert${props.length > 1 ? 'ies' : 'y'} to ${lead.email}${sent ? '' : ' (email not sent)'}: ${props.map((p) => p.title).join(', ').slice(0, 220)}`,
      lead_id: lead.id,
      author: 'CRM',
    })

    // Remember which homes were sent — they appear on the client's private portal.
    const prevIds: string[] = Array.isArray((lead.metadata as any)?.sent_property_ids) ? (lead.metadata as any).sent_property_ids : []
    const mergedIds = Array.from(new Set([...prevIds, ...props.map((p) => p.id)]))
    await supabase
      .from('leads')
      .update({ metadata: { ...((lead.metadata as Record<string, unknown>) ?? {}), sent_property_ids: mergedIds } })
      .eq('id', lead.id)

    return NextResponse.json({ success: true, sent, count: props.length, portal: portalUrl })
  } catch (err) {
    console.error('[leads/send-properties] error', err)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}
