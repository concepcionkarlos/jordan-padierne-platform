'use client'

import { useState } from 'react'
import { Copy, Check, MessageSquare, Mail, MessageCircle } from 'lucide-react'
import { TEMPLATES, fillTemplate, TEMPLATE_CATEGORIES } from '@/lib/templates'

interface Props {
  leadName: string
  leadPhone?: string
  leadEmail?: string
}

export default function TemplatesPanel({ leadName, leadPhone, leadEmail }: Props) {
  const [lang, setLang] = useState<'en' | 'es'>('en')
  const [category, setCategory] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filtered = category === 'all' ? TEMPLATES : TEMPLATES.filter((t) => t.category === category)

  function copy(id: string, text: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  function whatsappLink(text: string) {
    const phone = (leadPhone ?? '').replace(/\D/g, '')
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
  }

  function emailLink(text: string) {
    return `mailto:${leadEmail ?? ''}?body=${encodeURIComponent(text)}`
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2 flex-wrap">
        <MessageSquare size={15} className="text-sky-400" />
        <h3 className="font-semibold text-navy-900 text-sm">Quick Messages</h3>
        {/* Lang toggle */}
        <div className="ml-auto flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          <button type="button" onClick={() => setLang('en')} className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${lang === 'en' ? 'bg-white text-navy-900 shadow-sm' : 'text-gray-400'}`}>EN</button>
          <button type="button" onClick={() => setLang('es')} className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${lang === 'es' ? 'bg-white text-navy-900 shadow-sm' : 'text-gray-400'}`}>ES</button>
        </div>
      </div>

      {/* Category chips */}
      <div className="px-5 pt-3 flex flex-wrap gap-1.5">
        <button type="button" onClick={() => setCategory('all')} className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${category === 'all' ? 'bg-navy-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>All</button>
        {TEMPLATE_CATEGORIES.map((c) => (
          <button key={c.id} type="button" onClick={() => setCategory(c.id)} className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${category === c.id ? 'bg-navy-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>{c.label}</button>
        ))}
      </div>

      <div className="p-5 space-y-3">
        {filtered.map((t) => {
          const text = fillTemplate(lang === 'en' ? t.en : t.es, leadName)
          return (
            <div key={t.id} className="rounded-xl border border-gray-100 p-3.5 hover:border-sky-200 transition-colors">
              <p className="text-xs font-semibold text-navy-900 mb-1.5">{t.label}</p>
              <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-3">{text}</p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => copy(t.id, text)} className="inline-flex items-center gap-1 text-xs font-semibold text-navy-600 hover:text-navy-900">
                  {copiedId === t.id ? <><Check size={12} className="text-green-500" /> Copied</> : <><Copy size={12} /> Copy</>}
                </button>
                {leadPhone && (
                  <a href={whatsappLink(text)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700">
                    <MessageCircle size={12} /> WhatsApp
                  </a>
                )}
                {leadEmail && (
                  <a href={emailLink(text)} className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700">
                    <Mail size={12} /> Email
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
