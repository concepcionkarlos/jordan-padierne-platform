import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import PublicLayout from '@/components/layout/PublicLayout'
import { CheckCircle2, ArrowRight, Award, Globe, Heart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Jordan',
  description:
    'Meet Jordan Padierne — South Florida Realtor with eXp Realty. Born in Cuba, based in Miami. Helping buyers, investors, and international clients with a personal, family-oriented approach.',
}

const highlights = [
  'Born in Cuba, based in Miami — brings authentic cultural insight',
  'Bilingual: English and Spanish',
  'Specializes in pre-construction, investment, and luxury real estate',
  'Licensed Realtor: SL3641062 · eXp Realty',
  'Serves Miami-Dade, Brickell, Doral, Coral Gables, Downtown, Hialeah',
  'Treats every client like family — guided, informed, and supported',
]

const values = [
  {
    icon: Heart,
    title: 'Family First',
    description:
      'Real estate is personal. Jordan builds relationships that last far beyond the closing table.',
  },
  {
    icon: Award,
    title: 'Excellence in Service',
    description:
      'Every client deserves the best outcome. Jordan negotiates hard and prepares thoroughly.',
  },
  {
    icon: Globe,
    title: 'Global Perspective',
    description:
      'With roots in Cuba and experience with international clients, Jordan navigates cross-border real estate with ease.',
  },
]

export default function AboutPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative pt-28 pb-0 bg-navy-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900" />
        <div className="container-max section-padding relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            <div className="pb-16 lg:pb-24">
              <p className="text-sky-400 font-semibold text-sm uppercase tracking-widest mb-4">
                About Jordan
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                A Realtor Who Treats You Like{' '}
                <span className="text-sky-400">Family</span>
              </h1>
              <p className="text-navy-200 text-lg leading-relaxed max-w-lg">
                Born in Cuba, based in Miami — Jordan Padierne brings a personal, authentic
                approach to real estate that makes every client feel guided, informed, and
                truly supported.
              </p>
            </div>
            {/* Photo */}
            <div className="relative self-end">
              <div className="relative h-[420px] lg:h-[520px] rounded-t-3xl overflow-hidden">
                <Image
                  src="/images/jordan-about.png"
                  alt="Jordan Padierne"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bio */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container-max section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-4">
                The Story
              </p>
              <h2 className="font-serif text-3xl lg:text-4xl font-bold text-navy-900 mb-6">
                Real Estate With Heart
              </h2>
              <div className="prose prose-gray max-w-none space-y-5 text-gray-600 text-base leading-relaxed">
                <p>
                  Jordan Padierne is a South Florida Realtor with eXp Realty, focused on helping
                  buyers, investors, and international clients find the right real estate
                  opportunities in Miami-Dade, Brickell, Hialeah, Downtown, Doral, and Coral Gables.
                </p>
                <p>
                  Born in Cuba and based in Miami, Jordan brings a personal, family-oriented
                  approach to real estate. His goal is to make every client feel guided, informed,
                  and confident throughout the buying process.
                </p>
                <p>
                  Specializing in pre-construction opportunities, investment properties, and luxury
                  real estate, Jordan works to negotiate strong deals and help clients make decisions
                  that can create value for years to come.
                </p>
                <p>
                  For Jordan, real estate is not just about closing a transaction. It is about
                  building trust, creating long-term relationships, and helping each client feel
                  supported like family.
                </p>
              </div>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link href="/contact" className="btn-wine">
                  Work With Jordan
                  <ArrowRight size={16} />
                </Link>
                <a href="tel:+13057996973" className="btn-secondary">
                  Call 305-799-6973
                </a>
              </div>
            </div>

            <div>
              {/* Highlights */}
              <div className="bg-light-gray rounded-2xl p-8 mb-8">
                <h3 className="font-serif text-xl font-bold text-navy-900 mb-6">
                  About Jordan
                </h3>
                <ul className="space-y-4">
                  {highlights.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 size={16} className="text-sky-500 mt-0.5 shrink-0" />
                      <span className="text-navy-700 text-sm leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Values */}
              <div className="space-y-4">
                {values.map((v) => {
                  const Icon = v.icon
                  return (
                    <div key={v.title} className="flex gap-4 p-5 rounded-xl bg-white border border-gray-100 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center shrink-0">
                        <Icon size={18} className="text-navy-700" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-navy-900 mb-1 text-sm">{v.title}</h4>
                        <p className="text-gray-500 text-sm leading-snug">{v.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy-900">
        <div className="container-max section-padding text-center">
          <h2 className="font-serif text-3xl font-bold text-white mb-4">
            Ready to Work With Jordan?
          </h2>
          <p className="text-navy-200 text-lg mb-8 max-w-xl mx-auto">
            Schedule a free consultation and see how Jordan can help you find the right
            opportunity in South Florida.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-wine">
              Schedule Consultation
              <ArrowRight size={16} />
            </Link>
            <Link href="/properties" className="btn-outline-white">
              View Properties
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
