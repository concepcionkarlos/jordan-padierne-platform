'use client'

import Image from 'next/image'
import PublicLayout from '@/components/layout/PublicLayout'
import AuroraBackground from '@/components/ui/AuroraBackground'
import HomeValuationForm from '@/components/forms/HomeValuationForm'
import { TrendingUp, DollarSign, Clock, CheckCircle2 } from 'lucide-react'
import { useT } from '@/components/LanguageProvider'

export default function HomeValueContent() {
  const { t } = useT()

  const benefits = [
    { icon: DollarSign, title: t('homeValue.benefit1Title'), text: t('homeValue.benefit1Text') },
    { icon: TrendingUp, title: t('homeValue.benefit2Title'), text: t('homeValue.benefit2Text') },
    { icon: Clock, title: t('homeValue.benefit3Title'), text: t('homeValue.benefit3Text') },
  ]

  const heroPoints = [
    t('homeValue.heroPoint1'),
    t('homeValue.heroPoint2'),
    t('homeValue.heroPoint3'),
  ]

  return (
    <PublicLayout>
      {/* Hero + form */}
      <section className="relative bg-navy-900 pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/jordan-luxury.jpg" alt="" fill className="object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-900/80 to-navy-900" />
        </div>
        <AuroraBackground variant="dark" className="mix-blend-screen" />
        <div className="container-max section-padding relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Copy */}
            <div>
              <div className="inline-flex items-center gap-2 bg-wine/20 border border-wine/30 rounded-full px-4 py-1.5 mb-6">
                <DollarSign size={13} className="text-white" />
                <span className="text-white text-sm font-semibold">{t('homeValue.badge')}</span>
              </div>
              <h1 className="font-serif text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
                {t('homeValue.h1Part1')}{' '}
                <span className="text-sky-400">{t('homeValue.h1Highlight')}</span>
              </h1>
              <p className="text-white/75 text-lg leading-relaxed mb-8">
                {t('homeValue.subtitle')}
              </p>
              <ul className="space-y-3">
                {heroPoints.map((b) => (
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
