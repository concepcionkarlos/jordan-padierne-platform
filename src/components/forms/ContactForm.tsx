'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Send, CheckCircle2 } from 'lucide-react'
import type { ContactFormData } from '@/lib/types'
import { AREAS, CLIENT_TYPES, TIMELINES, BUDGET_RANGES } from '@/lib/utils'

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>()

  const onSubmit = async (data: ContactFormData) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_type: 'contact', ...data }),
      })
      if (!res.ok) throw new Error('Submission failed')
      setSubmitted(true)
      reset()
    } catch {
      setError('Something went wrong. Please try again or call 305-799-6973.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 size={48} className="text-sky-500 mx-auto mb-4" />
        <h3 className="font-serif text-2xl font-bold text-navy-900 mb-2">Message Sent!</h3>
        <p className="text-gray-500">Jordan will get back to you within 24 hours.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="label">Full Name *</label>
          <input
            {...register('full_name', { required: 'Name is required' })}
            className="input-field"
            placeholder="Your full name"
          />
          {errors.full_name && <p className="text-wine text-xs mt-1">{errors.full_name.message}</p>}
        </div>
        <div>
          <label className="label">Phone *</label>
          <input
            {...register('phone', { required: 'Phone is required' })}
            type="tel"
            className="input-field"
            placeholder="(305) 000-0000"
          />
          {errors.phone && <p className="text-wine text-xs mt-1">{errors.phone.message}</p>}
        </div>
      </div>

      <div>
        <label className="label">Email *</label>
        <input
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
          })}
          type="email"
          className="input-field"
          placeholder="your@email.com"
        />
        {errors.email && <p className="text-wine text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="label">I am a...</label>
          <select {...register('client_type')} className="input-field">
            {CLIENT_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Preferred Area</label>
          <select {...register('preferred_area')} className="input-field">
            <option value="">Select area...</option>
            {AREAS.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="label">Budget Range</label>
          <select {...register('budget')} className="input-field">
            <option value="">Select budget...</option>
            {BUDGET_RANGES.map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Timeline</label>
          <select {...register('timeline')} className="input-field">
            <option value="">Select timeline...</option>
            {TIMELINES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Message</label>
        <textarea
          {...register('message')}
          rows={4}
          className="input-field resize-none"
          placeholder="Tell Jordan how he can help you..."
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
        {loading ? 'Sending...' : (
          <>
            <Send size={16} />
            Send Message
          </>
        )}
      </button>
    </form>
  )
}
