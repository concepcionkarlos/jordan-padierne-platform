import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import PublicLayout from '@/components/layout/PublicLayout'
import AuroraBackground from '@/components/ui/AuroraBackground'
import { CheckCircle2, ArrowRight, Home, Search, FileText, Key } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Buy a Home in Miami',
  description:
    'Buy a home or condo in Miami with Realtor Jordan Padierne. Expert buyer guidance in Brickell, Doral, Coral Gables, Downtown Miami & Hialeah. First-time buyers, luxury & international clients welcome. Bilingual. Call 305-799-6973.',
}

const steps = [
  {
    icon: Search,
    step: '01',
    title: 'Discovery Call',
    description:
      'We start with a consultation to understand your goals, timeline, budget, and preferred areas. No pressure — just clarity.',
  },
  {
    icon: FileText,
    step: '02',
    title: 'Get Pre-Qualified',
    description:
      'Jordan connects you with trusted lenders so you know exactly what you can afford before you start searching.',
  },
  {
    icon: Home,
    step: '03',
    title: 'Property Search & Showings',
    description:
      'Access to MLS listings, pre-construction projects, and off-market opportunities. Jordan schedules and guides every showing.',
  },
  {
    icon: Key,
    step: '04',
    title: 'Offer, Negotiation & Close',
    description:
      'Jordan negotiates on your behalf to get the best price and terms — and guides you all the way to the closing table.',
  },
]

export default function BuyPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center bg-navy-900 pt-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/jordan-house.png"
            alt="Buy a Home in South Florida"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-navy-900/75" />
        </div>
        <AuroraBackground variant="dark" className="mix-blend-screen" />
        <div className="container-max section-padding relative z-10 py-20">
          <p className="text-sky-400 font-semibold text-sm uppercase tracking-widest mb-4">
            Buy a Home
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 max-w-2xl">
            Your South Florida Home Starts Here
          </h1>
          <p className="text-white/75 text-lg max-w-xl mb-8">
            Whether it&apos;s your first purchase or your next investment — Jordan makes the
            buying process simple, informed, and stress-free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/contact" className="btn-wine cta-shine">
              Start Your Search <ArrowRight size={16} />
            </Link>
            <Link href="/properties" className="btn-outline-white">
              Browse Properties
            </Link>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-white">
        <div className="container-max section-padding">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="section-title mb-4">The Buying Process,{' '}
              <span className="text-sky-500">Simplified</span>
            </h2>
            <p className="section-subtitle">
              Jordan walks you through every step — from your first call to the day you
              receive your keys.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.step} className="relative p-7 rounded-2xl bg-light-gray border border-gray-100">
                  <span className="font-serif text-5xl font-bold text-gray-100 absolute top-4 right-4">
                    {s.step}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center mb-4">
                    <Icon size={22} className="text-navy-700" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-navy-900 mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why work with Jordan for buying */}
      <section className="py-20 bg-light-gray">
        <div className="container-max section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-premium">
              <Image
                src="/images/jordan-luxury.png"
                alt="Jordan Padierne Buyer Agent"
                fill
                className="object-cover object-center"
              />
            </div>
            <div>
              <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-3">Why Jordan</p>
              <h2 className="font-serif text-3xl lg:text-4xl font-bold text-navy-900 mb-6">
                Your Advocate From Start to Close
              </h2>
              <div className="space-y-4 mb-8">
                {[
                  'Access to off-market listings and pre-construction projects',
                  'Expert negotiator who fights for your best price',
                  'Bilingual service — English and Spanish',
                  'Trusted network of lenders, inspectors, and attorneys',
                  'Deep knowledge of Miami-Dade neighborhoods',
                  'Available 7 days a week — always responsive',
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-sky-500 mt-0.5 shrink-0" />
                    <span className="text-navy-700 text-sm">{point}</span>
                  </div>
                ))}
              </div>
              <Link href="/contact" className="btn-primary">
                Start Your Home Search <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Buyer Qualification CTA */}
      <section className="py-16 bg-navy-900 relative overflow-hidden">
        <AuroraBackground variant="dark" className="mix-blend-screen" />
        <div className="container-max section-padding text-center">
          <h2 className="font-serif text-3xl font-bold text-white mb-4">
            Are You Ready to Buy?
          </h2>
          <p className="text-navy-200 text-lg mb-8 max-w-xl mx-auto">
            Fill out the buyer qualification form and Jordan will reach out to help you take
            the next step.
          </p>
          <Link href="/contact#buyer-form" className="btn-wine inline-flex">
            Complete Buyer Form <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </PublicLayout>
  )
}
