import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { requireUser } from '@/lib/auth'

const ALLOWED: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}
const MAX_BYTES = 8 * 1024 * 1024 // 8 MB

export async function POST(req: NextRequest) {
  const denied = await requireUser(); if (denied) return denied
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ success: false, error: 'No file' }, { status: 400 })

    // Only real images, capped in size — the bucket is public, so no arbitrary hosting.
    const ext = ALLOWED[file.type]
    if (!ext) return NextResponse.json({ success: false, error: 'Only JPG, PNG, WebP or AVIF images are allowed' }, { status: 400 })
    if (file.size > MAX_BYTES) return NextResponse.json({ success: false, error: 'Image too large (max 8 MB)' }, { status: 400 })

    const supabase = createServiceClient()
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
    console.error('[upload]', err)
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 })
  }
}
