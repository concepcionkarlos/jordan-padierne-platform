import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { requestReviewForLead } from '@/lib/reviews'
import { requireUser } from '@/lib/auth'
import { statusFieldsForStage } from '@/lib/goals'

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

    // Single source of truth: when the pipeline stage changes, derive status +
    // closed_at from it so the two can never drift (e.g. a board-close that the
    // earnings math would otherwise miss).
    const patch = (typeof updates.pipeline_stage === 'string')
      ? { ...updates, ...statusFieldsForStage(updates.pipeline_stage) }
      : updates

    const { data, error } = await supabase.from('leads').update(patch).eq('id', id).select().single()
    if (error) throw error

    // Deal closed → ask the happy client for a Google review (self-guards against repeats)
    if (updates.pipeline_stage === 'CLOSED' || updates.status === 'closed') {
      requestReviewForLead(id).catch(() => {})
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
