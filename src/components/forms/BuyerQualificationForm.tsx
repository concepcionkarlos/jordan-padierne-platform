'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Send, CheckCircle2 } from 'lucide-react'
import { AREAS, TIMELINES, FINANCING_OPTIONS } from '@/lib/utils'
import { useT } from '@/components/LanguageProvider'

interface FormData {
  full_name: string
  email: string
  phone: string
  preferred_area: string
  budget_min: string
  budget_max: string
  bedrooms: string
  timeline: string
  financing_status: string
  pre_approval: boolean
  message: string
}

export default function BuyerQualificationForm() {
  const { t } = useT()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_type: 'buyer_qualification', ...data }),
      })
      setSubmitted(true)
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
          <input {...register('full_name', { required: true })} className="input-field" placeholder={t('forms.namePlaceholder')} />
        </div>
        <div>
          <label className="label">{t('forms.phone')} *</label>
          <input {...register('phone', { required: true })} type="tel" className="input-field" placeholder="(305) 000-0000" />
        </div>
      </div>
      <div>
        <label className="label">{t('forms.email')} *</label>
        <input {...register('email', { required: true })} type="email" className="input-field" placeholder="your@email.com" />
      </div>
      <div>
        <label className="label">{t('forms.preferredArea')}</label>
        <select {...register('preferred_area')} className="input-field">
          <option value="">{t('forms.anyArea')}</option>
          {AREAS.map((a) => <option key={a}>{a}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">{t('forms.budgetMin')}</label>
          <input {...register('budget_min')} type="number" className="input-field" placeholder="300,000" />
        </div>
        <div>
          <label className="label">{t('forms.budgetMax')}</label>
          <input {...register('budget_max')} type="number" className="input-field" placeholder="800,000" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">{t('forms.bedrooms')}</label>
          <select {...register('bedrooms')} className="input-field">
            <option value="">{t('forms.select')}</option>
            {['1', '2', '3', '4', '5+'].map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="label">{t('forms.timeline')}</label>
          <select {...register('timeline')} className="input-field">
            {TIMELINES.map((tl) => <option key={tl}>{tl}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="label">{t('forms.financing')}</label>
        <select {...register('financing_status')} className="input-field">
          {FINANCING_OPTIONS.map((f) => <option key={f}>{f}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-3">
        <input {...register('pre_approval')} type="checkbox" id="pre_approval" className="w-4 h-4 accent-sky-500" />
        <label htmlFor="pre_approval" className="text-sm text-navy-700">{t('forms.buyer.preApproval')}</label>
      </div>
      <div>
        <label className="label">{t('forms.buyer.elseLabel')}</label>
        <textarea {...register('message')} rows={3} className="input-field resize-none" placeholder={t('forms.buyer.elsePlaceholder')} />
      </div>
      <button type="submit" disabled={loading} className="btn-wine w-full justify-center py-4 text-base disabled:opacity-60">
        {loading ? t('forms.submitting') : <><Send size={16} /> {t('forms.buyer.submit')}</>}
      </button>
    </form>
  )
}
