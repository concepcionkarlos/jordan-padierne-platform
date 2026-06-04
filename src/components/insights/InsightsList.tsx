'use client'

import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'
import { useT } from '@/components/LanguageProvider'
import { localizePost, categoryLabel, type Post } from '@/lib/posts'
import Newsletter from './Newsletter'

const CARD_GRADIENTS: Record<string, string> = {
  Laws: 'from-navy-800 to-navy-900',
  Buying: 'from-sky-600 to-navy-800',
  Selling: 'from-wine to-wine-800',
  Investing: 'from-navy-700 to-sky-800',
  Market: 'from-navy-800 to-sky-900',
  Tips: 'from-sky-700 to-navy-800',
}

export default function InsightsList({ posts }: { posts: Post[] }) {
  const { t, lang } = useT()

  return (
    <section className="pt-28 pb-20 lg:pt-36 lg:pb-28 bg-gradient-to-b from-white to-navy-50/40 min-h-screen">
      <div className="container-max section-padding">
        <header className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-2">{t('insights.eyebrow')}</p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-navy-900 mb-4">{t('insights.title')}</h1>
          <p className="text-gray-500 text-lg">{t('insights.subtitle')}</p>
        </header>

        {posts.length === 0 ? (
          <p className="text-center text-gray-400 py-16">{t('insights.empty')}</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p) => {
              const L = localizePost(p, lang)
              const grad = CARD_GRADIENTS[p.category] ?? CARD_GRADIENTS.Market
              return (
                <Link
                  key={p.id}
                  href={`/insights/${p.slug}`}
                  className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-premium hover:-translate-y-1 transition-all overflow-hidden"
                >
                  <div
                    className={`relative h-40 bg-gradient-to-br ${grad} flex items-end p-4`}
                    style={p.cover_image ? { backgroundImage: `url(${p.cover_image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                  >
                    <span className="relative z-10 px-2.5 py-1 rounded-full bg-white/90 text-navy-900 text-xs font-bold uppercase tracking-wide">
                      {categoryLabel(p.category, lang)}
                    </span>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h2 className="font-serif text-lg font-bold text-navy-900 leading-snug group-hover:text-wine transition-colors">{L.title}</h2>
                    <p className="text-gray-500 text-sm mt-2 line-clamp-3 flex-1">{L.excerpt}</p>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12} /> {p.read_minutes} {t('insights.minRead')}</span>
                      <span className="text-wine text-sm font-semibold flex items-center gap-1">{t('insights.readMore')} <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" /></span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        <div className="max-w-xl mx-auto mt-16">
          <Newsletter />
        </div>
      </div>
    </section>
  )
}
