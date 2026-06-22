'use client'

import Image from 'next/image'
import Link from 'next/link'
import AuroraBackground from '@/components/ui/AuroraBackground'
import { CheckCircle2, ArrowRight, Zap, TrendingUp, Building2 } from 'lucide-react'
import { useT } from '@/components/LanguageProvider'
import { useProfile } from '@/components/ProfileProvider'

export default function PreConstructionContent() {
  const { t } = useT()
  const profile = useProfile()

  const benefits = [
    { icon: TrendingUp, title: t('precon.benefit1Title'), description: t('precon.benefit1Desc') },
    { icon: Building2, title: t('precon.benefit2Title'), description: t('precon.benefit2Desc') },
    { icon: Zap, title: t('precon.benefit3Title'), description: t('precon.benefit3Desc') },
    { icon: TrendingUp, title: t('precon.benefit4Title'), description: t('precon.benefit4Desc') },
  ]

  const areas = ['Brickell', 'Downtown Miami', 'Doral', 'Edgewater', 'Wynwood', 'Coral Gables']

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center bg-navy-900 pt-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/jordan-modern.jpg"
            alt="Pre-Construction Miami"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-900/90 via-navy-900/75 to-navy-900/30" />
        </div>
        <AuroraBackground variant="dark" className="mix-blend-screen" />
        <div className="container-max section-padding relative z-10 py-24">
          <div className="inline-flex items-center gap-2 bg-wine/80 backdrop-blur-sm border border-wine/30 rounded-full px-4 py-1.5 mb-6">
            <Zap size={13} className="text-white" fill="currentColor" />
            <span className="text-white text-sm font-semibold">{t('precon.eyebrow')}</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 max-w-2xl">
            {t('precon.h1a')}{' '}
            <span className="text-sky-400">{t('precon.h1b')}</span>{' '}
            {t('precon.h1c')}
          </h1>
          <p className="text-white/75 text-lg max-w-xl mb-8 leading-relaxed">
            {t('precon.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/contact#pre-construction-form" className="btn-wine cta-shine">
              {t('precon.heroCta')} <ArrowRight size={16} />
            </Link>
            <a href={profile.phoneHref} className="btn-outline-white">
              {t('precon.heroCall')} · {profile.phone}
            </a>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="container-max section-padding">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-3">{t('precon.benefitsEyebrow')}</p>
            <h2 className="section-title mb-4">
              {t('precon.benefitsTitle')}{' '}
              <span className="text-sky-500">{t('precon.benefitsHighlight')}</span>
            </h2>
            <p className="section-subtitle">
              {t('precon.benefitsSub')}
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
              <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-3">{t('precon.approachEyebrow')}</p>
              <h2 className="font-serif text-3xl lg:text-4xl font-bold text-navy-900 mb-6">
                {t('precon.approachTitle')}
              </h2>
              <p className="text-gray-500 text-base leading-relaxed mb-6">
                {t('precon.approachIntro')}
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
                {t('precon.approachGuide')}
              </p>
              <Link href="/contact#pre-construction-form" className="btn-wine inline-flex">
                {t('precon.approachCta')} <ArrowRight size={16} />
              </Link>
            </div>
            <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-premium">
              <Image
                src="/images/jordan-about.jpg"
                alt="Jordan Padierne Pre-Construction Expert"
                fill
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/50 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
                <p className="text-white font-serif font-bold text-lg">{t('precon.cardTitle')}</p>
                <p className="text-white/70 text-xs mt-1">{t('precon.cardSub')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy-900 relative overflow-hidden">
        <AuroraBackground variant="dark" className="mix-blend-screen" />
        <div className="container-max section-padding text-center">
          <Zap size={32} className="text-wine mx-auto mb-4" fill="currentColor" />
          <h2 className="font-serif text-3xl font-bold text-white mb-4">
            {t('precon.ctaTitle')}
          </h2>
          <p className="text-navy-200 text-lg mb-8 max-w-xl mx-auto">
            {t('precon.ctaSub')}
          </p>
          <Link href="/contact#pre-construction-form" className="btn-wine inline-flex">
            {t('precon.ctaButton')} <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  )
}
