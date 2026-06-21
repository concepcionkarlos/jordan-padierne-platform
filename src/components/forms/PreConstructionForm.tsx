'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Send, CheckCircle2 } from 'lucide-react'
import { AREAS, TIMELINES, BUDGET_RANGES } from '@/lib/utils'
import { useT } from '@/components/LanguageProvider'
import { isValidName, isValidPhone, isValidEmailFormat, stripDigits, stripNonPhone } from '@/lib/validate'

interface FormData {
  full_name: string
  email: string
  phone: string
  preferred_project: string
  preferred_area: string
  budget: string
  unit_type: string
  timeline: string
  is_investor: boolean
  message: string
}

export default function PreConstructionForm() {
  const { t } = useT()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_type: 'pre_construction_interest', ...data }),
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
          <label className="label">{t('forms.preferredArea')}</label>
          <select {...register('preferred_area')} className="input-field">
            <option value="">{t('forms.anyArea')}</option>
            {AREAS.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className="label">{t('forms.precon.unitType')}</label>
          <select {...register('unit_type')} className="input-field">
            <option>Studio</option>
            <option>1 Bedroom</option>
            <option>2 Bedrooms</option>
            <option>3 Bedrooms</option>
            <option>Penthouse</option>
            <option>Flexible</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label">{t('forms.budgetRange')}</label>
        <select {...register('budget')} className="input-field">
          <option value="">{t('forms.selectRange')}</option>
          {BUDGET_RANGES.map((b) => <option key={b}>{b}</option>)}
        </select>
      </div>
      <div>
        <label className="label">{t('forms.precon.timelineLabel')}</label>
        <select {...register('timeline')} className="input-field">
          {TIMELINES.map((tl) => <option key={tl}>{tl}</option>)}
        </select>
      </div>
      <div>
        <label className="label">{t('forms.precon.projectLabel')}</label>
        <input {...register('preferred_project')} className="input-field" placeholder={t('forms.precon.projectPlaceholder')} />
      </div>
      <div className="flex items-center gap-3">
        <input {...register('is_investor')} type="checkbox" id="is_investor" className="w-4 h-4 accent-sky-500" />
        <label htmlFor="is_investor" className="text-sm text-navy-700">{t('forms.precon.investor')}</label>
      </div>
      <div>
        <label className="label">{t('forms.precon.commentsLabel')}</label>
        <textarea {...register('message')} rows={3} className="input-field resize-none" placeholder={t('forms.precon.commentsPlaceholder')} />
      </div>
      {error && <p className="text-wine text-sm text-center">{error}</p>}
      <button type="submit" disabled={loading} className="btn-wine w-full justify-center py-4 text-base disabled:opacity-60">
        {loading ? t('forms.submitting') : <><Send size={16} /> {t('forms.precon.submit')}</>}
      </button>
    </form>
  )
}
