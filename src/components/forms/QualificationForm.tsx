'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowRight, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react'
import { AREAS, TIMELINES, FINANCING_OPTIONS } from '@/lib/utils'
import { useT } from '@/components/LanguageProvider'
import { isValidName, isValidPhone, isValidEmailFormat, stripDigits, stripNonPhone } from '@/lib/validate'
import { useAntiSpam } from '@/components/forms/useAntiSpam'

interface FormData {
  intent: string
  // contact (only collected when the lead isn't already known)
  full_name: string
  email: string
  phone: string
  // buyer
  budget_min: string
  budget_max: string
  timeline: string
  financing_status: string
  preferred_area: string
  property_type: string
  bedrooms: string
  must_haves: string
  // seller
  property_address: string
  condition: string
  why_selling: string
  occupancy: string
  expected_price: string
  mortgage_balance: string
  // shared
  motivation: string
  best_time: string
  contact_method: string
}

export default function QualificationForm({ leadId, firstName, known = true }: { leadId: string; firstName: string; known?: boolean }) {
  const { t } = useT()
  const { honeypot, stamp } = useAntiSpam()
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register, handleSubmit, trigger, watch, formState: { errors } } = useForm<FormData>({ mode: 'onBlur', defaultValues: { intent: 'Buy' } })

  const intent = watch('intent')
  const isSeller = intent === 'Sell'
  const totalSteps = 4

  const next = async () => {
    let fields: (keyof FormData)[] = []
    if (step === 1) fields = ['intent']
    else if (step === 2) fields = isSeller ? ['property_address', 'condition'] : ['budget_max', 'timeline']
    else if (step === 3) fields = isSeller ? ['why_selling', 'timeline'] : ['preferred_area']
    const ok = await trigger(fields)
    if (ok) setStep((s) => Math.min(s + 1, totalSteps))
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/qualify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stamp({
          lead_id: leadId,
          ...data,
          budget_min: data.budget_min ? Number(data.budget_min) : null,
          budget_max: data.budget_max ? Number(data.budget_max) : null,
          expected_price: data.expected_price ? Number(data.expected_price) : null,
        })),
      })
      const d = await res.json().catch(() => ({ success: false }))
      if (!res.ok || !d.success) {
        setError(t('forms.error'))
        return
      }
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again or call 305-799-6973.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={32} className="text-green-500" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-navy-900 mb-2">{t('forms.qualify.successTitle').replace('{name}', firstName)}</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          {isSeller ? t('forms.qualify.successSeller') : t('forms.qualify.successBuyer')}
        </p>
      </div>
    )
  }

  // Collected only when the lead isn't already known (resilient/broken-link path).
  const contactBlock = !known ? (
    <div className="space-y-4 pb-4 mb-2 border-b border-gray-100">
      <p className="text-sm text-gray-600 font-medium">{t('forms.qualify.contactIntro')}</p>
      <div>
        <label className="label">{t('forms.fullName')} *</label>
        <input {...register('full_name', { required: 'Required', validate: (v: string) => isValidName(v) || t('forms.invalidName'), onChange: (e) => { e.target.value = stripDigits(e.target.value) } })} className="input-field" placeholder={t('forms.namePlaceholder')} />
        {errors.full_name && <p className="text-wine text-xs mt-1">{String(errors.full_name.message || t('forms.invalidName'))}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">{t('forms.email')} *</label>
          <input {...register('email', { required: 'Required', validate: (v: string) => isValidEmailFormat(v) || t('forms.invalidEmail') })} type="email" className="input-field" placeholder="you@email.com" />
          {errors.email && <p className="text-wine text-xs mt-1">{String(errors.email.message || t('forms.invalidEmail'))}</p>}
        </div>
        <div>
          <label className="label">{t('forms.phone')}</label>
          <input {...register('phone', { validate: (v: string) => !v || isValidPhone(v) || t('forms.invalidPhone'), onChange: (e) => { e.target.value = stripNonPhone(e.target.value) } })} type="tel" inputMode="tel" className="input-field" placeholder="305-555-0123" />
          {errors.phone && <p className="text-wine text-xs mt-1">{String(errors.phone.message || t('forms.invalidPhone'))}</p>}
        </div>
      </div>
    </div>
  ) : null

  return (
    <div>
      <div className="flex items-center gap-2 mb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < step ? 'bg-wine' : 'bg-gray-100'}`} />
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {honeypot}
        {/* Step 1 — Intent (shared) */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="font-serif text-xl font-bold text-navy-900 text-center">{t('forms.qualify.intentTitle')}</h3>
            <div className="grid grid-cols-2 gap-3">
              {['Buy', 'Sell', 'Invest', 'Rent'].map((opt) => (
                <label key={opt} className="cursor-pointer">
                  <input type="radio" value={opt} {...register('intent', { required: true })} className="peer sr-only" />
                  <div className="p-4 rounded-xl border-2 border-gray-200 text-center font-semibold text-navy-700 peer-checked:border-wine peer-checked:bg-wine-50 peer-checked:text-wine transition-all hover:border-gray-300">
                    {opt === 'Buy' ? t('forms.qualify.intentBuy') : opt === 'Sell' ? t('forms.qualify.intentSell') : opt === 'Invest' ? t('forms.qualify.intentInvest') : t('forms.qualify.intentRent')}
                  </div>
                </label>
              ))}
            </div>
            <button type="button" onClick={next} className="btn-wine w-full justify-center py-4">{t('forms.continue')} <ArrowRight size={16} /></button>
          </div>
        )}

        {/* ═══ SELLER FLOW ═══ */}
        {isSeller && step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="font-serif text-xl font-bold text-navy-900 text-center">{t('forms.qualify.sellerStep2')}</h3>
            <div>
              <label className="label">{t('forms.qualify.propAddress')} *</label>
              <input {...register('property_address', { required: 'Required' })} className="input-field" placeholder="123 Brickell Ave, Unit 1500" />
              {errors.property_address && <p className="text-wine text-xs mt-1">{t('forms.qualify.propAddress')}</p>}
            </div>
            <div>
              <label className="label">{t('forms.qualify.propType')}</label>
              <select {...register('property_type')} className="input-field">
                <option>Condo</option><option>Single Family Home</option><option>Townhouse</option><option>Multi-Family</option><option>Land</option>
              </select>
            </div>
            <div>
              <label className="label">{t('forms.qualify.condition')} *</label>
              <select {...register('condition', { required: true })} className="input-field">
                <option value="">Select…</option>
                <option>Excellent — recently renovated</option>
                <option>Good — well maintained</option>
                <option>Average — some updates needed</option>
                <option>Needs work</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary" aria-label={t('forms.back')}><ArrowLeft size={16} /></button>
              <button type="button" onClick={next} className="btn-wine flex-1 justify-center py-4">{t('forms.continue')} <ArrowRight size={16} /></button>
            </div>
          </div>
        )}

        {isSeller && step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="font-serif text-xl font-bold text-navy-900 text-center">{t('forms.qualify.sellerStep3')}</h3>
            <div>
              <label className="label">{t('forms.qualify.whySelling')} *</label>
              <select {...register('why_selling', { required: true })} className="input-field">
                <option value="">Select…</option>
                <option>Upgrading to a bigger home</option>
                <option>Downsizing</option>
                <option>Relocating</option>
                <option>Investment / cashing out</option>
                <option>Financial reasons</option>
                <option>Just exploring my options</option>
              </select>
            </div>
            <div>
              <label className="label">{t('forms.qualify.whenSell')} *</label>
              <select {...register('timeline', { required: true })} className="input-field">
                {TIMELINES.map((tl) => <option key={tl}>{tl}</option>)}
              </select>
            </div>
            <div>
              <label className="label">{t('forms.qualify.occupancy')}</label>
              <select {...register('occupancy')} className="input-field">
                <option>Owner-occupied (I live there)</option>
                <option>Vacant</option>
                <option>Tenant-occupied (rented)</option>
                <option>Second home</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="btn-secondary" aria-label={t('forms.back')}><ArrowLeft size={16} /></button>
              <button type="button" onClick={next} className="btn-wine flex-1 justify-center py-4">{t('forms.continue')} <ArrowRight size={16} /></button>
            </div>
          </div>
        )}

        {isSeller && step === 4 && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="font-serif text-xl font-bold text-navy-900 text-center">{t('forms.qualify.almostDone')}</h3>
            {contactBlock}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{t('forms.qualify.expectedPrice')}</label>
                <input {...register('expected_price')} type="number" className="input-field" placeholder="850,000" />
              </div>
              <div>
                <label className="label">{t('forms.qualify.mortgage')}</label>
                <input {...register('mortgage_balance')} type="number" className="input-field" placeholder="optional" />
              </div>
            </div>
            <div>
              <label className="label">{t('forms.qualify.elseKnow')}</label>
              <textarea {...register('motivation')} rows={3} className="input-field resize-none" placeholder="Recent upgrades, urgency, special circumstances…" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{t('forms.qualify.contactMethod')}</label>
                <select {...register('contact_method')} className="input-field"><option>Call</option><option>Text</option><option>WhatsApp</option><option>Email</option></select>
              </div>
              <div>
                <label className="label">{t('forms.qualify.bestTime')}</label>
                <select {...register('best_time')} className="input-field"><option>Morning</option><option>Afternoon</option><option>Evening</option><option>Anytime</option></select>
              </div>
            </div>
            {error && <p className="text-wine text-sm text-center font-medium">{error}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(3)} className="btn-secondary" aria-label={t('forms.back')}><ArrowLeft size={16} /></button>
              <button type="submit" disabled={loading} className="btn-wine cta-shine flex-1 justify-center py-4 disabled:opacity-60">
                {loading ? t('forms.submitting') : <>{t('forms.qualify.submitSeller')} <Sparkles size={16} /></>}
              </button>
            </div>
          </div>
        )}

        {/* ═══ BUYER / INVESTOR / RENTER FLOW ═══ */}
        {!isSeller && step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="font-serif text-xl font-bold text-navy-900 text-center">{t('forms.qualify.buyerStep2')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{t('forms.budgetMin')}</label>
                <input {...register('budget_min')} type="number" className="input-field" placeholder="300,000" />
              </div>
              <div>
                <label className="label">{t('forms.budgetMax')} *</label>
                <input {...register('budget_max', { required: 'Required' })} type="number" className="input-field" placeholder="800,000" />
                {errors.budget_max && <p className="text-wine text-xs mt-1">{t('forms.budgetMax')}</p>}
              </div>
            </div>
            <div>
              <label className="label">{t('forms.qualify.whenMove')} *</label>
              <select {...register('timeline', { required: true })} className="input-field">{TIMELINES.map((tl) => <option key={tl}>{tl}</option>)}</select>
            </div>
            <div>
              <label className="label">{t('forms.financing')}</label>
              <select {...register('financing_status')} className="input-field">
                <option value="">{t('forms.select')}</option>{FINANCING_OPTIONS.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary" aria-label={t('forms.back')}><ArrowLeft size={16} /></button>
              <button type="button" onClick={next} className="btn-wine flex-1 justify-center py-4">{t('forms.continue')} <ArrowRight size={16} /></button>
            </div>
          </div>
        )}

        {!isSeller && step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="font-serif text-xl font-bold text-navy-900 text-center">{t('forms.qualify.buyerStep3')}</h3>
            <div>
              <label className="label">{t('forms.preferredArea')} *</label>
              <select {...register('preferred_area', { required: true })} className="input-field">
                <option value="">{t('forms.select')}</option>{AREAS.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{t('forms.qualify.propType')}</label>
                <select {...register('property_type')} className="input-field"><option value="">Any</option><option>Condo</option><option>Single Family Home</option><option>Townhouse</option><option>Pre-Construction</option></select>
              </div>
              <div>
                <label className="label">{t('forms.bedrooms')}</label>
                <select {...register('bedrooms')} className="input-field"><option value="">Any</option>{['Studio', '1', '2', '3', '4', '5+'].map((b) => <option key={b}>{b}</option>)}</select>
              </div>
            </div>
            <div>
              <label className="label">{t('forms.qualify.mustHaves')}</label>
              <input {...register('must_haves')} className="input-field" placeholder={t('forms.qualify.mustHavesPh')} />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="btn-secondary" aria-label={t('forms.back')}><ArrowLeft size={16} /></button>
              <button type="button" onClick={next} className="btn-wine flex-1 justify-center py-4">{t('forms.continue')} <ArrowRight size={16} /></button>
            </div>
          </div>
        )}

        {!isSeller && step === 4 && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="font-serif text-xl font-bold text-navy-900 text-center">{t('forms.qualify.almostDone')}</h3>
            {contactBlock}
            <div>
              <label className="label">{t('forms.qualify.buyerMotivation')}</label>
              <textarea {...register('motivation')} rows={3} className="input-field resize-none" placeholder="Tell Jordan what matters most — location, timing, getting the best deal, a fresh start…" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{t('forms.qualify.contactMethod')}</label>
                <select {...register('contact_method')} className="input-field"><option>Call</option><option>Text</option><option>WhatsApp</option><option>Email</option></select>
              </div>
              <div>
                <label className="label">{t('forms.qualify.bestTime')}</label>
                <select {...register('best_time')} className="input-field"><option>Morning</option><option>Afternoon</option><option>Evening</option><option>Anytime</option></select>
              </div>
            </div>
            {error && <p className="text-wine text-sm text-center font-medium">{error}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(3)} className="btn-secondary" aria-label={t('forms.back')}><ArrowLeft size={16} /></button>
              <button type="submit" disabled={loading} className="btn-wine cta-shine flex-1 justify-center py-4 disabled:opacity-60">
                {loading ? t('forms.submitting') : <>{t('forms.qualify.submitBuyer')} <Sparkles size={16} /></>}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
