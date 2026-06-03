import type { Metadata } from 'next'
import Image from 'next/image'
import PublicLayout from '@/components/layout/PublicLayout'
import AuroraBackground from '@/components/ui/AuroraBackground'
import HomeValuationForm from '@/components/forms/HomeValuationForm'
import { TrendingUp, DollarSign, Clock, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'What\'s My Miami Home Worth? Free Valuation',
  description:
    'Sell your Miami home with confidence. Get a FREE, no-obligation home valuation from Realtor Jordan Padierne. Find out what your property in Brickell, Doral, Coral Gables, Hialeah or Miami-Dade is worth today. Call 305-799-6973.',
}

const benefits = [
  { icon: DollarSign, title: 'Accurate Market Value', text: 'Based on real comparable sales in your neighborhood — not an automated guess.' },
  { icon: TrendingUp, title: 'Today\'s Market Insights', text: 'Understand current demand and what buyers are paying right now.' },
  { icon: Clock, title: '24-Hour Turnaround', text: 'Jordan personally prepares and delivers your report within a day.' },
]

export default function HomeValuePage() {
  return (
    <PublicLayout>
      {/* Hero + form */}
      <section className="relative bg-navy-900 pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/jordan-luxury.png" alt="" fill className="object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-900/80 to-navy-900" />
        </div>
        <AuroraBackground variant="dark" className="mix-blend-screen" />
        <div className="container-max section-padding relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Copy */}
            <div>
              <div className="inline-flex items-center gap-2 bg-wine/20 border border-wine/30 rounded-full px-4 py-1.5 mb-6">
                <DollarSign size={13} className="text-white" />
                <span className="text-white text-sm font-semibold">Free Home Valuation</span>
              </div>
              <h1 className="font-serif text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
                What&apos;s Your South Florida Home{' '}
                <span className="text-sky-400">Really Worth?</span>
              </h1>
              <p className="text-white/75 text-lg leading-relaxed mb-8">
                Thinking about selling — or just curious? Get a free, personalized market valuation
                from Jordan Padierne. No automated estimates, no obligation — just real numbers based
                on what&apos;s actually selling in your area.
              </p>
              <ul className="space-y-3">
                {['Personalized by a local expert', 'Based on real comparable sales', 'Delivered within 24 hours'].map((b) => (
                  <li key={b} className="flex items-center gap-3 text-white/90 text-sm">
                    <CheckCircle2 size={16} className="text-sky-400 shrink-0" />{b}
                  </li>
                ))}
              </ul>
            </div>

            {/* Form card */}
            <div className="bg-white rounded-3xl shadow-premium p-7 lg:p-8">
              <HomeValuationForm />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="container-max section-padding">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {benefits.map((b) => {
              const Icon = b.icon
              return (
                <div key={b.title} className="text-center p-6">
                  <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center mx-auto mb-4">
                    <Icon size={22} className="text-sky-600" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-navy-900 mb-2">{b.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{b.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
