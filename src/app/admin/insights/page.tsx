export const dynamic = 'force-dynamic'

import { safeQuery } from '@/lib/db'
import PostsManager from '@/components/admin/PostsManager'
import type { Post } from '@/lib/posts'

async function getPosts(): Promise<Post[]> {
  return safeQuery(
    (db) => db.from('posts').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
    []
  )
}

export default async function AdminInsightsPage() {
  const posts = await getPosts()
  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <PostsManager initial={posts} />
    </div>
  )
}
