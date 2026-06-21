'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Home, ArrowRight, ArrowLeft, CheckCircle2, TrendingUp } from 'lucide-react'
import { AREAS, TIMELINES } from '@/lib/utils'
import { useT } from '@/components/LanguageProvider'

interface FormData {
  property_address: string
  city: string
  property_type: string
  bedrooms: string
  bathrooms: string
  sqft: string
  condition: string
  timeline: string
  reason: string
  full_name: string
  email: string
  phone: string
}

export default function HomeValuationForm() {
  const { t } = useT()
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register, handleSubmit, trigger, formState: { errors } } = useForm<FormData>()

  const next = async () => {
    const fields: (keyof FormData)[] = step === 1
      ? ['property_address', 'city', 'property_type']
      : ['bedrooms', 'bathrooms', 'condition']
    const ok = await trigger(fields)
    if (ok) setStep((s) => s + 1)
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_type: 'home_valuation', source: 'Website', ...data }),
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

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={32} className="text-green-500" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-navy-900 mb-2">{t('forms.verifyTitle')}</h3>
        <p className="text-gray-500 max-w-md mx-auto">{t('forms.verifySub')}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-wine' : 'bg-gray-100'}`} />
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Property */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center mb-2">
              <Home size={28} className="text-wine mx-auto mb-2" />
              <h3 className="font-serif text-xl font-bold text-navy-900">{t('forms.homevalue.step1')}</h3>
            </div>
            <div>
              <label className="label">{t('forms.homevalue.address')} *</label>
              <input {...register('property_address', { required: 'Required' })} className="input-field" placeholder="123 Brickell Ave, Unit 1500" />
              {errors.property_address && <p className="text-wine text-xs mt-1">{t('forms.homevalue.address')}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{t('forms.homevalue.cityArea')} *</label>
                <select {...register('city', { required: true })} className="input-field">
                  <option value="">{t('forms.select')}</option>
                  {AREAS.map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="label">{t('forms.homevalue.propertyType')} *</label>
                <select {...register('property_type', { required: true })} className="input-field">
                  <option value="">{t('forms.select')}</option>
                  <option>Condo</option>
                  <option>Single Family Home</option>
                  <option>Townhouse</option>
                  <option>Multi-Family</option>
                  <option>Land</option>
                </select>
              </div>
            </div>
            <button type="button" onClick={next} className="btn-wine w-full justify-center py-4">
              {t('forms.continue')} <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center mb-2">
              <h3 className="font-serif text-xl font-bold text-navy-900">{t('forms.homevalue.step2')}</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">{t('forms.homevalue.beds')} *</label>
                <select {...register('bedrooms', { required: true })} className="input-field">
                  {['Studio', '1', '2', '3', '4', '5+'].map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="label">{t('forms.homevalue.baths')} *</label>
                <select {...register('bathrooms', { required: true })} className="input-field">
                  {['1', '1.5', '2', '2.5', '3', '4+'].map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="label">{t('forms.homevalue.sqft')}</label>
                <input {...register('sqft')} type="number" className="input-field" placeholder="1200" />
              </div>
            </div>
            <div>
              <label className="label">{t('forms.homevalue.condition')} *</label>
              <select {...register('condition', { required: true })} className="input-field">
                <option value="">{t('forms.select')}</option>
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

        {/* Step 3: Contact */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center mb-2">
              <TrendingUp size={28} className="text-wine mx-auto mb-2" />
              <h3 className="font-serif text-xl font-bold text-navy-900">{t('forms.homevalue.step3')}</h3>
            </div>
            <div>
              <label className="label">{t('forms.homevalue.sellWhen')}</label>
              <select {...register('timeline')} className="input-field">
                <option value="">{t('forms.select')}</option>
                {TIMELINES.map((tl) => <option key={tl}>{tl}</option>)}
              </select>
            </div>
            <div>
              <label className="label">{t('forms.fullName')} *</label>
              <input {...register('full_name', { required: 'Required' })} className="input-field" placeholder={t('forms.namePlaceholder')} />
              {errors.full_name && <p className="text-wine text-xs mt-1">{t('forms.fullName')}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{t('forms.email')} *</label>
                <input {...register('email', { required: 'Required' })} type="email" className="input-field" placeholder="you@email.com" />
                {errors.email && <p className="text-wine text-xs mt-1">{t('forms.email')}</p>}
              </div>
              <div>
                <label className="label">{t('forms.phone')} *</label>
                <input {...register('phone', { required: 'Required' })} type="tel" className="input-field" placeholder="(305) 000-0000" />
                {errors.phone && <p className="text-wine text-xs mt-1">{t('forms.phone')}</p>}
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="btn-secondary" aria-label={t('forms.back')}><ArrowLeft size={16} /></button>
              <button type="submit" disabled={loading} className="btn-wine flex-1 justify-center py-4 disabled:opacity-60">
                {loading ? t('forms.sending') : <>{t('forms.homevalue.submit')} <ArrowRight size={16} /></>}
              </button>
            </div>
            {error && <p className="text-wine text-sm text-center">{error}</p>}
            <p className="text-center text-gray-500 text-xs">{t('forms.homevalue.disclaimer')}</p>
          </div>
        )}
      </form>
    </div>
  )
}
