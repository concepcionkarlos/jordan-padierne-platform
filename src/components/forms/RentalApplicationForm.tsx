'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowRight, ArrowLeft, CheckCircle2, Home, Briefcase, Users, ShieldCheck } from 'lucide-react'
import { useT } from '@/components/LanguageProvider'

interface RentalData {
  full_name: string
  email: string
  phone: string
  date_of_birth: string
  ssn_last4: string
  current_address: string
  current_city: string
  current_state: string
  current_zip: string
  housing_status: string
  monthly_payment: string
  residence_length: string
  prev_address: string
  prev_city: string
  prev_state: string
  prev_zip: string
  employer: string
  position: string
  employment_type: string
  annual_income: string
  employer_phone: string
  employment_length: string
  employer_address: string
  has_coapplicant: boolean
  co_full_name: string
  co_dob: string
  co_phone: string
  co_email: string
  co_employer: string
  co_income: string
  property_address: string
  desired_move_in: string
  occupants: string
  pets: string
  emergency_name: string
  emergency_phone: string
  emergency_relationship: string
  reference_name: string
  reference_phone: string
  authorize: boolean
}

const STEPS = [
  { icon: Home, key: 'forms.rental.stepApplicant' },
  { icon: Briefcase, key: 'forms.rental.stepEmployment' },
  { icon: Users, key: 'forms.rental.stepCoapplicant' },
  { icon: ShieldCheck, key: 'forms.rental.stepReview' },
]

export default function RentalApplicationForm() {
  const { t } = useT()
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register, handleSubmit, trigger, watch, formState: { errors } } = useForm<RentalData>({
    defaultValues: { housing_status: 'Rent', employment_type: 'Salary', has_coapplicant: false, authorize: false },
  })

  const hasCo = watch('has_coapplicant')
  const total = 4

  const next = async () => {
    let fields: (keyof RentalData)[] = []
    if (step === 1) fields = ['full_name', 'email', 'phone', 'current_address']
    else if (step === 2) fields = ['employer', 'annual_income']
    const ok = fields.length ? await trigger(fields) : true
    if (ok) setStep((s) => Math.min(s + 1, total))
  }

  const onSubmit = async (data: RentalData) => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/forms', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_type: 'rental_application', source: 'Website', ...data }),
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
          <CheckCircle2 size={34} className="text-green-500" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-navy-900 mb-2">{t('forms.verifyTitle')}</h3>
        <p className="text-gray-500 max-w-md mx-auto">{t('forms.verifySub')}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Stepper */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((s, i) => {
          const n = i + 1
          const Icon = s.icon
          const active = n === step
          const done = n < step
          return (
            <div key={s.key} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${active ? 'bg-wine text-white' : done ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {done ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                </div>
                <span className={`text-[10px] mt-1.5 font-medium ${active ? 'text-wine' : 'text-gray-400'}`}>{t(s.key)}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 mb-4 ${done ? 'bg-green-500' : 'bg-gray-100'}`} />}
            </div>
          )
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1 — Applicant */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="font-serif text-xl font-bold text-navy-900">{t('forms.rental.hApplicant')}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">{t('forms.fullName')} *</label>
                <input {...register('full_name', { required: 'Required' })} className="input-field" placeholder={t('forms.namePlaceholder')} />
                {errors.full_name && <p className="text-wine text-xs mt-1">{t('forms.fullName')}</p>}
              </div>
              <div>
                <label className="label">{t('forms.phone')} *</label>
                <input {...register('phone', { required: 'Required' })} type="tel" className="input-field" placeholder="(305) 000-0000" />
                {errors.phone && <p className="text-wine text-xs mt-1">{t('forms.phone')}</p>}
              </div>
              <div>
                <label className="label">{t('forms.email')} *</label>
                <input {...register('email', { required: 'Required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })} type="email" className="input-field" placeholder="you@email.com" />
                {errors.email && <p className="text-wine text-xs mt-1">{t('forms.email')}</p>}
              </div>
              <div>
                <label className="label">{t('forms.dob')}</label>
                <input {...register('date_of_birth')} type="date" className="input-field" />
              </div>
            </div>
            <div>
              <label className="label">{t('forms.rental.desiredProperty')}</label>
              <input {...register('property_address')} className="input-field" placeholder={t('forms.rental.desiredPropertyPh')} />
            </div>

            <div className="pt-2 border-t border-gray-100">
              <p className="text-sm font-semibold text-navy-800 mb-3">{t('forms.rental.currentAddress')}</p>
              <div>
                <label className="label">{t('forms.rental.street')} *</label>
                <input {...register('current_address', { required: 'Required' })} className="input-field" placeholder="123 Brickell Ave, Unit 1500" />
                {errors.current_address && <p className="text-wine text-xs mt-1">{t('forms.rental.street')}</p>}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                <div className="col-span-2 sm:col-span-1"><label className="label">{t('forms.city')}</label><input {...register('current_city')} className="input-field" /></div>
                <div><label className="label">{t('forms.state')}</label><input {...register('current_state')} className="input-field" placeholder="FL" /></div>
                <div><label className="label">{t('forms.zip')}</label><input {...register('current_zip')} className="input-field" /></div>
                <div className="col-span-2 sm:col-span-1"><label className="label">{t('forms.howLong')}</label><input {...register('residence_length')} className="input-field" placeholder="2 years" /></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="label">{t('forms.rental.housingStatus')}</label>
                  <select {...register('housing_status')} className="input-field"><option>Rent</option><option>Own</option><option>Live with family</option></select>
                </div>
                <div>
                  <label className="label">{t('forms.rental.monthlyPayment')}</label>
                  <input {...register('monthly_payment')} type="number" className="input-field" placeholder="2,200" />
                </div>
              </div>
            </div>

            <button type="button" onClick={next} className="btn-wine w-full justify-center py-4">{t('forms.continue')} <ArrowRight size={16} /></button>
          </div>
        )}

        {/* Step 2 — Employment */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="font-serif text-xl font-bold text-navy-900">{t('forms.rental.hEmployment')}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">{t('forms.rental.employerCurrent')} *</label>
                <input {...register('employer', { required: 'Required' })} className="input-field" placeholder="Company name" />
                {errors.employer && <p className="text-wine text-xs mt-1">{t('forms.rental.employerCurrent')}</p>}
              </div>
              <div>
                <label className="label">{t('forms.position')}</label>
                <input {...register('position')} className="input-field" placeholder="Your role" />
              </div>
              <div>
                <label className="label">{t('forms.rental.payType')}</label>
                <select {...register('employment_type')} className="input-field"><option>Salary</option><option>Hourly</option><option>Self-employed</option><option>Other</option></select>
              </div>
              <div>
                <label className="label">{t('forms.annualIncome')} *</label>
                <input {...register('annual_income', { required: 'Required' })} type="number" className="input-field" placeholder="85,000" />
                {errors.annual_income && <p className="text-wine text-xs mt-1">{t('forms.annualIncome')}</p>}
              </div>
              <div>
                <label className="label">{t('forms.rental.employerPhone')}</label>
                <input {...register('employer_phone')} type="tel" className="input-field" />
              </div>
              <div>
                <label className="label">{t('forms.rental.timeEmployed')}</label>
                <input {...register('employment_length')} className="input-field" placeholder="3 years" />
              </div>
            </div>
            <div>
              <label className="label">{t('forms.rental.employerAddress')}</label>
              <input {...register('employer_address')} className="input-field" placeholder={t('forms.rental.employerAddressPh')} />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary" aria-label={t('forms.back')}><ArrowLeft size={16} /></button>
              <button type="button" onClick={next} className="btn-wine flex-1 justify-center py-4">{t('forms.continue')} <ArrowRight size={16} /></button>
            </div>
          </div>
        )}

        {/* Step 3 — Co-applicant */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="font-serif text-xl font-bold text-navy-900">{t('forms.rental.stepCoapplicant')}</h3>
            <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer hover:border-navy-300">
              <input type="checkbox" {...register('has_coapplicant')} className="w-4 h-4" />
              <span className="text-sm text-navy-800 font-medium">{t('forms.rental.coToggle')}</span>
            </label>

            {hasCo && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="label">{t('forms.rental.coName')}</label><input {...register('co_full_name')} className="input-field" /></div>
                  <div><label className="label">{t('forms.dob')}</label><input {...register('co_dob')} type="date" className="input-field" /></div>
                  <div><label className="label">{t('forms.phone')}</label><input {...register('co_phone')} type="tel" className="input-field" /></div>
                  <div><label className="label">{t('forms.email')}</label><input {...register('co_email')} type="email" className="input-field" /></div>
                  <div><label className="label">{t('forms.employer')}</label><input {...register('co_employer')} className="input-field" /></div>
                  <div><label className="label">{t('forms.annualIncome')}</label><input {...register('co_income')} type="number" className="input-field" /></div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="btn-secondary" aria-label={t('forms.back')}><ArrowLeft size={16} /></button>
              <button type="button" onClick={() => setStep(4)} className="btn-wine flex-1 justify-center py-4">{t('forms.continue')} <ArrowRight size={16} /></button>
            </div>
          </div>
        )}

        {/* Step 4 — Review / references / authorize */}
        {step === 4 && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="font-serif text-xl font-bold text-navy-900">{t('forms.rental.hLastDetails')}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="label">{t('forms.rental.moveIn')}</label><input {...register('desired_move_in')} type="date" className="input-field" /></div>
              <div><label className="label">{t('forms.rental.occupants')}</label><input {...register('occupants')} type="number" className="input-field" placeholder="2" /></div>
            </div>
            <div><label className="label">{t('forms.rental.pets')}</label><input {...register('pets')} className="input-field" placeholder={t('forms.rental.petsPh')} /></div>

            <div className="pt-2 border-t border-gray-100">
              <p className="text-sm font-semibold text-navy-800 mb-3">{t('forms.rental.hEmergency')}</p>
              <div className="grid sm:grid-cols-3 gap-3">
                <div><label className="label">{t('forms.name')}</label><input {...register('emergency_name')} className="input-field" /></div>
                <div><label className="label">{t('forms.phone')}</label><input {...register('emergency_phone')} type="tel" className="input-field" /></div>
                <div><label className="label">{t('forms.relationship')}</label><input {...register('emergency_relationship')} className="input-field" /></div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <p className="text-sm font-semibold text-navy-800 mb-3">{t('forms.rental.hReference')}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><label className="label">{t('forms.name')}</label><input {...register('reference_name')} className="input-field" /></div>
                <div><label className="label">{t('forms.phone')}</label><input {...register('reference_phone')} type="tel" className="input-field" /></div>
              </div>
            </div>

            <label className="flex items-start gap-3 p-4 rounded-xl bg-navy-50 cursor-pointer">
              <input type="checkbox" {...register('authorize', { required: true })} className="w-4 h-4 mt-0.5" />
              <span className="text-xs text-navy-700 leading-relaxed">{t('forms.rental.authorize')}</span>
            </label>
            {errors.authorize && <p className="text-wine text-xs">{t('forms.rental.authorizeRequired')}</p>}

            {error && <p className="text-wine text-sm text-center font-medium">{error}</p>}

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(3)} className="btn-secondary" aria-label={t('forms.back')}><ArrowLeft size={16} /></button>
              <button type="submit" disabled={loading} className="btn-wine cta-shine flex-1 justify-center py-4 disabled:opacity-60">
                {loading ? t('forms.submitting') : <>{t('forms.rental.submit')} <CheckCircle2 size={16} /></>}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
