'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Circle, X, Rocket, ChevronRight } from 'lucide-react'

interface Step {
  id: string
  label: string
  desc: string
  href: string
  done: boolean
}

export default function GettingStarted({ stats }: { stats: { leads: number; properties: number; notes: number; appointments: number; testimonials: number } }) {
  const [dismissed, setDismissed] = useState(false)

  const steps: Step[] = [
    { id: 'lead', label: 'Add or import your first lead', desc: 'Bring in a contact or import your phone list (CSV).', href: '/admin/leads', done: stats.leads > 0 },
    { id: 'note', label: 'Log your first activity', desc: 'Open a lead and log a call or note — it feeds your streak.', href: '/admin/leads', done: stats.notes > 0 },
    { id: 'appt', label: 'Schedule an appointment', desc: 'Add a showing or call to your calendar.', href: '/admin/calendar', done: stats.appointments > 0 },
    { id: 'property', label: 'Add a property listing', desc: 'List a home for sale, rent, or investment — it shows on your site.', href: '/admin/properties', done: stats.properties > 0 },
    { id: 'review', label: 'Add a client testimonial', desc: 'Real reviews build trust and appear on your home page.', href: '/admin/testimonials', done: stats.testimonials > 0 },
  ]

  const doneCount = steps.filter((s) => s.done).length
  const allDone = doneCount === steps.length

  // Auto-hide once everything's done or user dismissed it
  if (allDone || dismissed) return null

  return (
    <div className="bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden mb-6">
      <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2 bg-gradient-to-r from-sky-50 to-transparent">
        <Rocket size={16} className="text-sky-500" />
        <h2 className="font-semibold text-navy-900 text-sm">Get Started</h2>
        <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">{doneCount}/{steps.length}</span>
        <div className="flex-1" />
        {/* progress bar */}
        <div className="hidden sm:block w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
        </div>
        <button type="button" onClick={() => setDismissed(true)} className="text-gray-300 hover:text-navy-600 ml-2" aria-label="Dismiss"><X size={15} /></button>
      </div>
      <div className="divide-y divide-gray-50">
        {steps.map((s) => (
          <Link key={s.id} href={s.href} className={`flex items-center gap-3 px-5 py-3 transition-colors ${s.done ? 'opacity-60' : 'hover:bg-gray-50'}`}>
            {s.done ? <CheckCircle2 size={18} className="text-green-500 shrink-0" /> : <Circle size={18} className="text-gray-300 shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${s.done ? 'text-gray-400 line-through' : 'text-navy-900'}`}>{s.label}</p>
              {!s.done && <p className="text-gray-400 text-xs">{s.desc}</p>}
            </div>
            {!s.done && <ChevronRight size={15} className="text-gray-300 shrink-0" />}
          </Link>
        ))}
      </div>
    </div>
  )
}
