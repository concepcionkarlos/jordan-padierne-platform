import { NextResponse } from 'next/server'
import { sendPushToAll } from '@/lib/push'

export async function POST() {
  try {
    const res = await sendPushToAll({
      title: '🔔 Notifications are on!',
      body: 'You\'ll get an instant alert here every time a new lead comes in.',
      url: '/admin/leads',
      tag: 'test',
    })
    return NextResponse.json({ success: true, ...res })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
