import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { requireUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const denied = await requireUser(); if (denied) return denied
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
