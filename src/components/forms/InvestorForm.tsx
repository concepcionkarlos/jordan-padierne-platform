'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Send, CheckCircle2 } from 'lucide-react'
import { AREAS, TIMELINES } from '@/lib/utils'
import { useT } from '@/components/LanguageProvider'
import { isValidName, isValidPhone, isValidEmailFormat, stripDigits, stripNonPhone } from '@/lib/validate'
import { useAntiSpam } from '@/components/forms/useAntiSpam'

interface FormData {
  full_name: string
  email: string
  phone: string
  investment_type: string
  preferred_area: string
  budget_min: string
  budget_max: string
  investment_goal: string
  timeline: string
  experience_level: string
  message: string
}

export default function InvestorForm() {
  const { t } = useT()
  const { honeypot, stamp } = useAntiSpam()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ mode: 'onBlur' })

  const onSubmit = async (data: FormData) => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stamp({ form_type: 'investor_inquiry', ...data })),
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
      <div className="text-center py-10">
        <CheckCircle2 size={44} className="text-sky-500 mx-auto mb-4" />
        <h3 className="font-serif text-xl font-bold text-navy-900 mb-2">{t('forms.verifyTitle')}</h3>
        <p className="text-gray-500 text-sm">{t('forms.verifySub')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {honeypot}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="label">{t('forms.fullName')} *</label>
          <input {...register('full_name', { required: true, validate: (v: string) => isValidName(v) || t('forms.invalidName'), onChange: (e) => { e.target.value = stripDigits(e.target.value) } })} className="input-field" placeholder={t('forms.namePlaceholder')} />
          {errors.full_name && <p className="text-wine text-xs mt-1">{String(errors.full_name.message || t('forms.invalidName'))}</p>}
        </div>
        <div>
          <label className="label">{t('forms.phone')} *</label>
          <input {...register('phone', { required: true, validate: (v: string) => !v || isValidPhone(v) || t('forms.invalidPhone'), onChange: (e) => { e.target.value = stripNonPhone(e.target.value) } })} type="tel" inputMode="tel" className="input-field" placeholder="(305) 000-0000" />
          {errors.phone && <p className="text-wine text-xs mt-1">{String(errors.phone.message || t('forms.invalidPhone'))}</p>}
        </div>
      </div>
      <div>
        <label className="label">{t('forms.email')} *</label>
        <input {...register('email', { required: true, validate: (v: string) => isValidEmailFormat(v) || t('forms.invalidEmail') })} type="email" className="input-field" placeholder="your@email.com" />
        {errors.email && <p className="text-wine text-xs mt-1">{String(errors.email.message || t('forms.invalidEmail'))}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="label">{t('forms.investor.type')}</label>
          <select {...register('investment_type')} className="input-field">
            <option>Pre-Construction</option>
            <option>Short-Term Rental (Airbnb)</option>
            <option>Long-Term Rental</option>
            <option>Fix &amp; Resell</option>
            <option>Land / Development</option>
            <option>Mixed Strategy</option>
          </select>
        </div>
        <div>
          <label className="label">{t('forms.preferredArea')}</label>
          <select {...register('preferred_area')} className="input-field">
            <option value="">{t('forms.anyArea')}</option>
            {AREAS.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">{t('forms.budgetMin')}</label>
          <input {...register('budget_min')} type="number" className="input-field" placeholder="300,000" />
        </div>
        <div>
          <label className="label">{t('forms.budgetMax')}</label>
          <input {...register('budget_max')} type="number" className="input-field" placeholder="2,000,000" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="label">{t('forms.investor.goal')}</label>
          <select {...register('investment_goal')} className="input-field">
            <option>Capital appreciation</option>
            <option>Rental income</option>
            <option>Both</option>
            <option>Portfolio diversification</option>
          </select>
        </div>
        <div>
          <label className="label">{t('forms.investor.experience')}</label>
          <select {...register('experience_level')} className="input-field">
            <option>First-time investor</option>
            <option>1-3 properties owned</option>
            <option>4-10 properties owned</option>
            <option>10+ properties</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label">{t('forms.timeline')}</label>
        <select {...register('timeline')} className="input-field">
          {TIMELINES.map((tl) => <option key={tl}>{tl}</option>)}
        </select>
      </div>
      <div>
        <label className="label">{t('forms.investor.messageLabel')}</label>
        <textarea {...register('message')} rows={3} className="input-field resize-none" placeholder={t('forms.investor.messagePlaceholder')} />
      </div>
      {error && <p className="text-wine text-sm text-center">{error}</p>}
      <button type="submit" disabled={loading} className="btn-wine w-full justify-center py-4 text-base disabled:opacity-60">
        {loading ? t('forms.submitting') : <><Send size={16} /> {t('forms.investor.submit')}</>}
      </button>
    </form>
  )
}
