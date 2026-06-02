import { Shield, Handshake, MapPin, Building2, Users } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'

const reasons = [
  {
    icon: Shield,
    title: 'Trust & Transparency',
    description:
      'Every client deserves honest guidance. Jordan provides clear, transparent advice so you always feel informed and confident.',
  },
  {
    icon: Users,
    title: 'Family-Oriented Approach',
    description:
      'Born in Cuba, based in Miami — Jordan treats every client like family. Your goals become his priority from day one.',
  },
  {
    icon: Handshake,
    title: 'Strong Negotiation',
    description:
      'Experienced in negotiations that protect your interests and help you get the best possible deal in any market.',
  },
  {
    icon: MapPin,
    title: 'Deep Local Knowledge',
    description:
      'From Brickell to Hialeah, Jordan knows every neighborhood — the prices, the trends, and the opportunities others miss.',
  },
  {
    icon: Building2,
    title: 'Pre-Construction Expert',
    description:
      'Specialized in pre-construction opportunities — helping investors and buyers enter projects at the best possible stage.',
  },
  {
    icon: Users,
    title: 'International Clients',
    description:
      'Bilingual (English/Spanish) and experienced working with international buyers navigating the South Florida market.',
  },
]

export default function WhyJordanSection() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="container-max section-padding">
        {/* Header */}
        <Reveal className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-3">
            Why Work With Jordan
          </p>
          <h2 className="section-title mb-4">
            Real Estate Feels Different{' '}
            <span className="text-sky-500">When Someone Truly Cares</span>
          </h2>
          <p className="section-subtitle">
            Jordan brings a personal, family-oriented approach to every transaction — making you
            feel guided, informed, and supported throughout the entire process.
          </p>
        </Reveal>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, i) => {
            const Icon = reason.icon
            return (
              <Reveal
                key={reason.title}
                variant="up"
                delay={(i % 3) * 110}
                className="group p-8 rounded-2xl border border-gray-100 bg-white hover:bg-sky-50 hover:border-sky-200 hover-lift hover:shadow-card"
              >
                <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center mb-5 group-hover:bg-sky-100 transition-colors">
                  <Icon size={22} className="text-navy-700 group-hover:text-navy-900" />
                </div>
                <h3 className="font-serif text-xl font-bold text-navy-900 mb-3">
                  {reason.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{reason.description}</p>
              </Reveal>
            )
          })}
        </div>

        {/* Bottom quote */}
        <Reveal variant="scale" className="mt-16 bg-navy-900 rounded-3xl p-8 lg:p-12 text-center">
          <blockquote className="font-serif text-2xl lg:text-3xl font-semibold text-white leading-relaxed max-w-3xl mx-auto">
            &ldquo;For Jordan, real estate is not just about closing a transaction. It is about
            building trust, creating long-term relationships, and helping each client feel
            supported like family.&rdquo;
          </blockquote>
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-sky-500" />
            <p className="text-sky-400 font-semibold text-sm">Jordan Padierne · eXp Realty</p>
            <div className="h-px w-12 bg-sky-500" />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
