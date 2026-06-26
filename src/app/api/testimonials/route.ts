import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase'
import { requireUser } from '@/lib/auth'
import { pickAllowed, TESTIMONIAL_FIELDS } from '@/lib/api-write'

export async function GET() {
  const denied = await requireUser(); if (denied) return denied
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    if (error) throw error
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
    const row = pickAllowed(body, TESTIMONIAL_FIELDS)
    if (!String(row.client_name ?? '').trim() || !String(row.quote ?? '').trim()) {
      return NextResponse.json({ success: false, error: 'Client name and quote are required.' }, { status: 400 })
    }
    const { data, error } = await supabase.from('testimonials').insert(row).select().single()
    if (error) throw error
    revalidatePath('/') // refresh the public home page immediately
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
    const { error } = await supabase.from('testimonials').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/')
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
