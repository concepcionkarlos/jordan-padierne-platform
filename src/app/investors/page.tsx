import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import PublicLayout from '@/components/layout/PublicLayout'
import { TrendingUp, DollarSign, BarChart2, CheckCircle2, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Investors',
  description:
    'Investment properties in South Florida with Jordan Padierne. ROI analysis, pre-construction, short-term rentals, and long-term portfolio growth in Miami-Dade.',
}

const investmentTypes = [
  {
    icon: TrendingUp,
    title: 'Pre-Construction Investment',
    description: 'Enter projects early and ride appreciation from reservation to delivery.',
    return: '15-30% avg. appreciation',
  },
  {
    icon: DollarSign,
    title: 'Short-Term Rentals',
    description: 'Airbnb-friendly areas in Miami with strong seasonal and tourism demand.',
    return: 'High nightly rates',
  },
  {
    icon: BarChart2,
    title: 'Long-Term Rentals',
    description: 'Stable cash flow with Miami\'s growing rental demand and limited inventory.',
    return: 'Steady monthly income',
  },
  {
    icon: TrendingUp,
    title: 'Fix & Resell',
    description: 'Identify undervalued properties in strong appreciation areas and sell at a premium.',
    return: 'Equity-based returns',
  },
]

export default function InvestorsPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative min-h-[65vh] flex items-center bg-navy-900 pt-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/jordan-terrace.png"
            alt="Investment Properties Miami"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-900/90 via-navy-900/70 to-navy-900/20" />
        </div>
        <div className="container-max section-padding relative z-10 py-24">
          <p className="text-sky-400 font-semibold text-sm uppercase tracking-widest mb-4">
            For Investors
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 max-w-2xl">
            Build Your Real Estate Portfolio in{' '}
            <span className="text-sky-400">South Florida</span>
          </h1>
          <p className="text-white/75 text-lg max-w-xl mb-8">
            Jordan helps investors identify high-potential properties, analyze returns, and
            position themselves for long-term growth in one of the world&apos;s hottest markets.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/contact#investor-form" className="btn-wine">
              Start Investing <ArrowRight size={16} />
            </Link>
            <Link href="/pre-construction" className="btn-outline-white">
              Pre-Construction Opportunities
            </Link>
          </div>
        </div>
      </section>

      {/* Investment types */}
      <section className="py-20 bg-white">
        <div className="container-max section-padding">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-3">Investment Strategies</p>
            <h2 className="section-title mb-4">
              Multiple Ways to{' '}
              <span className="text-sky-500">Grow in Miami</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {investmentTypes.map((t) => {
              const Icon = t.icon
              return (
                <div key={t.title} className="p-7 rounded-2xl border border-gray-100 hover:border-sky-200 hover:shadow-card transition-all group">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center group-hover:bg-sky-50 transition-colors">
                      <Icon size={22} className="text-navy-700" />
                    </div>
                    <span className="bg-sky-50 text-sky-600 text-xs font-semibold px-3 py-1 rounded-full">
                      {t.return}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-navy-900 mb-2">{t.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{t.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Miami */}
      <section className="py-20 bg-light-gray">
        <div className="container-max section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-3">Why Miami</p>
              <h2 className="font-serif text-3xl lg:text-4xl font-bold text-navy-900 mb-6">
                One of the World&apos;s Most Dynamic Real Estate Markets
              </h2>
              <div className="space-y-4 mb-8">
                {[
                  'Strong population growth and international demand',
                  'No state income tax in Florida',
                  'Year-round rental demand from tourism and relocation',
                  'Limited land supply in prime areas drives appreciation',
                  'World-class infrastructure, schools, and lifestyle',
                  'Gateway for Latin American and European investors',
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-sky-500 mt-0.5 shrink-0" />
                    <span className="text-navy-700 text-sm">{point}</span>
                  </div>
                ))}
              </div>
              <Link href="/contact#investor-form" className="btn-primary inline-flex">
                Talk to Jordan About Investing <ArrowRight size={16} />
              </Link>
            </div>
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-premium">
              <Image
                src="/images/jordan-luxury.png"
                alt="Miami Investment Properties"
                fill
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy-900">
        <div className="container-max section-padding text-center">
          <h2 className="font-serif text-3xl font-bold text-white mb-4">
            Ready to Invest in South Florida?
          </h2>
          <p className="text-navy-200 text-lg mb-8 max-w-xl mx-auto">
            Fill out the investor form and Jordan will prepare a personalized
            investment strategy for your goals.
          </p>
          <Link href="/contact#investor-form" className="btn-wine inline-flex">
            Submit Investor Inquiry <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </PublicLayout>
  )
}
