'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Plus, X, Building2, Trash2, Upload, Star, Edit2, Sparkles, Wand2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { AREAS } from '@/lib/utils'
import { useModalA11y } from '@/lib/useModalA11y'

interface Property {
  id?: string
  title: string
  description: string
  price: number | string
  listing_type: string
  bedrooms: number | string
  bathrooms: number | string
  sqft: number | string
  address: string
  city: string
  state: string
  status: string
  type: string
  is_pre_construction: boolean
  is_luxury: boolean
  featured: boolean
  images: string[]
}

const EMPTY: Property = {
  title: '', description: '', price: '', listing_type: 'sale', bedrooms: '', bathrooms: '', sqft: '',
  address: '', city: 'Brickell', state: 'FL', status: 'available', type: 'condo',
  is_pre_construction: false, is_luxury: false, featured: false, images: [],
}

const LISTING_TYPES = [
  { id: 'sale', label: '🏷️ For Sale', short: 'For Sale', color: 'bg-green-50 text-green-700 border-green-200' },
  { id: 'rent', label: '🔑 For Rent', short: 'For Rent', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  { id: 'investment', label: '📈 Investment', short: 'Investment', color: 'bg-purple-50 text-purple-700 border-purple-200' },
]

const statusColors: Record<string, string> = {
  available: 'bg-green-50 text-green-600',
  pending: 'bg-orange-50 text-orange-600',
  sold: 'bg-gray-100 text-gray-500',
  'off-market': 'bg-navy-50 text-navy-500',
}

const MAX_UPLOAD_MB = 8 // matches the server cap in /api/upload

export default function PropertyManager({ initial }: { initial: any[] }) {
  const router = useRouter()
  const [properties, setProperties] = useState<any[]>(initial)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Property>(EMPTY)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  // AI Quick-Add: paste any listing text → Gemini/Claude fills the form.
  const [aiOpen, setAiOpen] = useState(false)
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  // Accessible-dialog behavior (ESC, focus-trap, scroll-lock, focus restore).
  const editModalRef = useRef<HTMLDivElement>(null)
  const aiModalRef = useRef<HTMLDivElement>(null)
  useModalA11y(open, () => setOpen(false), editModalRef)
  useModalA11y(aiOpen, () => { if (!aiLoading) setAiOpen(false) }, aiModalRef)

  function openNew() { setForm(EMPTY); setEditId(null); setOpen(true) }

  async function runAi() {
    if (aiText.trim().length < 8) return
    setAiLoading(true); setAiError('')
    try {
      const res = await fetch('/api/properties/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: aiText }),
      })
      const json = await res.json()
      if (json.success && json.parsed) {
        // Pre-fill the editor; Jordan reviews, adds photos, and saves.
        setForm({ ...EMPTY, ...json.parsed, images: [] })
        setEditId(null)
        setAiOpen(false)
        setAiText('')
        setOpen(true)
      } else {
        setAiError(json.error || 'Could not read that. Try the manual form.')
      }
    } catch {
      setAiError('Something went wrong. Try again or use the manual form.')
    } finally {
      setAiLoading(false)
    }
  }
  function openEdit(p: any) {
    setForm({ ...EMPTY, ...p, images: p.images ?? [] })
    setEditId(p.id)
    setOpen(true)
  }

  async function uploadFiles(files: FileList) {
    setUploading(true)
    setUploadError('')
    const urls: string[] = []
    const failed: string[] = []
    for (const file of Array.from(files)) {
      if (file.size > MAX_UPLOAD_MB * 1024 * 1024) { failed.push(`${file.name} (over ${MAX_UPLOAD_MB}MB)`); continue }
      try {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const json = await res.json().catch(() => ({ success: false }))
        if (res.ok && json.success && json.url) urls.push(json.url)
        else failed.push(file.name)
      } catch {
        failed.push(file.name)
      }
    }
    if (urls.length) setForm((f) => ({ ...f, images: [...f.images, ...urls] }))
    if (failed.length) setUploadError(`Couldn't upload ${failed.length} photo${failed.length > 1 ? 's' : ''}: ${failed.join(', ')}. Use a JPG/PNG under ${MAX_UPLOAD_MB}MB.`)
    setUploading(false)
  }

  async function save() {
    if (!form.title.trim() || !form.price) return
    setSaving(true)
    const payload = {
      ...form,
      price: Number(form.price),
      bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
      sqft: form.sqft ? Number(form.sqft) : null,
    }
    const res = await fetch('/api/properties', {
      method: editId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editId ? { id: editId, ...payload } : payload),
    })
    const json = await res.json()
    setSaving(false)
    if (json.success) {
      if (editId) setProperties((p) => p.map((x) => (x.id === editId ? json.data : x)))
      else setProperties((p) => [json.data, ...p])
      setOpen(false)
      router.refresh()
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this property?')) return
    setProperties((p) => p.filter((x) => x.id !== id))
    await fetch(`/api/properties?id=${id}`, { method: 'DELETE' })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy-900">Properties</h1>
          <p className="text-gray-500 text-sm mt-0.5">{properties.length} listings · shown live on your public site</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => { setAiError(''); setAiText(''); setAiOpen(true) }} className="inline-flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-wine to-wine-700 text-white shadow-sm hover:opacity-95 transition-opacity">
            <Sparkles size={15} /> Quick-add with AI
          </button>
          <button type="button" onClick={openNew} className="btn-primary text-sm px-4 py-2.5"><Plus size={15} /> Add Property</button>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Building2 size={40} className="text-gray-200 mx-auto mb-4" />
          <h3 className="font-serif text-lg font-bold text-navy-900 mb-2">No Properties Yet</h3>
          <p className="text-gray-400 text-sm mb-6">Add your first listing — it appears instantly on your public Properties page.</p>
          <div className="flex items-center justify-center gap-2">
            <button type="button" onClick={() => { setAiError(''); setAiText(''); setAiOpen(true) }} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-wine to-wine-700 text-white shadow-sm hover:opacity-95 transition-opacity"><Sparkles size={16} /> Quick-add with AI</button>
            <button type="button" onClick={openNew} className="btn-primary"><Plus size={16} /> Add Manually</button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {properties.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
              <div className="relative h-44 bg-gray-100">
                {p.images?.[0]
                  ? <Image src={p.images[0]} alt={p.title} fill className="object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Building2 size={32} className="text-gray-200" /></div>}
                <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                  <span className="badge bg-white/90 text-navy-700 text-xs font-bold">{LISTING_TYPES.find((l) => l.id === (p.listing_type ?? 'sale'))?.short ?? 'For Sale'}</span>
                  {p.featured && <span className="badge bg-yellow-400 text-white text-xs flex items-center gap-0.5"><Star size={9} fill="currentColor" /> Featured</span>}
                  {p.is_pre_construction && <span className="badge bg-wine text-white text-xs">Pre-Con</span>}
                </div>
                <div className="absolute top-3 right-3 flex gap-1">
                  <button type="button" onClick={() => openEdit(p)} className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center text-navy-600 hover:bg-white" aria-label="Edit"><Edit2 size={13} /></button>
                  <button type="button" onClick={() => remove(p.id)} className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center text-wine hover:bg-white" aria-label="Delete"><Trash2 size={13} /></button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-navy-900">{formatCurrency(Number(p.price))}{p.listing_type === 'rent' && <span className="text-gray-400 text-xs font-normal">/mo</span>}</p>
                  <span className={`badge text-xs ${statusColors[p.status] ?? 'bg-gray-100 text-gray-500'}`}>{p.status}</span>
                </div>
                <p className="font-serif text-sm font-bold text-navy-900 truncate">{p.title}</p>
                <p className="text-gray-400 text-xs">{p.city}, {p.state}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                  {p.bedrooms && <span>{p.bedrooms} bd</span>}
                  {p.bathrooms && <span>{p.bathrooms} ba</span>}
                  {p.sqft && <span>{Number(p.sqft).toLocaleString()} sqft</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div ref={editModalRef} role="dialog" aria-modal="true" aria-label={editId ? 'Edit property' : 'Add property'} tabIndex={-1} className="relative bg-white rounded-3xl shadow-premium w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-3xl z-10">
              <h2 className="font-serif text-lg font-bold text-navy-900">{editId ? 'Edit Property' : 'Add Property'}</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-navy-900" aria-label="Close"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Photos */}
              <div>
                <label className="label">Photos</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.images.map((url, i) => (
                    <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                      <Image src={url} alt="" fill className="object-cover" />
                      <button type="button" onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, j) => j !== i) }))} className="absolute top-0.5 right-0.5 w-5 h-5 rounded bg-wine text-white flex items-center justify-center" aria-label="Remove"><X size={11} /></button>
                    </div>
                  ))}
                  <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-sky-300 text-gray-400">
                    <Upload size={16} />
                    <span className="text-[10px] mt-1">{uploading ? 'Uploading…' : 'Add'}</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && uploadFiles(e.target.files)} />
                  </label>
                </div>
                {uploadError && <p className="text-wine text-xs mb-1">{uploadError}</p>}
                <p className="text-gray-400 text-[11px]">JPG or PNG, up to {MAX_UPLOAD_MB}MB each.</p>
              </div>

              {/* Listing purpose */}
              <div>
                <label className="label">Listing Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {LISTING_TYPES.map((lt) => (
                    <button
                      key={lt.id}
                      type="button"
                      onClick={() => setForm({ ...form, listing_type: lt.id })}
                      className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                        form.listing_type === lt.id ? lt.color : 'bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      {lt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Title *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="Luxury Waterfront Condo" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">{form.listing_type === 'rent' ? 'Monthly Rent ($) *' : 'Price ($) *'}</label>
                  <input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" placeholder={form.listing_type === 'rent' ? '3500' : '850000'} title="Price" />
                </div>
                <div>
                  <label className="label">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field" title="Property type">
                    {['condo', 'house', 'townhouse', 'pre-construction', 'land'].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="label">Beds</label><input type="number" min="0" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} className="input-field" title="Bedrooms" placeholder="3" /></div>
                <div><label className="label">Baths</label><input type="number" min="0" step="0.5" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} className="input-field" title="Bathrooms" placeholder="2" /></div>
                <div><label className="label">Sq Ft</label><input type="number" min="0" value={form.sqft} onChange={(e) => setForm({ ...form, sqft: e.target.value })} className="input-field" title="Square feet" placeholder="1200" /></div>
              </div>
              <div>
                <label className="label">Address</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field" placeholder="123 Brickell Ave" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">City / Area</label>
                  <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field" title="City / Area">
                    {AREAS.map((a) => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field" title="Status">
                    {['available', 'pending', 'sold', 'off-market'].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="input-field resize-none" placeholder="Highlights, features, views…" />
              </div>
              <div className="flex flex-wrap gap-4">
                {([['featured', 'Featured'], ['is_pre_construction', 'Pre-Construction'], ['is_luxury', 'Luxury']] as const).map(([k, label]) => (
                  <label key={k} className="flex items-center gap-2 text-sm text-navy-700 cursor-pointer">
                    <input type="checkbox" checked={form[k] as boolean} onChange={(e) => setForm({ ...form, [k]: e.target.checked })} className="w-4 h-4 accent-sky-500" />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100 flex gap-3 rounded-b-3xl">
              <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="button" onClick={save} disabled={saving || !form.title.trim() || !form.price} className="btn-primary flex-1 disabled:opacity-50">
                {saving ? 'Saving…' : editId ? 'Save Changes' : 'Add Property'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Quick-Add modal */}
      {aiOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm" onClick={() => !aiLoading && setAiOpen(false)} />
          <div ref={aiModalRef} role="dialog" aria-modal="true" aria-label="Quick-add a property with AI" tabIndex={-1} className="relative bg-white rounded-3xl shadow-premium w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-wine-50 to-transparent">
              <h2 className="font-serif text-lg font-bold text-navy-900 flex items-center gap-2"><Sparkles size={18} className="text-wine" /> Quick-add with AI</h2>
              <button type="button" onClick={() => !aiLoading && setAiOpen(false)} className="text-gray-400 hover:text-navy-900" aria-label="Close"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-3">
              <p className="text-sm text-gray-500 leading-relaxed">
                Paste anything about the property — an MLS sheet, an email, a flyer, even a quick WhatsApp note (English or Español). The AI fills in the form for you. You review and save.
              </p>
              <textarea
                value={aiText}
                onChange={(e) => setAiText(e.target.value)}
                rows={8}
                className="input-field resize-none text-sm"
                placeholder={"e.g.\nLuxury 2/2 condo in Brickell, 1,150 sqft, asking $749,000. Floor-to-ceiling windows, bay views, pool & gym. New construction.\n\n— or paste a whole MLS listing —"}
                autoFocus
              />
              {aiError && <p className="text-wine text-xs font-medium">{aiError}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setAiOpen(false)} disabled={aiLoading} className="btn-secondary flex-1">Cancel</button>
                <button type="button" onClick={runAi} disabled={aiLoading || aiText.trim().length < 8} className="btn-primary flex-1 disabled:opacity-50">
                  {aiLoading ? 'Reading…' : <><Wand2 size={15} /> Fill the form</>}
                </button>
              </div>
              <p className="text-[11px] text-gray-400 text-center pt-1">The AI only suggests — nothing is saved until you review and hit “Add Property”.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
