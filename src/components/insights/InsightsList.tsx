'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Clock, Star } from 'lucide-react'
import { useT } from '@/components/LanguageProvider'
import { localizePost, categoryLabel, POST_CATEGORIES, type Post } from '@/lib/posts'
import Newsletter from './Newsletter'

const CARD_GRADIENTS: Record<string, string> = {
  Laws: 'from-navy-800 to-navy-900',
  Buying: 'from-sky-600 to-navy-800',
  Selling: 'from-wine to-wine-800',
  Investing: 'from-navy-700 to-sky-800',
  Market: 'from-navy-800 to-sky-900',
  Tips: 'from-sky-700 to-navy-800',
}

function Card({ post, lang, readMore, minRead }: { post: Post; lang: 'en' | 'es'; readMore: string; minRead: string }) {
  const L = localizePost(post, lang)
  const grad = CARD_GRADIENTS[post.category] ?? CARD_GRADIENTS.Market
  return (
    <Link
      href={`/insights/${post.slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-premium hover:-translate-y-1 transition-all overflow-hidden"
    >
      <div
        className={`relative h-40 bg-gradient-to-br ${grad} flex items-end p-4`}
        style={post.cover_image ? { backgroundImage: `url(${post.cover_image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        <span className="relative z-10 px-2.5 py-1 rounded-full bg-white/90 text-navy-900 text-xs font-bold uppercase tracking-wide">
          {categoryLabel(post.category, lang)}
        </span>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h2 className="font-serif text-lg font-bold text-navy-900 leading-snug group-hover:text-wine transition-colors">{L.title}</h2>
        <p className="text-gray-500 text-sm mt-2 line-clamp-3 flex-1">{L.excerpt}</p>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
          <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12} /> {post.read_minutes} {minRead}</span>
          <span className="text-wine text-sm font-semibold flex items-center gap-1">{readMore} <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" /></span>
        </div>
      </div>
    </Link>
  )
}

export default function InsightsList({ posts }: { posts: Post[] }) {
  const { t, lang } = useT()
  const [cat, setCat] = useState<string>('all')

  const featured = posts.find((p) => p.featured) ?? posts[0]
  const rest = posts.filter((p) => p.id !== featured?.id)
  const cats = POST_CATEGORIES.filter((c) => posts.some((p) => p.category === c))

  const showFeatured = cat === 'all' && !!featured
  const gridPosts = cat === 'all' ? rest : posts.filter((p) => p.category === cat)

  const FL = featured ? localizePost(featured, lang) : null
  const featuredGrad = featured ? (CARD_GRADIENTS[featured.category] ?? CARD_GRADIENTS.Market) : ''

  return (
    <section className="pt-28 pb-20 lg:pt-36 lg:pb-28 bg-gradient-to-b from-white to-navy-50/40 min-h-screen">
      <div className="container-max section-padding">
        <header className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-2">{t('insights.eyebrow')}</p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-navy-900 mb-4">{t('insights.title')}</h1>
          <p className="text-gray-500 text-lg">{t('insights.subtitle')}</p>
        </header>

        {posts.length === 0 ? (
          <p className="text-center text-gray-400 py-16">{t('insights.empty')}</p>
        ) : (
          <>
            {/* Featured spotlight */}
            {showFeatured && featured && FL && (
              <Link
                href={`/insights/${featured.slug}`}
                className="group grid lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-gray-100 shadow-card hover:shadow-premium transition-all mb-10 bg-white"
              >
                <div
                  className={`relative min-h-[220px] lg:min-h-[340px] bg-gradient-to-br ${featuredGrad}`}
                  style={featured.cover_image ? { backgroundImage: `url(${featured.cover_image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                >
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/95 text-wine text-xs font-bold uppercase tracking-wide">
                    <Star size={11} className="fill-wine" /> {t('insights.featured')}
                  </span>
                </div>
                <div className="p-7 lg:p-10 flex flex-col justify-center">
                  <span className="text-wine text-xs font-bold uppercase tracking-wide mb-3">{categoryLabel(featured.category, lang)}</span>
                  <h2 className="font-serif text-2xl lg:text-3xl font-bold text-navy-900 leading-tight group-hover:text-wine transition-colors">{FL.title}</h2>
                  <p className="text-gray-500 mt-3 line-clamp-3">{FL.excerpt}</p>
                  <span className="inline-flex items-center gap-1.5 text-wine font-semibold mt-5">
                    {t('insights.readMore')} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            )}

            {/* Category tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              <button
                type="button"
                onClick={() => setCat('all')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${cat === 'all' ? 'bg-navy-900 text-white' : 'bg-white text-navy-700 border border-gray-200 hover:border-navy-300'}`}
              >
                {t('insights.all')}
              </button>
              {cats.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCat(c)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${cat === c ? 'bg-navy-900 text-white' : 'bg-white text-navy-700 border border-gray-200 hover:border-navy-300'}`}
                >
                  {categoryLabel(c, lang)}
                </button>
              ))}
            </div>

            {/* Grid */}
            {gridPosts.length === 0 ? (
              <p className="text-center text-gray-400 py-10">{t('insights.empty')}</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridPosts.map((p) => (
                  <Card key={p.id} post={p} lang={lang} readMore={t('insights.readMore')} minRead={t('insights.minRead')} />
                ))}
              </div>
            )}
          </>
        )}

        <div className="max-w-xl mx-auto mt-16">
          <Newsletter />
        </div>
      </div>
    </section>
  )
}
