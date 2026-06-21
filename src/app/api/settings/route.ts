import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getSetting, setSetting } from '@/lib/settings'
import { requireUser } from '@/lib/auth'
import { PROFILE_TAG } from '@/lib/profile'

// Read a single setting: /api/settings?key=google_review_url
export async function GET(req: NextRequest) {
  const denied = await requireUser(); if (denied) return denied
  const key = new URL(req.url).searchParams.get('key')
  if (!key) return NextResponse.json({ success: false, error: 'key required' }, { status: 400 })
  const value = await getSetting(key)
  return NextResponse.json({ success: true, value })
}

// Set a single setting: { key, value }
export async function PATCH(req: NextRequest) {
  const denied = await requireUser(); if (denied) return denied
  try {
    const { key, value } = await req.json()
    if (!key) return NextResponse.json({ success: false, error: 'key required' }, { status: 400 })
    const ok = await setSetting(key, String(value ?? ''))
    // Editing the agent profile must propagate to the public site → bust the cache.
    if (ok && typeof key === 'string' && key.startsWith('profile_')) revalidateTag(PROFILE_TAG)
    return NextResponse.json({ success: ok })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
