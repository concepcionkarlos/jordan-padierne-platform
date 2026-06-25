import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { requestReviewForLead } from '@/lib/reviews'
import { requireUser } from '@/lib/auth'

// When a lead's deal closes it becomes a client → mirror it into the Contacts
// table (one contact per lead). This is what populates the Contacts page and
// gives Jordan a past-client list for referrals + repeat business.
async function ensureContactForLead(supabase: ReturnType<typeof createServiceClient>, lead: any) {
  if (!lead?.id) return
  const { data: existing } = await supabase.from('contacts').select('id').eq('lead_id', lead.id).limit(1)
  if (existing && existing.length > 0) return
  await supabase.from('contacts').insert({
    full_name: lead.full_name || 'Client',
    email: lead.email || '',
    phone: lead.phone || '',
    client_type: lead.client_type ?? null,
    preferred_area: lead.preferred_area ?? null,
    budget_min: lead.budget_min ?? null,
    budget_max: lead.budget_max ?? null,
    notes: 'Auto-added when the deal closed.',
    lead_id: lead.id,
  })
}

export async function GET(req: NextRequest) {
  const denied = await requireUser(); if (denied) return denied
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const stage = searchParams.get('stage')
    const limit = parseInt(searchParams.get('limit') ?? '50')
    const offset = parseInt(searchParams.get('offset') ?? '0')

    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) query = query.eq('status', status)
    if (stage) query = query.eq('pipeline_stage', stage)

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({ success: true, data, count })
  } catch (err) {
    console.error('[leads] GET', err)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireUser(); if (denied) return denied
  try {
    const supabase = createServiceClient()
    const body = await req.json()

    const { data, error } = await supabase.from('leads').insert(body).select().single()
    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('[leads] POST', err)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const denied = await requireUser(); if (denied) return denied
  try {
    const supabase = createServiceClient()
    const body = await req.json()
    const { id, ...updates } = body

    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

    const { data, error } = await supabase.from('leads').update(updates).eq('id', id).select().single()
    if (error) throw error

    // Deal closed → ask the happy client for a Google review (self-guards against
    // repeats) AND mirror the lead into Contacts as a past client.
    if (updates.pipeline_stage === 'CLOSED' || updates.status === 'closed') {
      requestReviewForLead(id).catch(() => {})
      ensureContactForLead(supabase, data).catch(() => {})
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('[leads] PATCH', err)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const denied = await requireUser(); if (denied) return denied
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

    const { error } = await supabase.from('leads').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[leads] DELETE', err)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}
