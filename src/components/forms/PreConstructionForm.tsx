'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Send, CheckCircle2 } from 'lucide-react'
import { AREAS, TIMELINES, BUDGET_RANGES } from '@/lib/utils'

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
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_type: 'pre_construction_interest', ...data }),
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
        <h3 className="font-serif text-xl font-bold text-navy-900 mb-2">Interest Registered!</h3>
        <p className="text-gray-500 text-sm">Jordan will send you exclusive project information within 24 hours.</p>
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
          <label className="label">Preferred Area</label>
          <select {...register('preferred_area')} className="input-field">
            <option value="">Any area</option>
            {AREAS.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Unit Type</label>
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
        <label className="label">Budget Range</label>
        <select {...register('budget')} className="input-field">
          <option value="">Select range...</option>
          {BUDGET_RANGES.map((b) => <option key={b}>{b}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Timeline to Purchase</label>
        <select {...register('timeline')} className="input-field">
          {TIMELINES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Specific Project Interest (optional)</label>
        <input {...register('preferred_project')} className="input-field" placeholder="e.g. Brickell City Centre, or any new projects" />
      </div>
      <div className="flex items-center gap-3">
        <input {...register('is_investor')} type="checkbox" id="is_investor" className="w-4 h-4 accent-sky-500" />
        <label htmlFor="is_investor" className="text-sm text-navy-700">I am purchasing as an investor (not primary residence)</label>
      </div>
      <div>
        <label className="label">Additional Comments</label>
        <textarea {...register('message')} rows={3} className="input-field resize-none" placeholder="Questions, preferences, or anything else Jordan should know..." />
      </div>
      <button type="submit" disabled={loading} className="btn-wine w-full justify-center py-4 text-base disabled:opacity-60">
        {loading ? 'Submitting...' : <><Send size={16} /> Register My Interest</>}
      </button>
    </form>
  )
}
