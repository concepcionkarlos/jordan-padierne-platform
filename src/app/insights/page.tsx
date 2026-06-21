import type { Metadata } from 'next'
import PublicLayout from '@/components/layout/PublicLayout'
import { safeQuery } from '@/lib/db'
import InsightsList from '@/components/insights/InsightsList'
import type { Post } from '@/lib/posts'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Insights & Resources — Jordan Padierne, Miami Realtor',
  description:
    'Real estate insights for South Florida: new Florida laws, market trends, and expert advice on buying, selling, and investing in Miami-Dade. By Realtor Jordan Padierne. Hablamos Español.',
  alternates: { canonical: 'https://jordanpadierne.com/insights' },
}

async function getPosts(): Promise<Post[]> {
  return safeQuery(
    (db) => db.from('posts').select('*').eq('published', true)
      .order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
    []
  )
}

export default async function InsightsPage() {
  const posts = await getPosts()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Jordan Padierne — Insights & Resources',
    description: 'Real estate insights for South Florida: laws, market, buying, selling, and investing.',
    url: 'https://jordanpadierne.com/insights',
    inLanguage: ['en', 'es'],
    publisher: { '@type': 'Organization', name: 'Jordan Padierne — eXp Realty' },
    blogPost: posts.slice(0, 20).map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title_en,
      description: p.excerpt_en ?? undefined,
      datePublished: p.created_at,
      dateModified: p.updated_at,
      url: `https://jordanpadierne.com/insights/${p.slug}`,
      author: { '@type': 'Person', name: p.author },
    })),
  }
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://jordanpadierne.com' },
      { '@type': 'ListItem', position: 2, name: 'Insights', item: 'https://jordanpadierne.com/insights' },
    ],
  }

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, '\\u003c') }} />
      <InsightsList posts={posts} />
    </PublicLayout>
  )
}
