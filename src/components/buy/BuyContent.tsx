'use client'

import Image from 'next/image'
import Link from 'next/link'
import AuroraBackground from '@/components/ui/AuroraBackground'
import { CheckCircle2, ArrowRight, Home, Search, FileText, Key } from 'lucide-react'
import { useT } from '@/components/LanguageProvider'

export default function BuyContent() {
  const { t } = useT()

  const steps = [
    { icon: Search, step: '01', title: t('buy.step1Title'), description: t('buy.step1Desc') },
    { icon: FileText, step: '02', title: t('buy.step2Title'), description: t('buy.step2Desc') },
    { icon: Home, step: '03', title: t('buy.step3Title'), description: t('buy.step3Desc') },
    { icon: Key, step: '04', title: t('buy.step4Title'), description: t('buy.step4Desc') },
  ]

  const points = [
    t('buy.point1'), t('buy.point2'), t('buy.point3'),
    t('buy.point4'), t('buy.point5'), t('buy.point6'),
  ]

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center bg-navy-900 pt-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/jordan-house.jpg"
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
            {t('buy.eyebrow')}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 max-w-2xl">
            {t('buy.h1')}
          </h1>
          <p className="text-white/75 text-lg max-w-xl mb-8">
            {t('buy.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/book" className="btn-wine cta-shine">
              {t('buy.cta1')} <ArrowRight size={16} />
            </Link>
            <Link href="/properties" className="btn-outline-white">
              {t('buy.cta2')}
            </Link>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-white">
        <div className="container-max section-padding">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-3">{t('buy.processEyebrow')}</p>
            <h2 className="section-title mb-4">{t('buy.processTitle')}{' '}
              <span className="text-sky-500">{t('buy.processHighlight')}</span>
            </h2>
            <p className="section-subtitle">
              {t('buy.processSub')}
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
                src="/images/jordan-luxury.jpg"
                alt="Jordan Padierne Buyer Agent"
                fill
                className="object-cover object-center"
              />
            </div>
            <div>
              <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-3">{t('buy.whyEyebrow')}</p>
              <h2 className="font-serif text-3xl lg:text-4xl font-bold text-navy-900 mb-6">
                {t('buy.whyTitle')}
              </h2>
              <div className="space-y-4 mb-8">
                {points.map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-sky-500 mt-0.5 shrink-0" />
                    <span className="text-navy-700 text-sm">{point}</span>
                  </div>
                ))}
              </div>
              <Link href="/book" className="btn-primary">
                {t('buy.whyCta')} <ArrowRight size={16} />
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
            {t('buy.readyTitle')}
          </h2>
          <p className="text-navy-200 text-lg mb-8 max-w-xl mx-auto">
            {t('buy.readySub')}
          </p>
          <Link href="/contact#buyer-form" className="btn-wine inline-flex">
            {t('buy.readyCta')} <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  )
}
