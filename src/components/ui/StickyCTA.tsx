'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Phone } from 'lucide-react'
import { useT } from '@/components/LanguageProvider'
import { useProfile } from '@/components/ProfileProvider'

// Slides up a persistent "Schedule Consultation" bar once the user scrolls past
// the hero — keeps the primary conversion action one tap away. Mobile-first.
export default function StickyCTA() {
  const { t } = useT()
  const profile = useProfile()
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.9)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden animate-slide-up-bar" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_24px_rgba(10,22,40,0.1)] px-4 py-3 flex items-center gap-3">
        <a href={profile.phoneHref} className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center text-navy-700 shrink-0" aria-label="Call Jordan">
          <Phone size={20} />
        </a>
        <Link href="/book" className="btn-wine cta-shine flex-1 justify-center py-3.5">
          <Calendar size={16} /> {t('sticky.schedule')}
        </Link>
      </div>
    </div>
  )
}
