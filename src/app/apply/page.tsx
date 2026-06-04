import type { Metadata } from 'next'
import PublicLayout from '@/components/layout/PublicLayout'
import AuroraBackground from '@/components/ui/AuroraBackground'
import RentalApplicationForm from '@/components/forms/RentalApplicationForm'
import { ShieldCheck, Clock, Lock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Rental Application — Jordan Padierne, Miami Realtor',
  description:
    'Apply to rent with Miami Realtor Jordan Padierne. A fast, secure online rental application — applicant info, employment, references. Hablamos Español. Call 305-799-6973.',
  alternates: { canonical: 'https://jordanpadierne.com/apply' },
}

export default function ApplyPage() {
  return (
    <PublicLayout>
      <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden">
        <AuroraBackground />
        <div className="container-max section-padding relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-2">Rental Application</p>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy-900 mb-3">Apply in minutes</h1>
            <p className="text-gray-500 text-lg">A simple, secure application — Jordan will guide you through every step.</p>
            <div className="flex flex-wrap items-center justify-center gap-5 mt-5 text-gray-400 text-xs">
              <span className="flex items-center gap-1.5"><Clock size={13} /> ~5 minutes</span>
              <span className="flex items-center gap-1.5"><Lock size={13} /> Your data stays private</span>
              <span className="flex items-center gap-1.5"><ShieldCheck size={13} /> No full SSN required</span>
            </div>
          </div>

          <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-premium p-6 sm:p-9">
            <RentalApplicationForm />
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
