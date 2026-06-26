import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { requireUser } from '@/lib/auth'

// The native iOS app registers / refreshes its APNs device token here on launch.
// Bearer-authenticated (via the shared guard). Additive — no existing route or web
// behavior is affected, and nothing sends to these tokens until the APNs sender
// (a later increment, gated on the APNs key) is wired in.
export async function POST(req: NextRequest) {
  const denied = await requireUser()
  if (denied) return denied

  try {
    const { token, label } = await req.json()
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ success: false, error: 'token required' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { error } = await supabase.from('apns_devices').upsert(
      { token, label: typeof label === 'string' ? label : 'Jordan iPhone', updated_at: new Date().toISOString() },
      { onConflict: 'token' }
    )
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
