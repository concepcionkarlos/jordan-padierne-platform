'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle2, Phone, Sparkles } from 'lucide-react'
import { useT } from '@/components/LanguageProvider'

export default function QuickLeadForm() {
  const { t } = useT()
  const [form, setForm] = useState({ full_name: '', phone: '', intent: 'Buy' })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name.trim() || !form.phone.trim()) return
    setLoading(true)
    try {
      const clientType = form.intent === 'Sell' ? 'Seller' : form.intent === 'Invest' ? 'Investor' : 'Buyer'
      await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_type: 'contact',
          full_name: form.full_name,
          phone: form.phone,
          email: 'no-email@placeholder.com',
          client_type: clientType,
          message: `🎯 Quick-start form — wants to: ${form.intent}. Warm lead, reach out fast!`,
          source: 'Website Popup',
        }),
      })
      setSubmitted(true)
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
              <a href="tel:+13057996973" className="btn-wine mt-5 inline-flex"><Phone size={16} /> 305-799-6973</a>
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
                <input
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder={t('quick.name')}
                  className="input-field"
                  required
                />
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  type="tel"
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

              <p className="text-center sm:text-left text-gray-400 text-xs mt-4">{t('quick.trust')}</p>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
