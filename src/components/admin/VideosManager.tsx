'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, Trash2, Youtube, X } from 'lucide-react'
import { youTubeThumb } from '@/lib/youtube'

export default function VideosManager({ initial }: { initial: any[] }) {
  const [items, setItems] = useState<any[]>(initial)
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)

  async function add() {
    if (!url.trim()) return
    setSaving(true)
    const res = await fetch('/api/videos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url.trim(), title: title.trim() || null }),
    })
    const json = await res.json()
    setSaving(false)
    if (json.success) {
      setItems((p) => [json.data, ...p])
      setUrl(''); setTitle(''); setOpen(false)
    } else {
      alert(json.error?.includes('videos') ? 'Run migration_005 in Supabase first.' : (json.error || 'Invalid YouTube URL'))
    }
  }

  async function remove(id: string) {
    if (!confirm('Remove this video?')) return
    setItems((p) => p.filter((x) => x.id !== id))
    await fetch(`/api/videos?id=${id}`, { method: 'DELETE' })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy-900">Videos</h1>
          <p className="text-gray-500 text-sm mt-0.5">{items.length} videos · shown live on your home page</p>
        </div>
        <button type="button" onClick={() => setOpen(true)} className="btn-primary text-sm px-4 py-2.5"><Plus size={15} /> Add Video</button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Youtube size={40} className="text-gray-200 mx-auto mb-4" />
          <h3 className="font-serif text-lg font-bold text-navy-900 mb-2">No Videos Yet</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">Paste a YouTube link from your channel and it appears instantly on your website.</p>
          <button type="button" onClick={() => setOpen(true)} className="btn-primary"><Plus size={16} /> Add First Video</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((v) => (
            <div key={v.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group relative">
              <div className="relative aspect-video bg-navy-900">
                <Image src={youTubeThumb(v.youtube_id)} alt={v.title || 'video'} fill className="object-cover" />
                <button type="button" onClick={() => remove(v.id)} className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center text-wine opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove"><Trash2 size={13} /></button>
              </div>
              {v.title && <div className="p-3"><p className="text-navy-900 text-sm font-medium truncate">{v.title}</p></div>}
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-premium w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-navy-900">Add YouTube Video</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-navy-900" aria-label="Close"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">YouTube URL *</label>
                <input value={url} onChange={(e) => setUrl(e.target.value)} className="input-field" placeholder="https://www.youtube.com/watch?v=..." />
                <p className="text-gray-400 text-xs mt-1">Paste any YouTube link — watch, share, shorts, or live.</p>
              </div>
              <div>
                <label className="label">Title (optional)</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="e.g. Brickell condo tour" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="button" onClick={add} disabled={saving || !url.trim()} className="btn-primary flex-1 disabled:opacity-50">{saving ? 'Adding…' : 'Add Video'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
