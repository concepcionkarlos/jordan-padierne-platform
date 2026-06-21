import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase'
import { requireUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const denied = await requireUser(); if (denied) return denied
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(req.url)
    const featured = searchParams.get('featured')

    let query = supabase.from('properties').select('*').order('created_at', { ascending: false }).limit(100)
    if (featured === 'true') query = query.eq('featured', true)

    const { data, error } = await query
    if (error) throw error
    revalidatePath('/properties')
    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireUser(); if (denied) return denied
  try {
    const supabase = createServiceClient()
    const body = await req.json()
    const { data, error } = await supabase.from('properties').insert(body).select().single()
    if (error) throw error
    revalidatePath('/properties')
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
    const { data, error } = await supabase.from('properties').update(updates).eq('id', id).select().single()
    if (error) throw error
    revalidatePath('/properties')
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
    const { error } = await supabase.from('properties').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/properties')
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
