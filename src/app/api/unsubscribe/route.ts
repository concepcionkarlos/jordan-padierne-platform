import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { verifyUnsubToken } from '@/lib/unsubscribe'

// Public: a recipient clicks the unsubscribe link in an email. The signed token
// identifies their email; we flag every matching lead so drip/marketing stops.
export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()
    const email = verifyUnsubToken(String(token || ''))
    if (!email) return NextResponse.json({ success: false, error: 'Invalid link' }, { status: 400 })

    const supabase = createServiceClient()
    const { data: leads } = await supabase.from('leads').select('id, metadata').eq('email', email).limit(200)

    const stamp = new Date().toISOString()
    for (const lead of leads ?? []) {
      const meta = (lead.metadata ?? {}) as Record<string, unknown>
      await supabase.from('leads').update({
        metadata: { ...meta, unsubscribed_at: stamp, drip_stopped: true },
      }).eq('id', lead.id)
    }

    return NextResponse.json({ success: true, email })
  } catch {
    return NextResponse.json({ success: false, error: 'Could not process request' }, { status: 500 })
  }
}
