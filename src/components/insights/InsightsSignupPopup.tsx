'use client'

import { useEffect, useState } from 'react'
import { X, HeartHandshake, Check } from 'lucide-react'
import { useT } from '@/components/LanguageProvider'

const SEEN_KEY = 'jp-insights-signup'

// Tasteful engagement popup on the Insights pages: appears once (per device)
// after the reader engages, inviting them to register so Jordan can help them.
// Submits to /api/forms → a real warm lead in the CRM (push + auto-reply).
export default function InsightsSignupPopup() {
  const { t } = useT()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    try { if (localStorage.getItem(SEEN_KEY)) return } catch {}

    let fired = false
    const fire = () => {
      if (fired) return
      fired = true
      setOpen(true)
      try { localStorage.setItem(SEEN_KEY, '1') } catch {}
      window.removeEventListener('scroll', onScroll)
    }
    const onScroll = () => {
      const ratio = (window.scrollY + window.innerHeight) / Math.max(document.body.scrollHeight, 1)
      if (ratio > 0.45) fire()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    const timer = setTimeout(fire, 30000) // fallback if they don't scroll much
    return () => { window.removeEventListener('scroll', onScroll); clearTimeout(timer) }
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError(t('insights.error')); return }
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError(t('insights.error')); return }
    setSending(true); setError('')
    try {
      const res = await fetch('/api/forms', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_type: 'contact',
          full_name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          source: 'Website Popup',
          message: 'Registered from the Insights popup — wants help buying/selling/investing.',
        }),
      })
      const d = await res.json()
      if (!res.ok || !d.success) { setError(t('insights.error')); return }
      setDone(true)
      setTimeout(() => setOpen(false), 2800)
    } catch {
      setError(t('insights.error'))
    } finally {
      setSending(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)} />
      <div className="relative bg-white rounded-3xl shadow-premium w-full max-w-md animate-modal-pop overflow-hidden">
        <button type="button" onClick={() => setOpen(false)} className="absolute top-3 right-3 z-10 w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center text-gray-400 hover:text-navy-900" aria-label="Close"><X size={18} /></button>

        <div className="bg-gradient-to-br from-navy-900 to-navy-800 px-7 pt-7 pb-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-wine text-white flex items-center justify-center mx-auto mb-3"><HeartHandshake size={22} /></div>
          <p className="text-sky-300 text-xs font-bold uppercase tracking-widest mb-1">{t('insights.popup.eyebrow')}</p>
          <h3 className="font-serif text-xl font-bold text-white leading-tight">{t('insights.popup.title')}</h3>
        </div>

        <div className="p-7">
          {done ? (
            <p className="flex items-center justify-center gap-2 text-green-600 font-semibold py-4 text-center">
              <Check size={18} /> {t('insights.popup.done')}
            </p>
          ) : (
            <>
              <p className="text-gray-500 text-sm text-center mb-5">{t('insights.popup.body')}</p>
              <form onSubmit={submit} className="space-y-3">
                <input className="input-field" placeholder={t('insights.popup.name')} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
                <input className="input-field" type="email" required placeholder={t('insights.popup.email')} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                <input className="input-field" type="tel" placeholder={t('insights.popup.phone')} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
                {error && <p className="text-wine text-sm">{error}</p>}
                <button type="submit" disabled={sending} className="btn-wine w-full justify-center disabled:opacity-60">
                  {sending ? t('insights.popup.sending') : t('insights.popup.cta')}
                </button>
              </form>
              <button type="button" onClick={() => setOpen(false)} className="block w-full text-center text-gray-400 text-xs mt-3 hover:text-gray-600">
                {t('insights.popup.dismiss')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
