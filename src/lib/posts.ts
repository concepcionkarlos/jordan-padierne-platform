// Insights (blog) helpers. Posts are bilingual; the UI picks EN/ES at render time.

export interface Post {
  id: string
  created_at: string
  updated_at: string
  slug: string
  category: string
  cover_image: string | null
  author: string
  read_minutes: number
  published: boolean
  featured: boolean
  sort_order: number
  title_en: string
  title_es: string | null
  excerpt_en: string | null
  excerpt_es: string | null
  body_en: string
  body_es: string | null
}

export const POST_CATEGORIES = ['Laws', 'Buying', 'Selling', 'Investing', 'Market', 'Tips'] as const

export const CATEGORY_LABELS: Record<string, { en: string; es: string }> = {
  Laws: { en: 'Laws & Rules', es: 'Leyes y Reglas' },
  Buying: { en: 'Buying', es: 'Comprar' },
  Selling: { en: 'Selling', es: 'Vender' },
  Investing: { en: 'Investing', es: 'Invertir' },
  Market: { en: 'Market', es: 'Mercado' },
  Tips: { en: 'Tips', es: 'Consejos' },
}

export function categoryLabel(cat: string, lang: 'en' | 'es'): string {
  return CATEGORY_LABELS[cat]?.[lang] ?? cat
}

export function slugify(input: string): string {
  return (input || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 80)
}

// Pick the right language fields, falling back to English when a translation is missing.
export function localizePost(post: Post, lang: 'en' | 'es') {
  const pick = (en: string | null, es: string | null) =>
    (lang === 'es' && es && es.trim() ? es : en) ?? ''
  return {
    title: pick(post.title_en, post.title_es),
    excerpt: pick(post.excerpt_en, post.excerpt_es),
    body: pick(post.body_en, post.body_es),
  }
}

// Lightweight, dependency-free Markdown → HTML for a safe subset.
// Content is admin-authored (trusted) but we still escape raw HTML first.
export function renderMarkdown(src: string): string {
  if (!src) return ''
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const inline = (s: string) =>
    esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[(.+?)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-wine font-medium underline">$1</a>')

  const lines = src.replace(/\r\n/g, '\n').split('\n')
  const out: string[] = []
  let inList = false
  const closeList = () => { if (inList) { out.push('</ul>'); inList = false } }

  for (const raw of lines) {
    const line = raw.trimEnd()
    if (!line.trim()) { closeList(); continue }
    if (/^###\s+/.test(line)) {
      closeList()
      out.push(`<h3 class="font-serif text-xl font-bold text-navy-900 mt-7 mb-2">${inline(line.replace(/^###\s+/, ''))}</h3>`)
    } else if (/^##\s+/.test(line)) {
      closeList()
      out.push(`<h2 class="font-serif text-2xl font-bold text-navy-900 mt-9 mb-3">${inline(line.replace(/^##\s+/, ''))}</h2>`)
    } else if (/^[-*]\s+/.test(line)) {
      if (!inList) { out.push('<ul class="list-disc pl-5 my-4 space-y-1.5 text-gray-700">'); inList = true }
      out.push(`<li>${inline(line.replace(/^[-*]\s+/, ''))}</li>`)
    } else {
      closeList()
      out.push(`<p class="text-gray-700 leading-relaxed my-4">${inline(line)}</p>`)
    }
  }
  closeList()
  return out.join('\n')
}
