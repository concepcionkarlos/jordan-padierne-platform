'use client'

import { useT } from './LanguageProvider'
import { cn } from '@/lib/utils'

export default function LanguageToggle({ light = false }: { light?: boolean }) {
  const { lang, setLang } = useT()
  return (
    <div className={cn('inline-flex items-center rounded-lg p-0.5 text-xs font-bold', light ? 'bg-white/15' : 'bg-gray-100')}>
      <button
        type="button"
        onClick={() => setLang('en')}
        className={cn('px-2 py-1 rounded-md transition-colors', lang === 'en'
          ? (light ? 'bg-white text-navy-900' : 'bg-white text-navy-900 shadow-sm')
          : (light ? 'text-white/70' : 'text-gray-400'))}
        aria-label="English"
      >EN</button>
      <button
        type="button"
        onClick={() => setLang('es')}
        className={cn('px-2 py-1 rounded-md transition-colors', lang === 'es'
          ? (light ? 'bg-white text-navy-900' : 'bg-white text-navy-900 shadow-sm')
          : (light ? 'text-white/70' : 'text-gray-400'))}
        aria-label="Español"
      >ES</button>
    </div>
  )
}
