'use client'

import { useState } from 'react'
import { Home, Send, ChevronDown, Check, MessageSquare } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { useProfile } from '@/components/ProfileProvider'

const norm = (s: unknown) => String(s ?? '').toLowerCase().trim()

// Lets Jordan pick a few homes that match the lead's criteria and email them
// to the client with a personal note. Pulls live listings from /api/properties.
export default function SendPropertiesPanel({ lead }: { lead: any }) {
  const profile = useProfile()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [props, setProps] = useState<any[] | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showAll, setShowAll] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const firstNm = (lead.full_name || '').trim().split(' ')[0] || 'the client'
  const budgetMax = lead.budget_max ? Number(lead.budget_max) : null
  const area = lead.preferred_area ? norm(lead.preferred_area) : ''
  const whatsappDigits = String(lead.phone ?? '').replace(/\D/g, '')

  function shareWhatsApp() {
    if (selected.size === 0 || !whatsappDigits) return
    const chosen = (props ?? []).filter((p) => selected.has(p.id))
    const lines = chosen.map((p) => `• ${p.title} — ${formatCurrency(Number(p.price))}${p.city ? ` (${p.city})` : ''}`)
    const text = `Hi ${firstNm}! 🏡 Jordan here — a few homes I think you'll like:\n${lines.join('\n')}\n\n${message.trim() ? message.trim() + '\n\n' : ''}Want photos & details? Reply here or call ${profile.phone}.`
    window.open(`https://wa.me/${whatsappDigits}?text=${encodeURIComponent(text)}`, '_blank')
  }

  async function expand() {
    const next = !open
    setOpen(next)
    if (next && props === null && !loading) {
      setLoading(true)
      try {
        const res = await fetch('/api/properties')
        const json = await res.json().catch(() => ({ success: false }))
        setProps(Array.isArray(json.data) ? json.data : [])
      } catch {
        setProps([])
      } finally {
        setLoading(false)
      }
    }
  }

  const matches = (p: any) => {
    if (p.status && p.status !== 'available') return false
    if (showAll) return true
    if (budgetMax && Number(p.price) > budgetMax * 1.1) return false
    if (area && p.city && !norm(p.city).includes(area) && !area.includes(norm(p.city))) return false
    return true
  }
  const list = (props ?? []).filter(matches)

  function toggle(id: string) {
    setSelected((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  async function send() {
    if (selected.size === 0) return
    setSending(true)
    try {
      const res = await fetch('/api/leads/send-properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: lead.id, property_ids: Array.from(selected), message: message.trim() || undefined }),
      })
      const json = await res.json().catch(() => ({ success: false }))
      if (res.ok && json.success) {
        toast(json.sent ? `Sent ${json.count} home${json.count > 1 ? 's' : ''} to ${lead.email} 🏡` : 'Saved, but email not configured', { type: json.sent ? 'success' : 'warn' })
        setSelected(new Set()); setMessage(''); setOpen(false)
      } else {
        toast(json.error || 'Could not send.', { type: 'warn' })
      }
    } catch {
      toast('Could not send.', { type: 'warn' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <button type="button" onClick={expand} className="w-full flex items-center justify-between">
        <h3 className="font-semibold text-navy-900 text-sm flex items-center gap-2">
          <Home size={14} className="text-sky-400" /> Send matching homes
        </h3>
        <ChevronDown size={15} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">{loading ? 'Loading…' : `${list.length} match${list.length === 1 ? '' : 'es'}`}</span>
            <label className="flex items-center gap-1.5 text-gray-500 cursor-pointer">
              <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} className="w-3 h-3 accent-sky-500" /> Show all
            </label>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin">
            {!loading && list.length === 0 && (
              props && props.length === 0
                ? <p className="text-gray-400 text-xs text-center py-3">No listings yet — add properties in the <span className="font-semibold text-navy-700">Properties</span> tab to send homes.</p>
                : <p className="text-gray-300 text-xs text-center py-3">No properties{showAll ? '' : ' match — try “Show all”'}.</p>
            )}
            {list.map((p) => {
              const on = selected.has(p.id)
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggle(p.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl border text-left transition-all ${on ? 'border-sky-300 bg-sky-50' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <div
                    className="w-12 h-12 rounded-lg bg-gray-100 bg-cover bg-center shrink-0"
                    style={p.images?.[0] ? { backgroundImage: `url(${p.images[0]})` } : undefined}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-navy-900 text-xs font-semibold truncate">{p.title}</p>
                    <p className="text-gray-400 text-[11px]">
                      {p.city ? `${p.city} · ` : ''}{formatCurrency(Number(p.price))}{p.bedrooms ? ` · ${p.bedrooms}bd` : ''}
                    </p>
                  </div>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${on ? 'bg-sky-500 text-white' : 'border border-gray-200'}`}>
                    {on && <Check size={12} />}
                  </span>
                </button>
              )
            })}
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            placeholder={`Personal note for ${firstNm} (optional)`}
            className="input-field text-sm resize-none"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={send}
              disabled={selected.size === 0 || sending}
              className="btn-wine flex-1 text-sm justify-center disabled:opacity-50"
            >
              <Send size={14} /> {sending ? 'Sending…' : `Email ${selected.size || ''}`}
            </button>
            {whatsappDigits && (
              <button
                type="button"
                onClick={shareWhatsApp}
                disabled={selected.size === 0}
                className="flex items-center justify-center gap-1.5 px-3.5 text-sm rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold disabled:opacity-50 transition-colors"
              >
                <MessageSquare size={14} /> WhatsApp
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
