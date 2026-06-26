'use client'

import { useState, useRef } from 'react'
import { Plus, X, Star, Trash2, Quote, MessageSquareQuote } from 'lucide-react'
import { toast } from '@/lib/toast'
import { useModalA11y } from '@/lib/useModalA11y'

export default function TestimonialsManager({ initial }: { initial: any[] }) {
  const [items, setItems] = useState<any[]>(initial)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ client_name: '', client_role: 'Buyer', location: '', rating: 5, quote: '' })
  const modalRef = useRef<HTMLDivElement>(null)
  useModalA11y(open, () => setOpen(false), modalRef)

  async function save() {
    if (!form.client_name.trim() || !form.quote.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, featured: true }),
      })
      const json = await res.json().catch(() => ({ success: false }))
      if (res.ok && json.success) {
        setItems((p) => [json.data, ...p])
        setForm({ client_name: '', client_role: 'Buyer', location: '', rating: 5, quote: '' })
        setOpen(false)
        toast('Review published', { type: 'success' })
      } else {
        toast('Couldn’t save the review — please try again.', { type: 'warn' })
      }
    } catch {
      toast('Couldn’t save the review — check your connection.', { type: 'warn' })
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this testimonial?')) return
    const prev = items
    setItems((p) => p.filter((x) => x.id !== id))
    try {
      const res = await fetch(`/api/testimonials?id=${id}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({ success: false }))
      if (!res.ok || !json.success) { setItems(prev); toast('Couldn’t delete — please try again.', { type: 'warn' }) }
    } catch {
      setItems(prev); toast('Couldn’t delete — please try again.', { type: 'warn' })
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy-900">Testimonials</h1>
          <p className="text-gray-500 text-sm mt-0.5">{items.length} reviews · shown live on your home page</p>
        </div>
        <button type="button" onClick={() => setOpen(true)} className="btn-primary text-sm px-4 py-2.5"><Plus size={15} /> Add Review</button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <MessageSquareQuote size={40} className="text-gray-200 mx-auto mb-4" />
          <h3 className="font-serif text-lg font-bold text-navy-900 mb-2">No Reviews Yet</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">Add real client reviews — they appear instantly on your website&apos;s testimonials section.</p>
          <button type="button" onClick={() => setOpen(true)} className="btn-primary"><Plus size={16} /> Add First Review</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm relative group">
              <button type="button" onClick={() => remove(t.id)} className="absolute top-4 right-4 text-gray-300 hover:text-wine opacity-0 group-hover:opacity-100 transition-all" aria-label="Delete"><Trash2 size={14} /></button>
              <Quote size={26} className="text-sky-200 mb-3" />
              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: 5 }).map((_, s) => <Star key={s} size={13} className={s < t.rating ? 'text-amber-400' : 'text-gray-200'} fill="currentColor" />)}
              </div>
              <p className="text-navy-700 text-sm leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
              <p className="font-semibold text-navy-900 text-sm">{t.client_name}</p>
              <p className="text-gray-400 text-xs">{t.client_role}{t.location ? ` · ${t.location}` : ''}</p>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div ref={modalRef} role="dialog" aria-modal="true" aria-label="Add review" tabIndex={-1} className="relative bg-white rounded-3xl shadow-premium w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-navy-900">Add Review</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-navy-900" aria-label="Close"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Client Name *</label>
                  <input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} className="input-field" placeholder="Maria G." />
                </div>
                <div>
                  <label className="label">Type</label>
                  <select value={form.client_role} onChange={(e) => setForm({ ...form, client_role: e.target.value })} className="input-field" title="Client type">
                    {['Buyer', 'Seller', 'Investor', 'International Buyer', 'First-Time Buyer', 'Luxury Buyer'].map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Location</label>
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-field" placeholder="Brickell" />
                </div>
                <div>
                  <label className="label">Rating</label>
                  <div className="flex items-center gap-1 h-[46px]">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button key={r} type="button" onClick={() => setForm({ ...form, rating: r })} aria-label={`${r} stars`}>
                        <Star size={22} className={r <= form.rating ? 'text-amber-400' : 'text-gray-200'} fill="currentColor" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="label">Review *</label>
                <textarea value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} rows={4} className="input-field resize-none" placeholder="Jordan made our first home purchase so easy…" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="button" onClick={save} disabled={saving || !form.client_name.trim() || !form.quote.trim()} className="btn-primary flex-1 disabled:opacity-50">{saving ? 'Saving…' : 'Add Review'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
