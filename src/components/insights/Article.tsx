'use client'

import Link from 'next/link'
import { ArrowLeft, Clock, Calendar } from 'lucide-react'
import { useT } from '@/components/LanguageProvider'
import { localizePost, categoryLabel, renderMarkdown, type Post } from '@/lib/posts'
import ArticleCTA from './ArticleCTA'
import LeadMagnet from './LeadMagnet'
import Newsletter from './Newsletter'

export default function Article({ post }: { post: Post }) {
  const { t, lang } = useT()
  const L = localizePost(post, lang)
  const html = renderMarkdown(L.body)
  const date = new Intl.DateTimeFormat(lang === 'es' ? 'es-US' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(post.created_at))

  return (
    <article className="pt-28 pb-20 lg:pt-32 lg:pb-28 bg-white min-h-screen">
      <div className="container-max section-padding max-w-3xl">
        <Link href="/insights" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-navy-900 mb-7 transition-colors">
          <ArrowLeft size={15} /> {t('insights.backToAll')}
        </Link>

        <header className="mb-7">
          <span className="inline-block px-2.5 py-1 rounded-full bg-wine-50 text-wine text-xs font-bold uppercase tracking-wide mb-4">
            {categoryLabel(post.category, lang)}
          </span>
          <h1 className="font-serif text-3xl lg:text-4xl font-bold text-navy-900 leading-tight">{L.title}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-400">
            <span className="font-medium text-navy-700">{post.author}</span>
            <span className="flex items-center gap-1"><Calendar size={13} /> {date}</span>
            <span className="flex items-center gap-1"><Clock size={13} /> {post.read_minutes} {t('insights.minRead')}</span>
          </div>
        </header>

        {post.cover_image && (
          <div className="rounded-2xl overflow-hidden mb-8 h-56 sm:h-72 bg-navy-100" style={{ backgroundImage: `url(${post.cover_image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        )}

        <div className="article-body text-[1.05rem]" dangerouslySetInnerHTML={{ __html: html }} />

        <ArticleCTA />
        <LeadMagnet slug={post.slug} />
        <div className="mt-10">
          <Newsletter slug={post.slug} />
        </div>
      </div>
    </article>
  )
}
