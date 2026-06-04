'use client'

import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'
import { useT } from '@/components/LanguageProvider'
import { localizePost, categoryLabel, type Post } from '@/lib/posts'

const CARD_GRADIENTS: Record<string, string> = {
  Laws: 'from-navy-800 to-navy-900',
  Buying: 'from-sky-600 to-navy-800',
  Selling: 'from-wine to-wine-800',
  Investing: 'from-navy-700 to-sky-800',
  Market: 'from-navy-800 to-sky-900',
  Tips: 'from-sky-700 to-navy-800',
}

export default function HomeInsights({ posts }: { posts: Post[] }) {
  const { t, lang } = useT()
  if (!posts.length) return null

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="container-max section-padding">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div className="max-w-xl">
            <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-3">{t('insights.eyebrow')}</p>
            <h2 className="section-title mb-3">{t('insights.home.title')}</h2>
            <p className="section-subtitle">{t('insights.subtitle')}</p>
          </div>
          <Link href="/insights" className="hidden sm:inline-flex items-center gap-1.5 text-wine font-semibold whitespace-nowrap hover:gap-2.5 transition-all">
            {t('insights.viewAll')} <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
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
                  <h3 className="font-serif text-lg font-bold text-navy-900 leading-snug group-hover:text-wine transition-colors">{L.title}</h3>
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

        <div className="text-center mt-10 sm:hidden">
          <Link href="/insights" className="btn-secondary inline-flex">
            {t('insights.viewAll')} <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
