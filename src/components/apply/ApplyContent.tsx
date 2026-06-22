'use client'

import AuroraBackground from '@/components/ui/AuroraBackground'
import RentalApplicationForm from '@/components/forms/RentalApplicationForm'
import { ShieldCheck, Clock, Lock } from 'lucide-react'
import { useT } from '@/components/LanguageProvider'

export default function ApplyContent() {
  const { t } = useT()

  return (
    <>
      <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden">
        <AuroraBackground />
        <div className="container-max section-padding relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-2">{t('apply.eyebrow')}</p>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy-900 mb-3">{t('apply.heading')}</h1>
            <p className="text-gray-500 text-lg">{t('apply.subtitle')}</p>
            <div className="flex flex-wrap items-center justify-center gap-5 mt-5 text-gray-400 text-xs">
              <span className="flex items-center gap-1.5"><Clock size={13} /> {t('apply.trustTime')}</span>
              <span className="flex items-center gap-1.5"><Lock size={13} /> {t('apply.trustPrivate')}</span>
              <span className="flex items-center gap-1.5"><ShieldCheck size={13} /> {t('apply.trustSsn')}</span>
            </div>
          </div>

          <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-premium p-6 sm:p-9">
            <RentalApplicationForm />
          </div>
        </div>
      </section>
    </>
  )
}
