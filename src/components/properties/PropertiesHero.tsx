'use client'

import AuroraBackground from '@/components/ui/AuroraBackground'
import { Search } from 'lucide-react'
import { useT } from '@/components/LanguageProvider'

export default function PropertiesHero() {
  const { t } = useT()

  return (
    <section className="bg-navy-900 pt-28 pb-16 relative overflow-hidden">
      <AuroraBackground variant="dark" className="mix-blend-screen" />
      <div className="container-max section-padding relative">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sky-400 font-semibold text-sm uppercase tracking-widest mb-4">{t('properties.eyebrow')}</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-6">
            {t('properties.h1Lead')} <span className="text-sky-400">{t('properties.h1Highlight')}</span>
          </h1>
          <p className="text-navy-200 text-lg mb-10">
            {t('properties.subtitle')}
          </p>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-4 max-w-lg mx-auto">
            <Search size={18} className="text-white/60" />
            <p className="text-white/60 text-sm">{t('properties.heroNote')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
