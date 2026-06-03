import type { MetadataRoute } from 'next'

const BASE = 'https://jordanpadierne.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/about', '/buy', '/pre-construction', '/investors', '/properties', '/home-value', '/book', '/contact']
  const now = new Date()
  return routes.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === '' || path === '/properties' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : path === '/properties' || path === '/contact' || path === '/book' ? 0.9 : 0.8,
  }))
}
