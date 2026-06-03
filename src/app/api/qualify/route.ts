import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { evaluateLead } from '@/lib/evaluate'
import { sendQualificationAlert } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const supabase = createServiceClient()
    const body = await req.json()
    const { lead_id, ...answers } = body

    if (!lead_id) {
      return NextResponse.json({ success: false, error: 'lead_id required' }, { status: 400 })
    }

    // Fetch the lead
    const { data: lead, error: leadErr } = await supabase
      .from('leads')
      .select('id, full_name, tags, email, phone')
      .eq('id', lead_id)
      .single()

    if (leadErr || !lead) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 })
    }

    // ─── Intelligent evaluation ───
    const ev = evaluateLead({ full_name: lead.full_name, ...answers })
    const mergedTags = Array.from(new Set([...(lead.tags ?? []), ...ev.tags]))

    const intentLower = String(answers.intent ?? '').toLowerCase()
    const clientType = answers.client_type
      || (intentLower.includes('invest') ? 'Investor' : intentLower.includes('sell') ? 'Seller' : 'Buyer')

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
    }).eq('id', lead_id)

    // ─── Log the evaluation summary in the activity log ───
    await supabase.from('notes').insert({
      content: ev.summary,
      lead_id,
      author: 'AI Evaluation',
    })

    // ─── Auto-create Jordan's recommended tasks ───
    if (ev.tasks.length > 0) {
      await supabase.from('tasks').insert(
        ev.tasks.map((t) => ({
          title: t.title,
          priority: t.priority,
          status: 'todo',
          lead_id,
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
      lead_id,
    }).catch(() => {})

    return NextResponse.json({ success: true, temperature: ev.temperature })
  } catch (err) {
    console.error('[qualify] error:', err)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}
