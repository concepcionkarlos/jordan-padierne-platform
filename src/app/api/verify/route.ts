import { NextRequest, NextResponse } from 'next/server'
import { consumePending, finalizeFormLead, finalizeSubscribe } from '@/lib/intake'

// Public: the customer clicked the confirmation link. Consume the one-time token
// and only NOW create the lead in the CRM (double opt-in).
export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()
    const pending = await consumePending(String(token || ''))
    if (!pending) {
      return NextResponse.json({ success: false, error: 'This link is invalid or has expired.' }, { status: 400 })
    }

    if (pending.kind === 'subscribe') {
      await finalizeSubscribe(pending.payload)
    } else {
      await finalizeFormLead(pending.payload)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[verify]', err)
    return NextResponse.json({ success: false, error: 'Could not confirm. Please try again.' }, { status: 500 })
  }
}
