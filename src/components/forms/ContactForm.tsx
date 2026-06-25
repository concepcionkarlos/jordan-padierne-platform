'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Send, CheckCircle2 } from 'lucide-react'
import type { ContactFormData } from '@/lib/types'
import { AREAS, CLIENT_TYPES, TIMELINES, BUDGET_RANGES } from '@/lib/utils'
import { useT } from '@/components/LanguageProvider'
import { isValidName, isValidPhone, isValidEmailFormat, stripDigits, stripNonPhone } from '@/lib/validate'
import { useAntiSpam } from '@/components/forms/useAntiSpam'

export default function ContactForm() {
  const { t } = useT()
  const { honeypot, stamp } = useAntiSpam()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>({ mode: 'onBlur', defaultValues: { source: 'Website' } })

  const onSubmit = async (data: ContactFormData) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stamp({ form_type: 'contact', ...data })),
      })
      if (!res.ok) throw new Error('Submission failed')
      setSubmitted(true)
      reset()
    } catch {
      setError(t('forms.error'))
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 size={48} className="text-sky-500 mx-auto mb-4" />
        <h3 className="font-serif text-2xl font-bold text-navy-900 mb-2">{t('forms.verifyTitle')}</h3>
        <p className="text-gray-500">{t('forms.verifySub')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {honeypot}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="label">{t('forms.fullName')} *</label>
          <input
            {...register('full_name', { required: true, validate: (v: string) => isValidName(v) || t('forms.invalidName'),
              onChange: (e) => { e.target.value = stripDigits(e.target.value) } })}
            className="input-field"
            placeholder={t('forms.namePlaceholder')}
          />
          {errors.full_name && <p className="text-wine text-xs mt-1">{String(errors.full_name.message || t('forms.invalidName'))}</p>}
        </div>
        <div>
          <label className="label">{t('forms.phone')} *</label>
          <input
            {...register('phone', { required: true, validate: (v: string) => !v || isValidPhone(v) || t('forms.invalidPhone'),
              onChange: (e) => { e.target.value = stripNonPhone(e.target.value) } })}
            type="tel"
            inputMode="tel"
            className="input-field"
            placeholder="(305) 000-0000"
          />
          {errors.phone && <p className="text-wine text-xs mt-1">{String(errors.phone.message || t('forms.invalidPhone'))}</p>}
        </div>
      </div>

      <div>
        <label className="label">{t('forms.email')} *</label>
        <input
          {...register('email', {
            required: true,
            validate: (v: string) => isValidEmailFormat(v) || t('forms.invalidEmail'),
          })}
          type="email"
          className="input-field"
          placeholder="your@email.com"
        />
        {errors.email && <p className="text-wine text-xs mt-1">{String(errors.email.message || t('forms.invalidEmail'))}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="label">{t('forms.contact.iam')}</label>
          <select {...register('client_type')} className="input-field">
            {CLIENT_TYPES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">{t('forms.preferredArea')}</label>
          <select {...register('preferred_area')} className="input-field">
            <option value="">{t('forms.select')}</option>
            {AREAS.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="label">{t('forms.budgetRange')}</label>
          <select {...register('budget')} className="input-field">
            <option value="">{t('forms.select')}</option>
            {BUDGET_RANGES.map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="label">{t('forms.timeline')}</label>
          <select {...register('timeline')} className="input-field">
            <option value="">{t('forms.select')}</option>
            {TIMELINES.map((tl) => <option key={tl}>{tl}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="label">{t('forms.contact.messageLabel')}</label>
        <textarea
          {...register('message')}
          rows={4}
          className="input-field resize-none"
          placeholder={t('forms.contact.messagePlaceholder')}
        />
      </div>

      <input type="hidden" {...register('source')} value="Website" />

      {error && (
        <div className="bg-wine-50 border border-wine-100 text-wine rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-wine w-full justify-center py-4 text-base disabled:opacity-60"
      >
        {loading ? t('forms.sending') : (
          <>
            <Send size={16} />
            {t('forms.contact.submit')}
          </>
        )}
      </button>
    </form>
  )
}
