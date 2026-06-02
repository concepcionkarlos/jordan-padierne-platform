import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Zap } from 'lucide-react'

const benefits = [
  'Access to exclusive pre-launch pricing',
  'Choose your preferred floor and unit layout',
  'Lower initial investment, higher appreciation potential',
  'Extended payment plans during construction',
  'Ideal for investors looking for strong ROI',
  'First access to Miami\'s newest luxury buildings',
]

export default function PreConstructionSection() {
  return (
    <section className="py-20 lg:py-28 bg-white overflow-hidden">
      <div className="container-max section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="relative order-2 lg:order-1">
            <div className="relative rounded-3xl overflow-hidden shadow-premium aspect-[4/5] max-w-md mx-auto lg:max-w-none">
              <Image
                src="/images/jordan-modern.png"
                alt="Pre-Construction Specialist Jordan Padierne"
                fill
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/50 to-transparent" />
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -right-4 lg:-right-8 bg-wine text-white rounded-2xl p-5 shadow-premium max-w-xs">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={16} className="text-white" fill="currentColor" />
                <span className="font-bold text-sm">Pre-Construction Specialist</span>
              </div>
              <p className="text-wine-100 text-xs leading-snug">
                Exclusive access to Miami&apos;s top projects before they hit the market.
              </p>
            </div>

            {/* Accent decoration */}
            <div className="absolute -top-6 -left-6 w-32 h-32 rounded-full bg-sky-100 blur-3xl opacity-60" />
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 bg-wine-50 border border-wine-100 text-wine rounded-full px-4 py-1.5 mb-6">
              <Zap size={13} fill="currentColor" />
              <span className="text-sm font-semibold">Jordan&apos;s Specialty</span>
            </div>

            <h2 className="section-title mb-6">
              Pre-Construction:{' '}
              <span className="text-wine">Enter Early.</span>{' '}
              <span className="text-sky-500">Win Big.</span>
            </h2>

            <p className="text-gray-500 text-lg leading-relaxed mb-6">
              Pre-construction is Jordan&apos;s specialty — and for good reason. Buyers and
              investors who enter the right project at the right stage can secure significant
              appreciation before a single unit is delivered.
            </p>

            <p className="text-gray-500 text-base leading-relaxed mb-8">
              With direct connections to developers across Miami-Dade, Jordan gives clients
              first access to exclusive projects in Brickell, Doral, and Downtown Miami —
              often before they are listed publicly.
            </p>

            {/* Benefits */}
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-sky-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-navy-700 leading-snug">{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/pre-construction" className="btn-wine">
                Explore Projects
                <ArrowRight size={16} />
              </Link>
              <Link href="/contact" className="btn-secondary">
                Get Pre-Construction Guide
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
