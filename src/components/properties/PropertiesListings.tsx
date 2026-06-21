'use client'

import Link from 'next/link'
import { Search, Phone, Building2 } from 'lucide-react'
import { useT } from '@/components/LanguageProvider'
import { useProfile } from '@/components/ProfileProvider'
import PropertiesGrid from '@/components/PropertiesGrid'

interface Props {
  properties: any[]
}

export default function PropertiesListings({ properties }: Props) {
  const { t } = useT()
  const profile = useProfile()
  const hasListings = properties.length > 0

  return (
    <section className="py-20 bg-white">
      <div className="container-max section-padding">
        {hasListings ? (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-2xl font-bold text-navy-900">{t('properties.availableTitle')}</h2>
              <span className="text-sm text-gray-400">{properties.length} {t('properties.listingsLabel')}</span>
            </div>
            <PropertiesGrid properties={properties} />
          </>
        ) : (
          <div className="max-w-xl mx-auto text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-navy-50 flex items-center justify-center mx-auto mb-6">
              <Building2 size={28} className="text-navy-600" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-navy-900 mb-3">{t('properties.emptyTitle')}</h2>
            <p className="text-gray-500 leading-relaxed mb-8">
              {t('properties.emptyDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book" className="btn-wine cta-shine"><Search size={16} /> {t('properties.startSearch')}</Link>
              <a href={profile.phoneHref} className="btn-secondary"><Phone size={16} /> {t('properties.callJordan')}</a>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
