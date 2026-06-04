'use client'

import Link from 'next/link'
import { CalendarCheck } from 'lucide-react'
import { useT } from '@/components/LanguageProvider'

// Consultation CTA dropped into / under each article — pulls the reader to /book.
export default function ArticleCTA() {
  const { t } = useT()
  return (
    <div className="my-10 rounded-2xl bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 p-6 sm:p-8 text-center shadow-premium">
      <h3 className="font-serif text-2xl font-bold text-white mb-2">{t('insights.cta.title')}</h3>
      <p className="text-navy-200 mb-5 max-w-md mx-auto">{t('insights.cta.body')}</p>
      <Link href="/book" className="btn-wine cta-shine inline-flex">
        <CalendarCheck size={16} /> {t('insights.cta.button')}
      </Link>
    </div>
  )
}
