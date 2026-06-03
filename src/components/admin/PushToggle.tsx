'use client'

import { useEffect, useState } from 'react'
import { Bell, BellRing } from 'lucide-react'
import { toast } from '@/lib/toast'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

export default function PushToggle() {
  const [status, setStatus] = useState<'idle' | 'on' | 'unsupported' | 'busy'>('idle')

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported'); return
    }
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription()
      if (sub) setStatus('on')
    }).catch(() => {})
  }, [])

  async function enable() {
    setStatus('busy')
    try {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') { toast('Notifications blocked. Enable them in your browser settings.', { type: 'warn' }); setStatus('idle'); return }

      const reg = await navigator.serviceWorker.ready
      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      })
      await fetch('/api/push/subscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub, label: navigator.userAgent.slice(0, 60) }),
      })
      // Send a test push so Jordan sees it works
      await fetch('/api/push/test', { method: 'POST' })
      setStatus('on')
      toast('Phone alerts ON — you\'ll get every lead instantly 🔔', { type: 'success' })
    } catch (err) {
      toast('Could not enable notifications.', { type: 'warn' })
      setStatus('idle')
    }
  }

  if (status === 'unsupported') return null

  if (status === 'on') {
    return (
      <div className="px-4 py-3 rounded-xl bg-green-500/15 border border-green-500/30">
        <p className="flex items-center gap-2 text-green-400 text-sm font-semibold">
          <BellRing size={14} /> Lead alerts ON
        </p>
        <p className="text-navy-400 text-xs mt-0.5">You&apos;ll get a notification the instant a lead comes in.</p>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={enable}
      disabled={status === 'busy'}
      className="w-full px-4 py-3 rounded-xl bg-wine hover:bg-wine-700 text-white text-left transition-colors disabled:opacity-60"
    >
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Bell size={14} /> {status === 'busy' ? 'Enabling…' : 'Turn on lead alerts'}
      </p>
      <p className="text-wine-100 text-xs mt-0.5">Get a phone notification the second a lead arrives.</p>
    </button>
  )
}
