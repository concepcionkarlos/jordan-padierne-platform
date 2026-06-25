'use client'

import { useEffect, useState } from 'react'
import { X, Gift, ArrowRight, CheckCircle2, Phone } from 'lucide-react'
import { useT } from '@/components/LanguageProvider'
import { useProfile } from '@/components/ProfileProvider'
import { isValidName, isValidPhone, isValidEmailFormat, stripDigits, stripNonPhone } from '@/lib/validate'
import { useAntiSpam } from '@/components/forms/useAntiSpam'

// Smart conversion modal: appears once when the visitor scrolls deep OR shows
// exit-intent on desktop. Offers a free home valuation / consultation.
// Dismissal is remembered so it never nags.

export default function LeadCaptureModal() {
  const { t } = useT()
  const profile = useProfile()
  const { honeypot, stamp } = useAntiSpam()
  const [show, setShow] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ full_name: '', phone: '', email: '' })

  useEffect(() => {
    if (typeof window === 'undefined') return
    // Remembered across visits (not just the session) so it never re-nags.
    try { if (localStorage.getItem('jp-lead-modal-seen')) return } catch {}

    let fired = false
    const trigger = () => {
      if (fired) return
      fired = true
      try { localStorage.setItem('jp-lead-modal-seen', '1') } catch {}
      setShow(true)
      cleanup()
    }

    // Pro timing: only after real engagement — deep scroll, exit intent, or a
    // relaxed delay, so it never feels pushy on a luxury brand.
    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight
      const pct = scrolled / document.documentElement.scrollHeight
      if (pct > 0.7) trigger()
    }
    const onMouseOut = (e: MouseEvent) => { if (e.clientY <= 0) trigger() }
    const timer = window.setTimeout(trigger, 35000)

    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('mouseout', onMouseOut)

    function cleanup() {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('mouseout', onMouseOut)
      window.clearTimeout(timer)
    }
    return cleanup
  }, [])

  // Escape-to-close + lock background scroll while open (a11y).
  useEffect(() => {
    if (!show) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShow(false) }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [show])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name.trim() || !form.phone.trim()) return
    if (!isValidName(form.full_name)) { setError(t('forms.invalidName')); return }
    if (!isValidPhone(form.phone)) { setError(t('forms.invalidPhone')); return }
    if (form.email.trim() && !isValidEmailFormat(form.email)) { setError(t('forms.invalidEmail')); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stamp({
          form_type: 'contact',
          full_name: form.full_name,
          phone: form.phone,
          email: form.email || 'no-email@placeholder.com',
          client_type: 'Buyer',
          message: '🎯 Requested FREE consultation via website popup — warm lead, reach out fast!',
          source: 'Website Popup',
        })),
      })
      const d = await res.json().catch(() => ({ success: false }))
      if (!res.ok || !d.success) { setError(t('forms.error')); return }
      setSubmitted(true)
    } catch {
      setError(t('forms.error'))
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm" onClick={() => setShow(false)} />

      <div role="dialog" aria-modal="true" className="relative w-full max-w-md bg-white rounded-3xl shadow-premium overflow-hidden animate-modal-pop">
        <button type="button" onClick={() => setShow(false)} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-gray-400 hover:text-navy-900 transition-colors" aria-label="Close">
          <X size={18} />
        </button>

        {/* Top accent band */}
        <div className="bg-gradient-to-br from-navy-900 to-navy-700 px-7 pt-8 pb-7 text-center relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-sky-500/20 rounded-full blur-2xl" />
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-wine flex items-center justify-center mx-auto mb-4 animate-float">
              <Gift size={26} className="text-white" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-white leading-tight">
              {submitted ? t('modal.thanksTitle') : t('modal.title')}
            </h2>
            <p className="text-navy-200 text-sm mt-2">
              {submitted ? t('modal.thanksSub') : t('modal.subtitle')}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-7">
          {submitted ? (
            <div className="text-center">
              <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" />
              <a href={profile.phoneHref} className="btn-wine w-full justify-center">
                <Phone size={16} /> {t('modal.callNow')} · {profile.phone}
              </a>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              {honeypot}
              <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: stripDigits(e.target.value) })} placeholder={t('modal.name')} className="input-field" required />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: stripNonPhone(e.target.value) })} type="tel" inputMode="tel" placeholder={t('modal.phone')} className="input-field" required />
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" placeholder={t('modal.email')} className="input-field" />
              <button type="submit" disabled={loading} className="btn-wine cta-shine w-full justify-center py-3.5 text-base disabled:opacity-60">
                {loading ? t('common.sending') : <>{t('modal.submit')} <ArrowRight size={16} /></>}
              </button>
              {error && <p className="text-wine text-sm text-center">{error}</p>}
              <p className="text-center text-gray-500 text-xs">{t('modal.fineprint')}</p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
