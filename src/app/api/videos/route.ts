import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase'
import { extractYouTubeId } from '@/lib/youtube'
import { requireUser } from '@/lib/auth'

export async function GET() {
  const denied = await requireUser(); if (denied) return denied
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase.from('videos').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false })
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
    const youtube_id = extractYouTubeId(body.url || body.youtube_id || '')
    if (!youtube_id) return NextResponse.json({ success: false, error: 'Invalid YouTube URL' }, { status: 400 })

    const { data, error } = await supabase.from('videos').insert({
      youtube_id,
      title: body.title || null,
      featured: body.featured ?? true,
    }).select().single()
    if (error) throw error
    revalidatePath('/')
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
    const { error } = await supabase.from('videos').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/')
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
