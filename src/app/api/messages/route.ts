import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { requireUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const denied = await requireUser(); if (denied) return denied
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') ?? '50')

    let query = supabase
      .from('messages')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) query = query.eq('status', status)
    if (type) query = query.eq('type', type)

    const { data, error, count } = await query
    if (error) throw error

    return NextResponse.json({ success: true, data, count })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}

const MESSAGE_STATUSES = ['unread', 'read', 'handled']

export async function PATCH(req: NextRequest) {
  const denied = await requireUser(); if (denied) return denied
  try {
    const supabase = createServiceClient()
    const { id, ...updates } = await req.json()

    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

    // Whitelist — only status + lead_id may be patched on a message.
    const allowed: Record<string, unknown> = {}
    if (MESSAGE_STATUSES.includes(updates.status)) allowed.status = updates.status
    if ('lead_id' in updates) allowed.lead_id = updates.lead_id || null
    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields to update.' }, { status: 400 })
    }

    const { data, error } = await supabase.from('messages').update(allowed).eq('id', id).select('*, leads(id, full_name, pipeline_stage)').single()
    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
