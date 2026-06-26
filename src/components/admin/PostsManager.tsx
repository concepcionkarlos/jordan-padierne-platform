'use client'

import { useState, useRef } from 'react'
import { Plus, Trash2, Pencil, X, FileText, Eye, EyeOff, ExternalLink } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import { POST_CATEGORIES, categoryLabel, type Post } from '@/lib/posts'
import { toast } from '@/lib/toast'
import { useModalA11y } from '@/lib/useModalA11y'

type Draft = Partial<Post>

const EMPTY: Draft = {
  category: 'Market', read_minutes: 3, published: true, featured: false,
  title_en: '', title_es: '', excerpt_en: '', excerpt_es: '', body_en: '', body_es: '', cover_image: '', slug: '',
}

export default function PostsManager({ initial }: { initial: Post[] }) {
  const [items, setItems] = useState<Post[]>(initial)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [saving, setSaving] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  useModalA11y(open, () => setOpen(false), modalRef)

  const set = (k: keyof Draft, v: any) => setDraft((d) => ({ ...d, [k]: v }))

  function startNew() { setDraft(EMPTY); setOpen(true) }
  function startEdit(p: Post) { setDraft({ ...p }); setOpen(true) }

  async function save() {
    if (!draft.title_en?.trim() || !draft.body_en?.trim()) { toast('English title and body are required.', { type: 'warn' }); return }
    setSaving(true)
    const editing = !!draft.id
    try {
      const res = await fetch('/api/posts', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      const json = await res.json().catch(() => ({ success: false }))
      if (res.ok && json.success) {
        setItems((prev) => editing ? prev.map((p) => p.id === json.data.id ? json.data : p) : [json.data, ...prev])
        setOpen(false)
        toast(editing ? 'Article updated' : 'Article saved', { type: 'success' })
      } else {
        toast('Couldn’t save the article — please try again.', { type: 'warn' })
      }
    } catch {
      toast('Couldn’t save the article — check your connection.', { type: 'warn' })
    } finally {
      setSaving(false)
    }
  }

  async function togglePublish(p: Post) {
    try {
      const res = await fetch('/api/posts', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: p.id, published: !p.published }),
      })
      const json = await res.json().catch(() => ({ success: false }))
      if (res.ok && json.success) setItems((prev) => prev.map((x) => x.id === p.id ? json.data : x))
      else toast('Couldn’t update the article.', { type: 'warn' })
    } catch {
      toast('Couldn’t update the article.', { type: 'warn' })
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this article permanently?')) return
    const prev = items
    setItems((p) => p.filter((x) => x.id !== id))
    try {
      const res = await fetch(`/api/posts?id=${id}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({ success: false }))
      if (!res.ok || !json.success) { setItems(prev); toast('Couldn’t delete — please try again.', { type: 'warn' }) }
    } catch {
      setItems(prev); toast('Couldn’t delete — please try again.', { type: 'warn' })
    }
  }

  return (
    <div>
      <PageHeader
        title="Insights"
        subtitle={<>{items.length} articles · <a href="/insights" target="_blank" className="text-sky-600 hover:underline inline-flex items-center gap-0.5">view live <ExternalLink size={11} /></a></>}
        action={<button type="button" onClick={startNew} className="btn-primary text-sm px-4 py-2.5"><Plus size={15} /> New Article</button>}
      />

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <FileText size={40} className="text-gray-200 mx-auto mb-4" />
          <h3 className="font-serif text-lg font-bold text-navy-900 mb-2">No Articles Yet</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">Write your first article. It appears instantly on your website and helps you rank on Google.</p>
          <button type="button" onClick={startNew} className="btn-primary"><Plus size={16} /> Write First Article</button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full bg-navy-50 text-navy-700 text-[11px] font-bold uppercase tracking-wide">{categoryLabel(p.category, 'en')}</span>
                  {p.featured && <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[11px] font-bold">★ Featured</span>}
                  {!p.published && <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[11px] font-bold">Draft</span>}
                </div>
                <p className="font-semibold text-navy-900 truncate mt-1">{p.title_en}</p>
                <p className="text-gray-400 text-xs truncate">/{p.slug} · {p.read_minutes} min{p.title_es ? ' · EN/ES' : ' · EN only'}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button type="button" onClick={() => togglePublish(p)} className="w-8 h-8 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-navy-900" title={p.published ? 'Unpublish' : 'Publish'}>{p.published ? <Eye size={15} /> : <EyeOff size={15} />}</button>
                <button type="button" onClick={() => startEdit(p)} className="w-8 h-8 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-navy-900" title="Edit"><Pencil size={14} /></button>
                <button type="button" onClick={() => remove(p.id)} className="w-8 h-8 rounded-lg hover:bg-wine-50 flex items-center justify-center text-gray-400 hover:text-wine" title="Delete"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div ref={modalRef} role="dialog" aria-modal="true" aria-label={draft.id ? 'Edit article' : 'New article'} tabIndex={-1} className="relative bg-white rounded-2xl shadow-premium w-full max-w-2xl my-8">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-10">
              <h2 className="font-serif text-lg font-bold text-navy-900">{draft.id ? 'Edit Article' : 'New Article'}</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-navy-900" aria-label="Close"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-5">
              {/* Meta */}
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="label">Category</label>
                  <select value={draft.category} onChange={(e) => set('category', e.target.value)} className="input-field" title="Category">
                    {POST_CATEGORIES.map((c) => <option key={c} value={c}>{categoryLabel(c, 'en')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Read time (min)</label>
                  <input type="number" min={1} value={draft.read_minutes ?? 3} onChange={(e) => set('read_minutes', e.target.value)} className="input-field" title="Read time in minutes" />
                </div>
                <div className="flex items-end gap-4 pb-1">
                  <label className="flex items-center gap-2 text-sm text-navy-700"><input type="checkbox" checked={!!draft.published} onChange={(e) => set('published', e.target.checked)} /> Published</label>
                  <label className="flex items-center gap-2 text-sm text-navy-700"><input type="checkbox" checked={!!draft.featured} onChange={(e) => set('featured', e.target.checked)} /> Featured</label>
                </div>
              </div>
              <div>
                <label className="label">Cover image URL (optional)</label>
                <input value={draft.cover_image ?? ''} onChange={(e) => set('cover_image', e.target.value)} className="input-field" placeholder="https://… (leave blank for a branded gradient)" />
              </div>

              {/* English */}
              <div className="rounded-xl border border-gray-100 p-4 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">English</p>
                <div>
                  <label className="label">Title *</label>
                  <input value={draft.title_en ?? ''} onChange={(e) => set('title_en', e.target.value)} className="input-field" placeholder="New Florida real estate rules…" />
                </div>
                <div>
                  <label className="label">Excerpt</label>
                  <textarea rows={2} value={draft.excerpt_en ?? ''} onChange={(e) => set('excerpt_en', e.target.value)} className="input-field resize-none" placeholder="One or two sentences shown on the card." />
                </div>
                <div>
                  <label className="label">Body * (Markdown: ## heading, **bold**, - list)</label>
                  <textarea rows={8} value={draft.body_en ?? ''} onChange={(e) => set('body_en', e.target.value)} className="input-field resize-y font-mono text-sm" placeholder={'## Subheading\n\nYour paragraph...\n\n- A point\n- Another point'} />
                </div>
              </div>

              {/* Spanish */}
              <div className="rounded-xl border border-gray-100 p-4 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Español (opcional — si lo dejas vacío, se muestra el inglés)</p>
                <div>
                  <label className="label">Título</label>
                  <input value={draft.title_es ?? ''} onChange={(e) => set('title_es', e.target.value)} className="input-field" title="Título en español" placeholder="(opcional)" />
                </div>
                <div>
                  <label className="label">Extracto</label>
                  <textarea rows={2} value={draft.excerpt_es ?? ''} onChange={(e) => set('excerpt_es', e.target.value)} className="input-field resize-none" title="Extracto en español" placeholder="(opcional)" />
                </div>
                <div>
                  <label className="label">Cuerpo (Markdown)</label>
                  <textarea rows={8} value={draft.body_es ?? ''} onChange={(e) => set('body_es', e.target.value)} className="input-field resize-y font-mono text-sm" title="Cuerpo en español" placeholder="(opcional)" />
                </div>
              </div>

              <div>
                <label className="label">Custom URL slug (optional)</label>
                <input value={draft.slug ?? ''} onChange={(e) => set('slug', e.target.value)} className="input-field" placeholder="auto-generated from the English title" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white rounded-b-3xl">
              <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="button" onClick={save} disabled={saving} className="btn-primary flex-1 disabled:opacity-50">{saving ? 'Saving…' : (draft.id ? 'Save Changes' : 'Publish Article')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
