'use client'

import { Shield, Handshake, MapPin, Building2, Users } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import AuroraBackground from '@/components/ui/AuroraBackground'
import { useT } from '@/components/LanguageProvider'

const reasons = [
  { icon: Shield, k: 'trust' },
  { icon: Users, k: 'family' },
  { icon: Handshake, k: 'negotiation' },
  { icon: MapPin, k: 'local' },
  { icon: Building2, k: 'precon' },
  { icon: Users, k: 'intl' },
]

export default function WhyJordanSection() {
  const { t } = useT()
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="container-max section-padding">
        <Reveal className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-3">{t('why.eyebrow')}</p>
          <h2 className="section-title mb-4">
            {t('why.title1')}{' '}
            <span className="text-sky-500">{t('why.titleHighlight')}</span>
          </h2>
          <p className="section-subtitle">{t('why.subtitle')}</p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, i) => {
            const Icon = reason.icon
            return (
              <Reveal key={reason.k} variant="up" delay={(i % 3) * 110} className="group p-8 rounded-2xl border border-gray-100 bg-white hover:bg-sky-50 hover:border-sky-200 hover-lift hover:shadow-card">
                <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center mb-5 group-hover:bg-sky-100 transition-colors">
                  <Icon size={22} className="text-navy-700 group-hover:text-navy-900" />
                </div>
                <h3 className="font-serif text-xl font-bold text-navy-900 mb-3">{t(`why.${reason.k}.title`)}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{t(`why.${reason.k}.desc`)}</p>
              </Reveal>
            )
          })}
        </div>

        <Reveal variant="scale" className="mt-16 bg-navy-900 rounded-3xl p-8 lg:p-12 text-center relative overflow-hidden">
          <AuroraBackground variant="dark" className="mix-blend-screen opacity-70" />
          <div className="relative">
            <blockquote className="font-serif text-2xl lg:text-3xl font-semibold text-white leading-relaxed max-w-3xl mx-auto">
              {t('why.quote')}
            </blockquote>
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-sky-500" />
              <p className="text-sky-400 font-semibold text-sm">Jordan Padierne · eXp Realty</p>
              <div className="h-px w-12 bg-sky-500" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
