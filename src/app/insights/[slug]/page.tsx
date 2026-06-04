import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PublicLayout from '@/components/layout/PublicLayout'
import { safeQuery } from '@/lib/db'
import Article from '@/components/insights/Article'
import type { Post } from '@/lib/posts'

export const revalidate = 300

async function getPost(slug: string): Promise<Post | null> {
  return safeQuery(
    (db) => db.from('posts').select('*').eq('slug', slug).eq('published', true).single(),
    null
  )
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug)
  if (!post) return { title: 'Article — Jordan Padierne' }
  const url = `https://jordanpadierne.com/insights/${post.slug}`
  return {
    title: `${post.title_en} — Jordan Padierne`,
    description: post.excerpt_en ?? undefined,
    alternates: { canonical: url },
    openGraph: {
      title: post.title_en,
      description: post.excerpt_en ?? undefined,
      url,
      type: 'article',
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  }
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)
  if (!post) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title_en,
    description: post.excerpt_en ?? undefined,
    datePublished: post.created_at,
    dateModified: post.updated_at,
    author: { '@type': 'Person', name: post.author, jobTitle: 'Realtor', worksFor: 'eXp Realty' },
    publisher: { '@type': 'Organization', name: 'Jordan Padierne — eXp Realty' },
    mainEntityOfPage: `https://jordanpadierne.com/insights/${post.slug}`,
    image: post.cover_image ?? undefined,
  }

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Article post={post} />
    </PublicLayout>
  )
}
