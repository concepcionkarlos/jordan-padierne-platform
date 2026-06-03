'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowRight, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react'
import { AREAS, TIMELINES, FINANCING_OPTIONS, BUDGET_RANGES } from '@/lib/utils'

interface FormData {
  intent: string
  budget_min: string
  budget_max: string
  timeline: string
  financing_status: string
  preferred_area: string
  property_type: string
  bedrooms: string
  must_haves: string
  motivation: string
  best_time: string
  contact_method: string
}

export default function QualificationForm({ leadId, firstName }: { leadId: string; firstName: string }) {
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, trigger, watch, formState: { errors } } = useForm<FormData>({ defaultValues: { intent: 'Buy' } })

  const totalSteps = 4

  const next = async () => {
    const ok = await trigger(step === 1 ? ['intent'] : step === 2 ? ['budget_max', 'timeline'] : ['preferred_area'])
    if (ok) setStep((s) => Math.min(s + 1, totalSteps))
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await fetch('/api/qualify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: leadId,
          ...data,
          budget_min: data.budget_min ? Number(data.budget_min) : null,
          budget_max: data.budget_max ? Number(data.budget_max) : null,
        }),
      })
      setSubmitted(true)
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
        <h3 className="font-serif text-2xl font-bold text-navy-900 mb-2">Perfect, {firstName}! 🎉</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Jordan now knows exactly what you&apos;re looking for. He&apos;ll reach out shortly with
          opportunities matched to your goals. Talk soon!
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < step ? 'bg-wine' : 'bg-gray-100'}`} />
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1 — Intent */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="font-serif text-xl font-bold text-navy-900 text-center">What brings you to the market?</h3>
            <div className="grid grid-cols-2 gap-3">
              {['Buy', 'Sell', 'Invest', 'Rent'].map((opt) => (
                <label key={opt} className="cursor-pointer">
                  <input type="radio" value={opt} {...register('intent', { required: true })} className="peer sr-only" />
                  <div className="p-4 rounded-xl border-2 border-gray-200 text-center font-semibold text-navy-700 peer-checked:border-wine peer-checked:bg-wine-50 peer-checked:text-wine transition-all hover:border-gray-300">
                    {opt === 'Buy' ? '🏠 Buy a home' : opt === 'Sell' ? '💰 Sell my home' : opt === 'Invest' ? '📈 Invest' : '🔑 Rent'}
                  </div>
                </label>
              ))}
            </div>
            <button type="button" onClick={next} className="btn-wine w-full justify-center py-4">Continue <ArrowRight size={16} /></button>
          </div>
        )}

        {/* Step 2 — Budget & Timeline */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="font-serif text-xl font-bold text-navy-900 text-center">Budget & timeline</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Budget Min ($)</label>
                <input {...register('budget_min')} type="number" className="input-field" placeholder="300,000" />
              </div>
              <div>
                <label className="label">Budget Max ($) *</label>
                <input {...register('budget_max', { required: 'Required' })} type="number" className="input-field" placeholder="800,000" />
                {errors.budget_max && <p className="text-wine text-xs mt-1">{errors.budget_max.message}</p>}
              </div>
            </div>
            <div>
              <label className="label">When are you looking to move? *</label>
              <select {...register('timeline', { required: true })} className="input-field">
                {TIMELINES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Financing</label>
              <select {...register('financing_status')} className="input-field">
                <option value="">Select…</option>
                {FINANCING_OPTIONS.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary"><ArrowLeft size={16} /></button>
              <button type="button" onClick={next} className="btn-wine flex-1 justify-center py-4">Continue <ArrowRight size={16} /></button>
            </div>
          </div>
        )}

        {/* Step 3 — Property */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="font-serif text-xl font-bold text-navy-900 text-center">What are you looking for?</h3>
            <div>
              <label className="label">Preferred Area *</label>
              <select {...register('preferred_area', { required: true })} className="input-field">
                <option value="">Select…</option>
                {AREAS.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Property Type</label>
                <select {...register('property_type')} className="input-field">
                  <option value="">Any</option>
                  <option>Condo</option>
                  <option>Single Family Home</option>
                  <option>Townhouse</option>
                  <option>Pre-Construction</option>
                </select>
              </div>
              <div>
                <label className="label">Bedrooms</label>
                <select {...register('bedrooms')} className="input-field">
                  <option value="">Any</option>
                  {['Studio', '1', '2', '3', '4', '5+'].map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Must-haves (optional)</label>
              <input {...register('must_haves')} className="input-field" placeholder="e.g. waterfront, pool, parking, near schools" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="btn-secondary"><ArrowLeft size={16} /></button>
              <button type="button" onClick={next} className="btn-wine flex-1 justify-center py-4">Continue <ArrowRight size={16} /></button>
            </div>
          </div>
        )}

        {/* Step 4 — Motivation & contact */}
        {step === 4 && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="font-serif text-xl font-bold text-navy-900 text-center">Almost done!</h3>
            <div>
              <label className="label">What&apos;s most important to you in this move?</label>
              <textarea {...register('motivation')} rows={3} className="input-field resize-none" placeholder="Tell Jordan what matters most — location, timing, getting the best deal, a fresh start…" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Best way to reach you</label>
                <select {...register('contact_method')} className="input-field">
                  <option>Call</option>
                  <option>Text</option>
                  <option>WhatsApp</option>
                  <option>Email</option>
                </select>
              </div>
              <div>
                <label className="label">Best time</label>
                <select {...register('best_time')} className="input-field">
                  <option>Morning</option>
                  <option>Afternoon</option>
                  <option>Evening</option>
                  <option>Anytime</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(3)} className="btn-secondary"><ArrowLeft size={16} /></button>
              <button type="submit" disabled={loading} className="btn-wine cta-shine flex-1 justify-center py-4 disabled:opacity-60">
                {loading ? 'Submitting…' : <>Send to Jordan <Sparkles size={16} /></>}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
