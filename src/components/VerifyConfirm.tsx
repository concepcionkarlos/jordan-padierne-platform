'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, Loader2, AlertCircle } from 'lucide-react'

export default function VerifyConfirm({ token }: { token: string }) {
  const [status, setStatus] = useState<'verifying' | 'done' | 'error'>('verifying')

  useEffect(() => {
    if (!token) { setStatus('error'); return }
    let cancelled = false
    fetch('/api/verify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setStatus(d.success ? 'done' : 'error') })
      .catch(() => { if (!cancelled) setStatus('error') })
    return () => { cancelled = true }
  }, [token])

  if (status === 'verifying') {
    return (
      <div>
        <Loader2 size={30} className="text-sky-300 mx-auto mb-4 animate-spin" />
        <p className="text-navy-200">Confirming your email…</p>
      </div>
    )
  }

  if (status === 'done') {
    return (
      <div>
        <div className="w-14 h-14 rounded-2xl bg-green-500/15 flex items-center justify-center mx-auto mb-5">
          <Check size={26} className="text-green-400" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-white mb-2">You&apos;re all set! 🎉</h1>
        <p className="text-navy-200 mb-6">Your email is confirmed. Jordan now has your info and will personally reach out shortly.</p>
        <Link href="/" className="btn-wine inline-flex">Back to the site</Link>
      </div>
    )
  }

  return (
    <div>
      <div className="w-14 h-14 rounded-2xl bg-amber-500/15 flex items-center justify-center mx-auto mb-5">
        <AlertCircle size={26} className="text-amber-400" />
      </div>
      <h1 className="font-serif text-2xl font-bold text-white mb-2">Link expired or invalid</h1>
      <p className="text-navy-200 mb-6">This confirmation link didn&apos;t work — it may have already been used or expired. Please submit the form again.</p>
      <Link href="/contact" className="btn-wine inline-flex">Contact Jordan</Link>
    </div>
  )
}
