import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { requireUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const denied = await requireUser(); if (denied) return denied
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    let query = supabase
      .from('tasks')
      .select('*, leads(full_name)')
      .order('due_date', { ascending: true })
      .limit(100)

    if (status) query = query.eq('status', status)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}

const STATUSES = ['todo', 'in_progress', 'done']
const PRIORITIES = ['low', 'medium', 'high']

export async function POST(req: NextRequest) {
  const denied = await requireUser(); if (denied) return denied
  try {
    const supabase = createServiceClient()
    const body = await req.json()
    // Whitelist + validate — never insert an arbitrary body (mass-assignment).
    const title = String(body?.title ?? '').trim()
    if (!title) return NextResponse.json({ success: false, error: 'Task title is required.' }, { status: 400 })
    const row = {
      title: title.slice(0, 300),
      lead_id: body?.lead_id ?? null,
      status: STATUSES.includes(body?.status) ? body.status : 'todo',
      priority: PRIORITIES.includes(body?.priority) ? body.priority : 'medium',
      due_date: body?.due_date || null,
    }
    const { data, error } = await supabase.from('tasks').insert(row).select().single()
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const denied = await requireUser(); if (denied) return denied
  try {
    const supabase = createServiceClient()
    const { id, ...updates } = await req.json()
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    // Only allow known, safe columns to be patched.
    const allowed: Record<string, unknown> = {}
    if (typeof updates.title === 'string' && updates.title.trim()) allowed.title = updates.title.trim().slice(0, 300)
    if (STATUSES.includes(updates.status)) allowed.status = updates.status
    if (PRIORITIES.includes(updates.priority)) allowed.priority = updates.priority
    if ('due_date' in updates) allowed.due_date = updates.due_date || null
    if ('completed_at' in updates) allowed.completed_at = updates.completed_at || null
    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields to update.' }, { status: 400 })
    }
    const { data, error } = await supabase.from('tasks').update(allowed).eq('id', id).select().single()
    if (error) throw error
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
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
