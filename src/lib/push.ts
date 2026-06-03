import webpush from 'web-push'
import { createServiceClient } from './supabase'

let configured = false
function ensureConfigured(): boolean {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  if (!pub || !priv) return false
  if (!configured) {
    webpush.setVapidDetails('mailto:info@jordanpadierne.com', pub, priv)
    configured = true
  }
  return true
}

export interface PushPayload {
  title: string
  body: string
  url?: string
  tag?: string
}

// Send a push to all of Jordan's subscribed devices. Prunes dead subscriptions.
export async function sendPushToAll(payload: PushPayload): Promise<{ sent: number }> {
  if (!ensureConfigured()) return { sent: 0 }
  const supabase = createServiceClient()
  const { data: subs } = await supabase.from('push_subscriptions').select('id, subscription')
  if (!subs || subs.length === 0) return { sent: 0 }

  let sent = 0
  await Promise.all(
    subs.map(async (row: any) => {
      try {
        await webpush.sendNotification(row.subscription, JSON.stringify(payload))
        sent++
      } catch (err: any) {
        // 404/410 → subscription expired, remove it
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await supabase.from('push_subscriptions').delete().eq('id', row.id)
        }
      }
    })
  )
  return { sent }
}
