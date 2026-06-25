'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle2, Phone, Sparkles } from 'lucide-react'
import { useT } from '@/components/LanguageProvider'
import { useProfile } from '@/components/ProfileProvider'
import { isValidName, isValidPhone, stripDigits, stripNonPhone } from '@/lib/validate'
import { useAntiSpam } from '@/components/forms/useAntiSpam'

export default function QuickLeadForm() {
  const { t } = useT()
  const profile = useProfile()
  const { honeypot, stamp } = useAntiSpam()
  const [form, setForm] = useState({ full_name: '', phone: '', intent: 'Buy' })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name.trim() || !form.phone.trim()) return
    if (!isValidName(form.full_name)) { setError(t('forms.invalidName')); return }
    if (!isValidPhone(form.phone)) { setError(t('forms.invalidPhone')); return }
    setLoading(true); setError('')
    try {
      const clientType = form.intent === 'Sell' ? 'Seller' : form.intent === 'Invest' ? 'Investor' : 'Buyer'
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stamp({
          form_type: 'contact',
          full_name: form.full_name,
          phone: form.phone,
          email: 'no-email@placeholder.com',
          client_type: clientType,
          message: `🎯 Quick-start form — wants to: ${form.intent}. Warm lead, reach out fast!`,
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

  return (
    <section className="relative z-30 -mt-12 lg:-mt-16">
      <div className="container-max section-padding">
        <div className="bg-white rounded-3xl shadow-premium border border-gray-100 p-6 lg:p-8 max-w-5xl mx-auto">
          {submitted ? (
            <div className="text-center py-4">
              <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" />
              <h3 className="font-serif text-2xl font-bold text-navy-900 mb-1">{t('quick.thanksTitle')}</h3>
              <p className="text-gray-500">{t('quick.thanksSub')}</p>
              <a href={profile.phoneHref} className="btn-wine mt-5 inline-flex"><Phone size={16} /> {profile.phone}</a>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                <div>
                  <p className="text-wine font-bold text-xs uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <Sparkles size={12} /> {t('quick.eyebrow')}
                  </p>
                  <h2 className="font-serif text-xl lg:text-2xl font-bold text-navy-900">{t('quick.title')}</h2>
                </div>
              </div>

              <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {honeypot}
                <input
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: stripDigits(e.target.value) })}
                  placeholder={t('quick.name')}
                  className="input-field"
                  required
                />
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: stripNonPhone(e.target.value) })}
                  type="tel"
                  inputMode="tel"
                  placeholder={t('quick.phone')}
                  className="input-field"
                  required
                />
                <select value={form.intent} onChange={(e) => setForm({ ...form, intent: e.target.value })} className="input-field" aria-label={t('quick.intentLabel')}>
                  <option value="Buy">{t('quick.intent.buy')}</option>
                  <option value="Sell">{t('quick.intent.sell')}</option>
                  <option value="Invest">{t('quick.intent.invest')}</option>
                  <option value="Rent">{t('quick.intent.rent')}</option>
                </select>
                <button type="submit" disabled={loading} className="btn-wine cta-shine pulse-glow justify-center py-3.5 text-base disabled:opacity-60">
                  {loading ? '…' : <>{t('quick.cta')} <ArrowRight size={16} /></>}
                </button>
              </form>

              {error && <p className="text-wine text-sm mt-3">{error}</p>}
              <p className="text-center sm:text-left text-gray-500 text-xs mt-4">{t('quick.trust')}</p>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
