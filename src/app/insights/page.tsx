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
  return (
    <PublicLayout>
      <InsightsList posts={posts} />
    </PublicLayout>
  )
}
