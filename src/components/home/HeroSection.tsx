'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Phone } from 'lucide-react'
import SocialIcons from '@/components/ui/SocialIcons'
import Reveal from '@/components/ui/Reveal'
import AuroraBackground from '@/components/ui/AuroraBackground'
import { useT } from '@/components/LanguageProvider'

export default function HeroSection() {
  const { t } = useT()
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-navy-900">
      {/* Background Image with slow Ken Burns zoom */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 animate-ken-burns">
          <Image
            src="/images/jordan-hero.png"
            alt="Jordan Padierne — South Florida Realtor"
            fill
            priority
            quality={90}
            className="object-cover object-center"
            style={{ objectPosition: '60% center' }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/90 via-navy-900/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 via-transparent to-navy-900/20" />
        {/* Subtle brand aurora drifting over the gradient */}
        <AuroraBackground variant="dark" className="mix-blend-screen" />
      </div>

      <div className="relative z-10 container-max section-padding pt-28 pb-20 lg:pt-36 lg:pb-28">
        <div className="max-w-2xl">
          <Reveal variant="fade">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span className="text-white/90 text-sm font-medium">{t('hero.badge')}</span>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 text-balance">
              {t('hero.title1')}{' '}
              <span className="text-gradient-animate">{t('hero.titleHighlight')}</span>{' '}
              {t('hero.title2')}
            </h1>
          </Reveal>

          <Reveal delay={220}>
            <p className="text-white/75 text-lg leading-relaxed mb-10 max-w-xl">{t('hero.subtitle')}</p>
          </Reveal>

          <Reveal delay={340}>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact#consultation" className="btn-wine cta-shine pulse-glow text-base px-8 py-4 shadow-premium">
                {t('hero.cta1')}
                <ArrowRight size={18} />
              </Link>
              <Link href="/properties" className="btn-outline-white text-base px-8 py-4">
                {t('hero.cta2')}
              </Link>
            </div>
          </Reveal>

          <Reveal delay={460}>
            <div className="flex flex-wrap items-center gap-6 mt-12 pt-8 border-t border-white/15">
              <div className="text-center">
                <p className="text-white font-bold text-2xl font-serif">{t('hero.trust.languages')}</p>
                <p className="text-white/60 text-xs mt-0.5">{t('hero.trust.languagesSub')}</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <p className="text-white font-semibold text-sm">{t('hero.trust.specialist')}</p>
                <p className="text-white/60 text-xs">{t('hero.trust.specialistSub')}</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <p className="text-white font-semibold text-sm">{t('hero.trust.areas')}</p>
                <p className="text-white/60 text-xs">{t('hero.trust.areasSub')}</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <a href="tel:+13057996973" className="flex items-center gap-2 text-white hover:text-sky-300 transition-colors">
                <Phone size={16} className="text-sky-400" />
                <span className="font-semibold text-sm">305-799-6973</span>
              </a>
              <div className="w-px h-10 bg-white/20" />
              <SocialIcons variant="light" />
            </div>
          </Reveal>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 animate-bounce">
        <div className="w-px h-8 bg-white/30" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
      </div>
    </section>
  )
}
