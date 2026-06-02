'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Send, CheckCircle2 } from 'lucide-react'
import { AREAS, TIMELINES, FINANCING_OPTIONS } from '@/lib/utils'

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
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

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
        <h3 className="font-serif text-xl font-bold text-navy-900 mb-2">Form Submitted!</h3>
        <p className="text-gray-500 text-sm">Jordan will contact you within 24 hours to discuss your search.</p>
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
      <div>
        <label className="label">Preferred Area</label>
        <select {...register('preferred_area')} className="input-field">
          <option value="">Any area</option>
          {AREAS.map((a) => <option key={a}>{a}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Min Budget ($)</label>
          <input {...register('budget_min')} type="number" className="input-field" placeholder="300,000" />
        </div>
        <div>
          <label className="label">Max Budget ($)</label>
          <input {...register('budget_max')} type="number" className="input-field" placeholder="800,000" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Bedrooms</label>
          <select {...register('bedrooms')} className="input-field">
            <option value="">Any</option>
            {['1', '2', '3', '4', '5+'].map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Timeline</label>
          <select {...register('timeline')} className="input-field">
            {TIMELINES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Financing Status</label>
        <select {...register('financing_status')} className="input-field">
          {FINANCING_OPTIONS.map((f) => <option key={f}>{f}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-3">
        <input {...register('pre_approval')} type="checkbox" id="pre_approval" className="w-4 h-4 accent-sky-500" />
        <label htmlFor="pre_approval" className="text-sm text-navy-700">I already have a pre-approval letter</label>
      </div>
      <div>
        <label className="label">Anything else to share?</label>
        <textarea {...register('message')} rows={3} className="input-field resize-none" placeholder="Property preferences, must-haves, questions..." />
      </div>
      <button type="submit" disabled={loading} className="btn-wine w-full justify-center py-4 text-base disabled:opacity-60">
        {loading ? 'Submitting...' : <><Send size={16} /> Submit Buyer Form</>}
      </button>
    </form>
  )
}
