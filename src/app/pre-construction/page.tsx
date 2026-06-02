import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import PublicLayout from '@/components/layout/PublicLayout'
import { CheckCircle2, ArrowRight, Zap, TrendingUp, Building2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pre-Construction',
  description:
    "Jordan Padierne's specialty — pre-construction opportunities in Miami. Get first access to exclusive projects in Brickell, Downtown, Doral, and more.",
}

const benefits = [
  { icon: TrendingUp, title: 'Early-Stage Pricing', description: 'Lock in prices before construction begins — often 15-30% below market value at completion.' },
  { icon: Building2, title: 'Unit Selection', description: 'Choose the best floor, unit type, and layout while full inventory is still available.' },
  { icon: Zap, title: 'Extended Payment Plans', description: 'Spread your investment over the construction period — usually 2 to 4 years.' },
  { icon: TrendingUp, title: 'Appreciation Potential', description: 'Properties often appreciate significantly from reservation to delivery date.' },
]

const areas = ['Brickell', 'Downtown Miami', 'Doral', 'Edgewater', 'Wynwood', 'Coral Gables']

export default function PreConstructionPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center bg-navy-900 pt-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/jordan-modern.png"
            alt="Pre-Construction Miami"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-900/90 via-navy-900/75 to-navy-900/30" />
        </div>
        <div className="container-max section-padding relative z-10 py-24">
          <div className="inline-flex items-center gap-2 bg-wine/80 backdrop-blur-sm border border-wine/30 rounded-full px-4 py-1.5 mb-6">
            <Zap size={13} className="text-white" fill="currentColor" />
            <span className="text-white text-sm font-semibold">Jordan&apos;s Specialty</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 max-w-2xl">
            Pre-Construction:{' '}
            <span className="text-sky-400">Enter Early,</span>{' '}
            Win Big.
          </h1>
          <p className="text-white/75 text-lg max-w-xl mb-8 leading-relaxed">
            Jordan&apos;s specialty is connecting buyers and investors with South Florida&apos;s best
            pre-construction projects — before prices rise and units sell out.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/contact#pre-construction-form" className="btn-wine cta-shine">
              Get Project Access <ArrowRight size={16} />
            </Link>
            <a href="tel:+13057996973" className="btn-outline-white">
              Call 305-799-6973
            </a>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="container-max section-padding">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-3">Why Pre-Construction</p>
            <h2 className="section-title mb-4">
              The Smart Way to{' '}
              <span className="text-sky-500">Invest in Miami</span>
            </h2>
            <p className="section-subtitle">
              Pre-construction gives buyers and investors a strategic advantage — locking in
              price, choice, and appreciation before the market catches up.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {benefits.map((b) => {
              const Icon = b.icon
              return (
                <div key={b.title} className="flex gap-5 p-7 rounded-2xl border border-gray-100 bg-light-gray">
                  <div className="w-12 h-12 rounded-xl bg-wine-50 flex items-center justify-center shrink-0">
                    <Icon size={20} className="text-wine" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-navy-900 mb-2">{b.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{b.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Jordan's approach + image */}
      <section className="py-20 bg-light-gray">
        <div className="container-max section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-3">Jordan&apos;s Approach</p>
              <h2 className="font-serif text-3xl lg:text-4xl font-bold text-navy-900 mb-6">
                Exclusive Access to Miami&apos;s Best Projects
              </h2>
              <p className="text-gray-500 text-base leading-relaxed mb-6">
                Through direct relationships with Miami&apos;s top developers, Jordan provides clients
                with access to pre-construction opportunities in:
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {areas.map((area) => (
                  <div key={area} className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-sky-500" />
                    <span className="text-navy-700 text-sm font-medium">{area}</span>
                  </div>
                ))}
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Jordan guides you through unit selection, deposit structure, payment plans, and
                developer contracts — ensuring you enter each project with full clarity.
              </p>
              <Link href="/contact#pre-construction-form" className="btn-wine inline-flex">
                Request Project Info <ArrowRight size={16} />
              </Link>
            </div>
            <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-premium">
              <Image
                src="/images/jordan-about.png"
                alt="Jordan Padierne Pre-Construction Expert"
                fill
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/50 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
                <p className="text-white font-serif font-bold text-lg">Pre-Construction Specialist</p>
                <p className="text-white/70 text-xs mt-1">Direct developer access · Miami-Dade County</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy-900">
        <div className="container-max section-padding text-center">
          <Zap size={32} className="text-wine mx-auto mb-4" fill="currentColor" />
          <h2 className="font-serif text-3xl font-bold text-white mb-4">
            Don&apos;t Miss the Next Project
          </h2>
          <p className="text-navy-200 text-lg mb-8 max-w-xl mx-auto">
            Register your interest and Jordan will send you exclusive project details as
            they become available.
          </p>
          <Link href="/contact#pre-construction-form" className="btn-wine inline-flex">
            Register Interest <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </PublicLayout>
  )
}
