import { safeQuery } from '@/lib/db'
import HomeInsights from './HomeInsights'
import type { Post } from '@/lib/posts'

async function getLatest(): Promise<Post[]> {
  return safeQuery(
    (db) => db.from('posts').select('*').eq('published', true)
      .order('sort_order', { ascending: true }).order('created_at', { ascending: false }).limit(3),
    []
  )
}

// Server wrapper: fetches the 3 latest articles; renders nothing if there are none.
export default async function HomeInsightsSection() {
  const posts = await getLatest()
  if (!posts.length) return null
  return <HomeInsights posts={posts} />
}
