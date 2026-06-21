import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { requireUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const denied = await requireUser(); if (denied) return denied
  try {
    const supabase = createServiceClient()
    const { content, lead_id, contact_id, author } = await req.json()

    if (!content || (!lead_id && !contact_id)) {
      return NextResponse.json({ success: false, error: 'content and a lead_id or contact_id are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('notes')
      .insert({ content, lead_id: lead_id ?? null, contact_id: contact_id ?? null, author: author ?? 'Jordan' })
      .select()
      .single()

    if (error) throw error

    // Touch the lead's last_contact so the activity timeline + stale indicators update
    if (lead_id) {
      await supabase.from('leads').update({ last_contact: new Date().toISOString() }).eq('id', lead_id)
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const denied = await requireUser(); if (denied) return denied
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
