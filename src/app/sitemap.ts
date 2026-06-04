import type { MetadataRoute } from 'next'
import { safeQuery } from '@/lib/db'

const BASE = 'https://jordanpadierne.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = ['', '/about', '/buy', '/pre-construction', '/investors', '/properties', '/home-value', '/apply', '/book', '/insights', '/contact']
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = routes.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === '' || path === '/properties' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : ['/properties', '/contact', '/book', '/insights'].includes(path) ? 0.9 : 0.8,
  }))

  // Published articles
  const posts: Array<{ slug: string; updated_at: string }> = await safeQuery(
    (db) => db.from('posts').select('slug, updated_at').eq('published', true),
    []
  )
  const postEntries: MetadataRoute.Sitemap = (posts ?? []).map((p) => ({
    url: `${BASE}/insights/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticEntries, ...postEntries]
}
