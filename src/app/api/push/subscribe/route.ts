import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { subscription, label } = await req.json()
    if (!subscription?.endpoint) {
      return NextResponse.json({ success: false, error: 'Invalid subscription' }, { status: 400 })
    }
    // Upsert by endpoint
    await supabase.from('push_subscriptions').upsert(
      { endpoint: subscription.endpoint, subscription, label: label ?? 'Jordan device' },
      { onConflict: 'endpoint' }
    )
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
