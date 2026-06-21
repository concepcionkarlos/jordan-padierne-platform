'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Home, TrendingUp, Globe, Building2, Star } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import AuroraBackground from '@/components/ui/AuroraBackground'
import { useT } from '@/components/LanguageProvider'

const services = [
  { icon: Home, k: 'buyers', href: '/buy', image: '/images/jordan-house.jpg', color: 'from-sky-500/20 to-sky-500/5' },
  { icon: TrendingUp, k: 'investors', href: '/investors', image: '/images/jordan-terrace.jpg', color: 'from-navy-500/20 to-navy-500/5' },
  { icon: Globe, k: 'intl', href: '/contact', image: '/images/jordan-phone.jpg', color: 'from-wine/20 to-wine/5' },
  { icon: Building2, k: 'precon', href: '/pre-construction', image: '/images/jordan-modern.jpg', color: 'from-sky-400/20 to-sky-400/5' },
  { icon: Star, k: 'luxury', href: '/properties', image: '/images/jordan-luxury.jpg', color: 'from-navy-600/20 to-navy-600/5' },
]

export default function ServicesSection() {
  const { t } = useT()
  return (
    <section className="py-20 lg:py-28 bg-light-gray relative overflow-hidden">
      <AuroraBackground variant="light" />
      <div className="container-max section-padding relative">
        <Reveal className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-3">{t('services.eyebrow')}</p>
          <h2 className="section-title mb-4">
            {t('services.title1')}{' '}
            <span className="text-sky-500">{t('services.titleHighlight')}</span>
          </h2>
          <p className="section-subtitle">{t('services.subtitle')}</p>
        </Reveal>

        {/* Top 3 cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {services.slice(0, 3).map((service, i) => {
            const Icon = service.icon
            return (
              <Reveal key={service.k} variant="up" delay={i * 120}>
                <Link href={service.href} className="group card relative overflow-hidden hover-lift block">
                  <div className="relative h-52 overflow-hidden">
                    <Image src={service.image} alt={t(`services.${service.k}`)} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                    <div className={`absolute inset-0 bg-gradient-to-b ${service.color}`} />
                    <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
                      <Icon size={18} className="text-navy-700" />
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-sky-500 text-xs font-bold uppercase tracking-widest mb-1">{t(`services.${service.k}.tag`)}</p>
                    <h3 className="font-serif text-xl font-bold text-navy-900 mb-2 group-hover:text-navy-700">{t(`services.${service.k}`)}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">{t(`services.${service.k}.desc`)}</p>
                    <span className="flex items-center gap-1.5 text-navy-700 font-semibold text-sm group-hover:gap-2.5 transition-all">
                      {t('services.learnMore')} <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </div>

        {/* Bottom 2 wide cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.slice(3).map((service, i) => {
            const Icon = service.icon
            return (
              <Reveal key={service.k} variant="up" delay={i * 120}>
                <Link href={service.href} className="group card relative overflow-hidden flex flex-col sm:flex-row hover-lift">
                  <div className="relative h-48 sm:h-auto sm:w-48 shrink-0 overflow-hidden">
                    <Image src={service.image} alt={t(`services.${service.k}`)} fill sizes="(max-width: 640px) 100vw, 192px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6 flex flex-col justify-center">
                    <div className="w-9 h-9 rounded-xl bg-navy-50 flex items-center justify-center mb-3">
                      <Icon size={16} className="text-navy-700" />
                    </div>
                    <p className="text-sky-500 text-xs font-bold uppercase tracking-widest mb-1">{t(`services.${service.k}.tag`)}</p>
                    <h3 className="font-serif text-xl font-bold text-navy-900 mb-2">{t(`services.${service.k}`)}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-3">{t(`services.${service.k}.desc`)}</p>
                    <span className="flex items-center gap-1.5 text-navy-700 font-semibold text-sm group-hover:gap-2.5 transition-all">
                      {t('services.learnMore')} <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
