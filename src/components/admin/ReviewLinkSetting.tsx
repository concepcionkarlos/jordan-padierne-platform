'use client'

import { useEffect, useState } from 'react'
import { Star, Check } from 'lucide-react'
import { toast } from '@/lib/toast'

export default function ReviewLinkSetting() {
  const [url, setUrl] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/settings?key=google_review_url')
      .then((r) => r.json())
      .then((d) => { if (d.value) setUrl(d.value) })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'google_review_url', value: url.trim() }),
      })
      const d = await res.json()
      if (d.success) toast('Review link saved ⭐', { type: 'success' })
      else toast('Could not save. Try again.', { type: 'warn' })
    } catch {
      toast('Could not save. Try again.', { type: 'warn' })
    } finally {
      setSaving(false)
    }
  }

  const valid = url.trim().startsWith('http')

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
          <Star size={16} className="text-amber-500" />
        </div>
        <div>
          <h2 className="font-semibold text-navy-900">Google Reviews — Auto-Request</h2>
          <p className="text-gray-400 text-xs">When you move a lead to <strong>Closed</strong>, the client is automatically asked for a 5-star review.</p>
        </div>
      </div>
      <div className="p-6 space-y-3">
        <div>
          <label htmlFor="review-url" className="label">Your Google review link</label>
          <input
            id="review-url"
            type="url"
            className="input-field"
            placeholder="https://g.page/r/...  or  https://search.google.com/local/writereview?placeid=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={!loaded}
          />
          <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">
            Find it in your Google Business Profile → <em>Ask for reviews</em> → copy the short link. Until it&apos;s set, the review email is skipped automatically.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={saving || !valid || !loaded}
            className="px-4 py-2 rounded-lg bg-navy-900 text-white text-sm font-semibold hover:bg-navy-800 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save link'}
          </button>
          {valid && (
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1">
              <Check size={14} /> Preview link
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
