'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Send, CheckCircle2 } from 'lucide-react'
import { AREAS, TIMELINES } from '@/lib/utils'

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
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_type: 'investor_inquiry', ...data }),
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
        <h3 className="font-serif text-xl font-bold text-navy-900 mb-2">Inquiry Received!</h3>
        <p className="text-gray-500 text-sm">Jordan will prepare a personalized investment strategy and reach out within 24 hours.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="label">Full Name *</label>
          <input {...register('full_name', { required: true })} className="input-field" placeholder="Your name" />
        </div>
        <div>
          <label className="label">Phone *</label>
          <input {...register('phone', { required: true })} type="tel" className="input-field" placeholder="(305) 000-0000" />
        </div>
      </div>
      <div>
        <label className="label">Email *</label>
        <input {...register('email', { required: true })} type="email" className="input-field" placeholder="your@email.com" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="label">Investment Type</label>
          <select {...register('investment_type')} className="input-field">
            <option>Pre-Construction</option>
            <option>Short-Term Rental (Airbnb)</option>
            <option>Long-Term Rental</option>
            <option>Fix & Resell</option>
            <option>Land / Development</option>
            <option>Mixed Strategy</option>
          </select>
        </div>
        <div>
          <label className="label">Preferred Area</label>
          <select {...register('preferred_area')} className="input-field">
            <option value="">Any area</option>
            {AREAS.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Budget Min ($)</label>
          <input {...register('budget_min')} type="number" className="input-field" placeholder="300,000" />
        </div>
        <div>
          <label className="label">Budget Max ($)</label>
          <input {...register('budget_max')} type="number" className="input-field" placeholder="2,000,000" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="label">Investment Goal</label>
          <select {...register('investment_goal')} className="input-field">
            <option>Capital appreciation</option>
            <option>Rental income</option>
            <option>Both</option>
            <option>Portfolio diversification</option>
          </select>
        </div>
        <div>
          <label className="label">Experience Level</label>
          <select {...register('experience_level')} className="input-field">
            <option>First-time investor</option>
            <option>1-3 properties owned</option>
            <option>4-10 properties owned</option>
            <option>10+ properties</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label">Timeline</label>
        <select {...register('timeline')} className="input-field">
          {TIMELINES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Tell Jordan about your investment goals</label>
        <textarea {...register('message')} rows={3} className="input-field resize-none" placeholder="Goals, questions, specific requirements..." />
      </div>
      <button type="submit" disabled={loading} className="btn-wine w-full justify-center py-4 text-base disabled:opacity-60">
        {loading ? 'Submitting...' : <><Send size={16} /> Submit Investor Inquiry</>}
      </button>
    </form>
  )
}
