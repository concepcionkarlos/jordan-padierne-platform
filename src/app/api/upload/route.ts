import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ success: false, error: 'No file' }, { status: 400 })

    const supabase = createServiceClient()
    const ext = file.name.split('.').pop() ?? 'jpg'
    // Deterministic-ish unique name without Date.now (use random + size)
    const rand = Math.random().toString(36).slice(2, 10)
    const path = `${rand}-${file.size}.${ext}`

    const bytes = await file.arrayBuffer()
    const { error } = await supabase.storage
      .from('property-images')
      .upload(path, bytes, { contentType: file.type, upsert: false })

    if (error) throw error

    const { data: pub } = supabase.storage.from('property-images').getPublicUrl(path)
    return NextResponse.json({ success: true, url: pub.publicUrl })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
