'use client'

import Link from 'next/link'
import { Search, Phone, Building2, Home, DollarSign } from 'lucide-react'
import { useT } from '@/components/LanguageProvider'
import { useProfile } from '@/components/ProfileProvider'

export default function PropertiesMlsCta() {
  const { t } = useT()
  const profile = useProfile()

  const items = [
    { label: t('properties.cardCondosLabel'), icon: Building2, desc: t('properties.cardCondosDesc') },
    { label: t('properties.cardHomesLabel'), icon: Home, desc: t('properties.cardHomesDesc') },
    { label: t('properties.cardPreconLabel'), icon: DollarSign, desc: t('properties.cardPreconDesc') },
    { label: t('properties.cardLuxuryLabel'), icon: Building2, desc: t('properties.cardLuxuryDesc') },
  ]

  return (
    <section className="py-20 bg-light-gray">
      <div className="container-max section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-3">{t('properties.mlsEyebrow')}</p>
            <h2 className="font-serif text-3xl font-bold text-navy-900 mb-6">{t('properties.mlsTitle')}</h2>
            <p className="text-gray-500 text-base leading-relaxed mb-6">
              {t('properties.mlsDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/book" className="btn-primary"><Search size={16} /> {t('properties.startSearch')}</Link>
              <a href={profile.phoneHref} className="btn-secondary"><Phone size={16} /> {t('properties.callJordan')}</a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {items.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <Icon size={20} className="text-navy-600 mb-3" />
                  <p className="font-semibold text-navy-900 text-sm mb-1">{item.label}</p>
                  <p className="text-gray-400 text-xs">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
