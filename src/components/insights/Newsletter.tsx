'use client'

import { useState } from 'react'
import { Mail, Check } from 'lucide-react'
import { useT } from '@/components/LanguageProvider'

// Newsletter signup (email only) → creates a 'newsletter' lead in the CRM.
export default function Newsletter({ slug, compact = false }: { slug?: string; compact?: boolean }) {
  const { t } = useT()
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError(t('insights.error')); return }
    setSending(true); setError('')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'newsletter', email: email.trim(), source_article: slug }),
      })
      const d = await res.json()
      if (!res.ok || !d.success) { setError(t('insights.error')); return }
      setDone(true)
    } catch {
      setError(t('insights.error'))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className={compact ? '' : 'rounded-2xl bg-navy-50 p-6 sm:p-7'}>
      {!compact && (
        <div className="flex items-center gap-2 mb-1.5 text-navy-900 font-semibold">
          <Mail size={17} className="text-sky-600" /> {t('insights.news.title')}
        </div>
      )}
      {!compact && <p className="text-gray-500 text-sm mb-4">{t('insights.news.body')}</p>}

      {done ? (
        <p className="flex items-center gap-2 text-green-600 font-semibold">
          <Check size={18} /> {t('insights.news.done')}
        </p>
      ) : (
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
          <input
            className="input-field flex-1" type="email" required
            placeholder={t('insights.news.placeholder')}
            value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email"
          />
          <button type="submit" disabled={sending} className="btn-primary whitespace-nowrap disabled:opacity-60">
            {sending ? '…' : t('insights.news.button')}
          </button>
        </form>
      )}
      {error && <p className="text-wine text-sm mt-2">{error}</p>}
    </div>
  )
}
