'use client'

import { useState } from 'react'
import { Check, MailX } from 'lucide-react'

export default function UnsubscribeConfirm({ token }: { token: string }) {
  const [status, setStatus] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')

  async function unsubscribe() {
    setStatus('busy')
    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const d = await res.json()
      setStatus(d.success ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (!token) {
    return <p className="text-navy-200">This unsubscribe link is invalid or incomplete.</p>
  }

  if (status === 'done') {
    return (
      <div>
        <div className="w-14 h-14 rounded-2xl bg-green-500/15 flex items-center justify-center mx-auto mb-5">
          <Check size={26} className="text-green-400" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-white mb-2">You&apos;re unsubscribed</h1>
        <p className="text-navy-200">You won&apos;t receive further marketing emails. You&apos;ll still get replies to anything you contact Jordan about directly.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5">
        <MailX size={26} className="text-sky-300" />
      </div>
      <h1 className="font-serif text-2xl font-bold text-white mb-2">Unsubscribe</h1>
      <p className="text-navy-200 mb-6">Stop receiving marketing &amp; follow-up emails from Jordan Padierne?</p>
      {status === 'error' && <p className="text-amber-300 text-sm mb-4">Something went wrong. Please try again.</p>}
      <button
        type="button"
        onClick={unsubscribe}
        disabled={status === 'busy'}
        className="btn-wine inline-flex disabled:opacity-60"
      >
        {status === 'busy' ? 'Processing…' : 'Yes, unsubscribe me'}
      </button>
    </div>
  )
}
