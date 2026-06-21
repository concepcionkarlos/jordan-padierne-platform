import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { requestReviewForLead } from '@/lib/reviews'
import { requireUser } from '@/lib/auth'

export async function GET() {
  const denied = await requireUser(); if (denied) return denied
  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('leads')
      .select('id, full_name, email, phone, client_type, pipeline_stage, budget_min, budget_max, preferred_area, status, created_at, last_contact, next_followup')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Group by stage
    const stages = ['NEW', 'QUALIFIED', 'CONTACTED', 'SHOWING_SCHEDULED', 'NEGOTIATION', 'CLOSED', 'LOST']
    const grouped = stages.reduce((acc, stage) => {
      acc[stage] = data?.filter((l) => l.pipeline_stage === stage) ?? []
      return acc
    }, {} as Record<string, typeof data>)

    return NextResponse.json({ success: true, data: grouped })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const denied = await requireUser(); if (denied) return denied
  try {
    const supabase = createServiceClient()
    const { lead_id, stage } = await req.json()

    if (!lead_id || !stage) {
      return NextResponse.json({ success: false, error: 'lead_id and stage required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('leads')
      .update({ pipeline_stage: stage })
      .eq('id', lead_id)

    if (error) throw error

    // Log pipeline move
    await supabase.from('pipeline_entries').insert({ lead_id, stage })

    // Deal closed → ask the happy client for a Google review (self-guards against repeats)
    if (stage === 'CLOSED') {
      requestReviewForLead(lead_id).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
