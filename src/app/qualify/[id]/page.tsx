export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import Image from 'next/image'
import { safeQuery } from '@/lib/db'
import QualificationForm from '@/components/forms/QualificationForm'
import { Phone, Shield, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Complete Your Profile',
  robots: { index: false, follow: false },
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function getLead(id: string): Promise<any> {
  if (!UUID_RE.test(id)) return null
  return safeQuery((db) => db.from('leads').select('id, full_name').eq('id', id).single(), null)
}

export default async function QualifyPage({ params }: { params: { id: string } }) {
  // The link must never die: if the lead exists we prefill, otherwise the form
  // collects contact info and creates a fresh lead in the CRM on submit.
  const lead = await getLead(params.id)
  const known = !!lead
  const firstName = (lead?.full_name || '').trim().split(' ')[0] || 'there'

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4 py-10">
      <div className="absolute inset-0 overflow-hidden">
        <Image src="/images/jordan-luxury.png" alt="" fill className="object-cover opacity-10" />
        <div className="absolute inset-0 bg-navy-900/80" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <p className="font-serif text-2xl font-bold text-white">Jordan Padierne</p>
          <p className="text-sky-400 text-xs font-medium tracking-widest uppercase mt-1">Realtor · eXp Realty</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-premium p-7 lg:p-8">
          <div className="text-center mb-6">
            <h1 className="font-serif text-2xl font-bold text-navy-900">
              {known ? `Hi ${firstName} 👋` : 'Tell Jordan what you’re looking for'}
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              Take 60 seconds to tell Jordan what you&apos;re looking for. He&apos;ll match you with the
              right opportunities before your first call.
            </p>
          </div>

          <QualificationForm leadId={lead?.id ?? params.id} firstName={firstName} known={known} />
        </div>

        {/* Trust footer */}
        <div className="flex items-center justify-center gap-5 mt-6 text-white/50 text-xs">
          <span className="flex items-center gap-1.5"><Clock size={12} /> 60 seconds</span>
          <span className="flex items-center gap-1.5"><Shield size={12} /> Private</span>
          <a href="tel:+13057996973" className="flex items-center gap-1.5 hover:text-white"><Phone size={12} /> 305-799-6973</a>
        </div>
      </div>
    </div>
  )
}
