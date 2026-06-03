'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { dict, type Lang } from '@/lib/i18n'

interface LangCtx {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const Ctx = createContext<LangCtx>({ lang: 'en', setLang: () => {}, t: (k) => k })

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    // 1) saved choice wins
    const saved = localStorage.getItem('jp-lang') as Lang | null
    if (saved === 'en' || saved === 'es') { setLangState(saved); return }
    // 2) otherwise auto-detect from the browser — Spanish speakers see Spanish
    const browser = (navigator.language || '').toLowerCase()
    setLangState(browser.startsWith('es') ? 'es' : 'en')
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('jp-lang', l)
    document.documentElement.lang = l
  }

  const t = (key: string): string => {
    const table = dict[lang] as Record<string, string>
    return table[key] ?? (dict.en as Record<string, string>)[key] ?? key
  }

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>
}

export function useT() {
  return useContext(Ctx)
}
