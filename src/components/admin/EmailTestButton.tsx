'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { toast } from '@/lib/toast'

export default function EmailTestButton() {
  const [sending, setSending] = useState(false)

  async function sendTest() {
    setSending(true)
    try {
      const res = await fetch('/api/email/test', { method: 'POST' })
      const d = await res.json()
      if (d.success) toast(`Test email sent from ${d.from} — check the inbox ✅`, { type: 'success', duration: 4000 })
      else toast(d.error || 'Could not send. Check email settings.', { type: 'warn' })
    } catch {
      toast('Could not send. Try again.', { type: 'warn' })
    } finally {
      setSending(false)
    }
  }

  return (
    <button
      type="button"
      onClick={sendTest}
      disabled={sending}
      className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-navy-900 text-white text-sm font-semibold hover:bg-navy-800 transition-colors disabled:opacity-50"
    >
      <Send size={14} /> {sending ? 'Sending…' : 'Send test email'}
    </button>
  )
}
