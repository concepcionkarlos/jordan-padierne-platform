'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Home, ArrowRight, ArrowLeft, CheckCircle2, TrendingUp } from 'lucide-react'
import { AREAS, TIMELINES } from '@/lib/utils'

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
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, trigger, formState: { errors } } = useForm<FormData>()

  const next = async () => {
    const fields: (keyof FormData)[] = step === 1
      ? ['property_address', 'city', 'property_type']
      : ['bedrooms', 'bathrooms', 'condition']
    const ok = await trigger(fields)
    if (ok) setStep((s) => s + 1)
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_type: 'home_valuation', source: 'Website', ...data }),
      })
      setSubmitted(true)
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
        <h3 className="font-serif text-2xl font-bold text-navy-900 mb-2">Your Report is On the Way!</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Jordan will personally prepare a detailed market valuation for your home and reach out within 24 hours
          with what it&apos;s worth in today&apos;s market.
        </p>
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
              <h3 className="font-serif text-xl font-bold text-navy-900">Tell us about your property</h3>
            </div>
            <div>
              <label className="label">Property Address *</label>
              <input {...register('property_address', { required: 'Required' })} className="input-field" placeholder="123 Brickell Ave, Unit 1500" />
              {errors.property_address && <p className="text-wine text-xs mt-1">{errors.property_address.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">City / Area *</label>
                <select {...register('city', { required: true })} className="input-field">
                  <option value="">Select…</option>
                  {AREAS.map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Property Type *</label>
                <select {...register('property_type', { required: true })} className="input-field">
                  <option value="">Select…</option>
                  <option>Condo</option>
                  <option>Single Family Home</option>
                  <option>Townhouse</option>
                  <option>Multi-Family</option>
                  <option>Land</option>
                </select>
              </div>
            </div>
            <button type="button" onClick={next} className="btn-wine w-full justify-center py-4">
              Continue <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center mb-2">
              <h3 className="font-serif text-xl font-bold text-navy-900">Property details</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">Beds *</label>
                <select {...register('bedrooms', { required: true })} className="input-field">
                  {['Studio', '1', '2', '3', '4', '5+'].map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Baths *</label>
                <select {...register('bathrooms', { required: true })} className="input-field">
                  {['1', '1.5', '2', '2.5', '3', '4+'].map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Sq Ft</label>
                <input {...register('sqft')} type="number" className="input-field" placeholder="1200" />
              </div>
            </div>
            <div>
              <label className="label">Condition *</label>
              <select {...register('condition', { required: true })} className="input-field">
                <option value="">Select…</option>
                <option>Excellent — recently renovated</option>
                <option>Good — well maintained</option>
                <option>Average — some updates needed</option>
                <option>Needs work</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary"><ArrowLeft size={16} /></button>
              <button type="button" onClick={next} className="btn-wine flex-1 justify-center py-4">Continue <ArrowRight size={16} /></button>
            </div>
          </div>
        )}

        {/* Step 3: Contact */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center mb-2">
              <TrendingUp size={28} className="text-wine mx-auto mb-2" />
              <h3 className="font-serif text-xl font-bold text-navy-900">Where should Jordan send your report?</h3>
            </div>
            <div>
              <label className="label">When are you thinking of selling?</label>
              <select {...register('timeline')} className="input-field">
                <option value="">Select…</option>
                {TIMELINES.map((t) => <option key={t}>{t}</option>)}
                <option>Just curious about the value</option>
              </select>
            </div>
            <div>
              <label className="label">Full Name *</label>
              <input {...register('full_name', { required: 'Required' })} className="input-field" placeholder="Your name" />
              {errors.full_name && <p className="text-wine text-xs mt-1">{errors.full_name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Email *</label>
                <input {...register('email', { required: 'Required' })} type="email" className="input-field" placeholder="you@email.com" />
                {errors.email && <p className="text-wine text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="label">Phone *</label>
                <input {...register('phone', { required: 'Required' })} type="tel" className="input-field" placeholder="(305) 000-0000" />
                {errors.phone && <p className="text-wine text-xs mt-1">{errors.phone.message}</p>}
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="btn-secondary"><ArrowLeft size={16} /></button>
              <button type="submit" disabled={loading} className="btn-wine flex-1 justify-center py-4 disabled:opacity-60">
                {loading ? 'Sending…' : <>Get My Free Valuation <ArrowRight size={16} /></>}
              </button>
            </div>
            <p className="text-center text-gray-400 text-xs">No obligation. Your information stays private.</p>
          </div>
        )}
      </form>
    </div>
  )
}
