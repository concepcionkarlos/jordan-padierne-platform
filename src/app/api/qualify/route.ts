import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { evaluateLead } from '@/lib/evaluate'
import { sendQualificationAlert } from '@/lib/email'
import { guardPublic } from '@/lib/antispam'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: NextRequest) {
  try {
    const supabase = createServiceClient()
    const body = await req.json()

    const spam = guardPublic(req, body)
    if (spam) return spam

    const { lead_id, full_name, email, phone, ...answers } = body

    const intentLower = String(answers.intent ?? '').toLowerCase()
    const clientType = answers.client_type
      || (intentLower.includes('invest') ? 'Investor' : intentLower.includes('sell') ? 'Seller' : 'Buyer')

    // Try to load the lead the link points to.
    let lead: any = null
    if (lead_id && UUID_RE.test(lead_id)) {
      const { data } = await supabase
        .from('leads')
        .select('id, full_name, tags, email, phone')
        .eq('id', lead_id)
        .single()
      lead = data
    }

    // Resilient path: the link's lead is missing (deleted / bad id). Don't 404 —
    // create a fresh lead from the contact info the form collected.
    if (!lead) {
      if (!full_name || !email) {
        return NextResponse.json({ success: false, error: 'Contact info required' }, { status: 400 })
      }
      const { data: created, error: createErr } = await supabase
        .from('leads')
        .insert({
          full_name,
          email,
          phone: phone ?? '',
          client_type: clientType,
          source: 'Website',
          status: 'new',
          pipeline_stage: 'NEW',
          hot_score: 1,
          tags: [],
          metadata: { from: 'profile_link' },
        })
        .select('id, full_name, tags, email, phone')
        .single()
      if (createErr || !created) {
        return NextResponse.json({ success: false, error: 'Could not create lead' }, { status: 500 })
      }
      lead = created
    }

    const leadId = lead.id

    // ─── Intelligent evaluation ───
    const ev = evaluateLead({ full_name: lead.full_name, ...answers })
    const mergedTags = Array.from(new Set([...(lead.tags ?? []), ...ev.tags]))

    // ─── Update the lead with all qualification data ───
    await supabase.from('leads').update({
      client_type: clientType,
      budget_min: answers.budget_min ? Number(answers.budget_min) : null,
      budget_max: answers.budget_max ? Number(answers.budget_max) : null,
      timeline: answers.timeline ?? null,
      financing_status: answers.financing_status ?? null,
      preferred_area: answers.preferred_area ?? null,
      property_interest: [answers.property_type, answers.bedrooms].filter(Boolean).join(' · ') || null,
      hot_score: ev.hot_score,
      tags: mergedTags,
      status: 'qualified',
      pipeline_stage: 'QUALIFIED',
      last_contact: new Date().toISOString(),
      metadata: { ...answers, qualified_at: new Date().toISOString() },
    }).eq('id', leadId)

    // ─── Log the evaluation summary in the activity log ───
    await supabase.from('notes').insert({
      content: ev.summary,
      lead_id: leadId,
      author: 'AI Evaluation',
    })

    // ─── Auto-create Jordan's recommended tasks ───
    if (ev.tasks.length > 0) {
      await supabase.from('tasks').insert(
        ev.tasks.map((t) => ({
          title: t.title,
          priority: t.priority,
          status: 'todo',
          lead_id: leadId,
          due_date: t.priority === 'high' ? new Date().toISOString() : null,
        }))
      )
    }

    // ─── Notify Jordan that the lead qualified (non-blocking) ───
    sendQualificationAlert({
      full_name: lead.full_name,
      email: lead.email,
      phone: lead.phone,
      temperature: ev.temperature,
      summary: ev.summary,
      tasks: ev.tasks.map((t) => t.title),
      lead_id: leadId,
    }).catch(() => {})

    return NextResponse.json({ success: true, temperature: ev.temperature })
  } catch (err) {
    console.error('[qualify] error:', err)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}
