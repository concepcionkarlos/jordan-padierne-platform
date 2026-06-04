'use client'

import { useState } from 'react'
import { BookOpen, Check } from 'lucide-react'
import { useT } from '@/components/LanguageProvider'

// Lead magnet: trade an email for Jordan's guide → creates a warm lead in the CRM.
export default function LeadMagnet({ slug }: { slug?: string }) {
  const { t } = useT()
  const [name, setName] = useState('')
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
        body: JSON.stringify({ type: 'guide', email: email.trim(), full_name: name.trim(), source_article: slug }),
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
    <div className="my-10 rounded-2xl border-2 border-wine/20 bg-wine-50/40 p-6 sm:p-7">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-wine text-white flex items-center justify-center shrink-0">
          <BookOpen size={20} />
        </div>
        <div>
          <h3 className="font-serif text-xl font-bold text-navy-900 leading-tight">{t('insights.magnet.title')}</h3>
          <p className="text-gray-600 text-sm mt-1">{t('insights.magnet.body')}</p>
        </div>
      </div>

      {done ? (
        <p className="flex items-center gap-2 text-green-600 font-semibold py-2">
          <Check size={18} /> {t('insights.magnet.done')}
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              className="input-field" placeholder={t('insights.magnet.name')}
              value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name"
            />
            <input
              className="input-field" type="email" placeholder={t('insights.magnet.email')} required
              value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email"
            />
          </div>
          {error && <p className="text-wine text-sm">{error}</p>}
          <button type="submit" disabled={sending} className="btn-wine w-full justify-center disabled:opacity-60">
            {sending ? t('insights.magnet.sending') : t('insights.magnet.button')}
          </button>
        </form>
      )}
    </div>
  )
}
