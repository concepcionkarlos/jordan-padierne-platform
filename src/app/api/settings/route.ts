import { NextRequest, NextResponse } from 'next/server'
import { getSetting, setSetting } from '@/lib/settings'

// Read a single setting: /api/settings?key=google_review_url
export async function GET(req: NextRequest) {
  const key = new URL(req.url).searchParams.get('key')
  if (!key) return NextResponse.json({ success: false, error: 'key required' }, { status: 400 })
  const value = await getSetting(key)
  return NextResponse.json({ success: true, value })
}

// Set a single setting: { key, value }
export async function PATCH(req: NextRequest) {
  try {
    const { key, value } = await req.json()
    if (!key) return NextResponse.json({ success: false, error: 'key required' }, { status: 400 })
    const ok = await setSetting(key, String(value ?? ''))
    return NextResponse.json({ success: ok })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
