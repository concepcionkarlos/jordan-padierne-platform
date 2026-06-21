'use client'

import Image from 'next/image'
import Link from 'next/link'
import PublicLayout from '@/components/layout/PublicLayout'
import AuroraBackground from '@/components/ui/AuroraBackground'
import { TrendingUp, DollarSign, BarChart2, CheckCircle2, ArrowRight } from 'lucide-react'
import { useT } from '@/components/LanguageProvider'

export default function InvestorsContent() {
  const { t } = useT()

  const investmentTypes = [
    {
      icon: TrendingUp,
      title: t('investors.type1Title'),
      description: t('investors.type1Desc'),
      return: t('investors.type1Return'),
    },
    {
      icon: DollarSign,
      title: t('investors.type2Title'),
      description: t('investors.type2Desc'),
      return: t('investors.type2Return'),
    },
    {
      icon: BarChart2,
      title: t('investors.type3Title'),
      description: t('investors.type3Desc'),
      return: t('investors.type3Return'),
    },
    {
      icon: TrendingUp,
      title: t('investors.type4Title'),
      description: t('investors.type4Desc'),
      return: t('investors.type4Return'),
    },
  ]

  const points = [
    t('investors.point1'),
    t('investors.point2'),
    t('investors.point3'),
    t('investors.point4'),
    t('investors.point5'),
    t('investors.point6'),
  ]

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative min-h-[65vh] flex items-center bg-navy-900 pt-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/jordan-terrace.jpg"
            alt="Investment Properties Miami"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-900/90 via-navy-900/70 to-navy-900/20" />
        </div>
        <AuroraBackground variant="dark" className="mix-blend-screen" />
        <div className="container-max section-padding relative z-10 py-24">
          <p className="text-sky-400 font-semibold text-sm uppercase tracking-widest mb-4">
            {t('investors.eyebrow')}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 max-w-2xl">
            {t('investors.h1')}{' '}
            <span className="text-sky-400">{t('investors.h1Highlight')}</span>
          </h1>
          <p className="text-white/75 text-lg max-w-xl mb-8">
            {t('investors.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/contact#investor-form" className="btn-wine cta-shine">
              {t('investors.cta1')} <ArrowRight size={16} />
            </Link>
            <Link href="/pre-construction" className="btn-outline-white">
              {t('investors.cta2')}
            </Link>
          </div>
        </div>
      </section>

      {/* Investment types */}
      <section className="py-20 bg-white">
        <div className="container-max section-padding">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-3">{t('investors.strategiesEyebrow')}</p>
            <h2 className="section-title mb-4">
              {t('investors.strategiesTitle')}{' '}
              <span className="text-sky-500">{t('investors.strategiesHighlight')}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {investmentTypes.map((type) => {
              const Icon = type.icon
              return (
                <div key={type.title} className="p-7 rounded-2xl border border-gray-100 hover:border-sky-200 hover:shadow-card transition-all group">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center group-hover:bg-sky-50 transition-colors">
                      <Icon size={22} className="text-navy-700" />
                    </div>
                    <span className="bg-sky-50 text-sky-600 text-xs font-semibold px-3 py-1 rounded-full">
                      {type.return}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-navy-900 mb-2">{type.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{type.description}</p>
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
              <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-3">{t('investors.whyEyebrow')}</p>
              <h2 className="font-serif text-3xl lg:text-4xl font-bold text-navy-900 mb-6">
                {t('investors.whyTitle')}
              </h2>
              <div className="space-y-4 mb-8">
                {points.map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-sky-500 mt-0.5 shrink-0" />
                    <span className="text-navy-700 text-sm">{point}</span>
                  </div>
                ))}
              </div>
              <Link href="/contact#investor-form" className="btn-primary inline-flex">
                {t('investors.whyCta')} <ArrowRight size={16} />
              </Link>
            </div>
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-premium">
              <Image
                src="/images/jordan-luxury.jpg"
                alt="Miami Investment Properties"
                fill
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy-900 relative overflow-hidden">
        <AuroraBackground variant="dark" className="mix-blend-screen" />
        <div className="container-max section-padding text-center">
          <h2 className="font-serif text-3xl font-bold text-white mb-4">
            {t('investors.readyTitle')}
          </h2>
          <p className="text-navy-200 text-lg mb-8 max-w-xl mx-auto">
            {t('investors.readySub')}
          </p>
          <Link href="/contact#investor-form" className="btn-wine inline-flex">
            {t('investors.readyCta')} <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </PublicLayout>
  )
}
