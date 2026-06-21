'use client'

import Reveal from '@/components/ui/Reveal'
import { useT } from '@/components/LanguageProvider'

// Bilingual section header for server-component sections (Testimonials, Videos).
export default function SectionHeader({
  eyebrowKey, titleKey, highlightKey, subtitleKey,
}: { eyebrowKey: string; titleKey: string; highlightKey?: string; subtitleKey: string }) {
  const { t } = useT()
  return (
    <Reveal className="text-center max-w-2xl mx-auto mb-14">
      <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-3">{t(eyebrowKey)}</p>
      <h2 className="section-title mb-4">
        {t(titleKey)}{highlightKey ? <> <span className="text-sky-500">{t(highlightKey)}</span></> : null}
      </h2>
      <p className="section-subtitle">{t(subtitleKey)}</p>
    </Reveal>
  )
}
