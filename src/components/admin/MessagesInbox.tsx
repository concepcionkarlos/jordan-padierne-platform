'use client'

import { useState, useMemo } from 'react'
import { MessageSquare, Phone, Mail, Check } from 'lucide-react'
import { formatRelativeTime, getStatusColor } from '@/lib/utils'

const typeLabels: Record<string, string> = {
  contact: 'General Contact',
  buyer_qualification: 'Buyer Form',
  investor_inquiry: 'Investor',
  pre_construction_interest: 'Pre-Construction',
  showing_request: 'Showing Request',
  open_house: 'Open House',
}

const typeColors: Record<string, string> = {
  contact: 'bg-sky-50 text-sky-600',
  buyer_qualification: 'bg-blue-50 text-blue-600',
  investor_inquiry: 'bg-purple-50 text-purple-600',
  pre_construction_interest: 'bg-red-50 text-red-700',
  showing_request: 'bg-orange-50 text-orange-600',
  open_house: 'bg-green-50 text-green-600',
}

// Tab → predicate. 'All' matches everything; 'Unread' by status; the rest by type.
const TABS: { label: string; match: (m: any) => boolean }[] = [
  { label: 'All', match: () => true },
  { label: 'Unread', match: (m) => m.status === 'unread' },
  { label: 'Contact', match: (m) => m.type === 'contact' },
  { label: 'Buyer Form', match: (m) => m.type === 'buyer_qualification' },
  { label: 'Investor', match: (m) => m.type === 'investor_inquiry' },
  { label: 'Pre-Construction', match: (m) => m.type === 'pre_construction_interest' },
  { label: 'Showing', match: (m) => m.type === 'showing_request' },
]

export default function MessagesInbox({ initial }: { initial: any[] }) {
  const [messages, setMessages] = useState<any[]>(initial)
  const [tab, setTab] = useState('All')
  const [busy, setBusy] = useState<string | null>(null)

  const unread = messages.filter((m) => m.status === 'unread').length
  const active = TABS.find((t) => t.label === tab) ?? TABS[0]
  const filtered = useMemo(() => messages.filter(active.match), [messages, active])

  async function setStatus(id: string, status: 'read' | 'unread') {
    setBusy(id)
    // Optimistic update; revert on failure.
    const prev = messages
    setMessages((ms) => ms.map((m) => (m.id === id ? { ...m, status } : m)))
    try {
      const res = await fetch('/api/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      const d = await res.json().catch(() => ({ success: false }))
      if (!res.ok || !d.success) setMessages(prev)
    } catch {
      setMessages(prev)
    } finally {
      setBusy(null)
    }
  }

  async function markAllRead() {
    const unreadIds = messages.filter((m) => m.status === 'unread').map((m) => m.id)
    if (!unreadIds.length) return
    setMessages((ms) => ms.map((m) => (m.status === 'unread' ? { ...m, status: 'read' } : m)))
    await Promise.allSettled(
      unreadIds.map((id) =>
        fetch('/api/messages', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status: 'read' }),
        })
      )
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy-900">Messages</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {unread > 0
              ? <span className="text-wine font-semibold">{unread} unread</span>
              : 'All caught up'} · {messages.length} total
          </p>
        </div>
        {unread > 0 && (
          <button type="button" onClick={markAllRead} className="btn-secondary text-xs px-3 py-2 whitespace-nowrap">
            <Check size={14} /> Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map((t) => {
          const count = messages.filter(t.match).length
          return (
            <button
              key={t.label}
              type="button"
              onClick={() => setTab(t.label)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                tab === t.label ? 'bg-navy-900 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-navy-300'
              }`}
            >
              {t.label}{count > 0 && <span className="opacity-60"> · {count}</span>}
            </button>
          )
        })}
      </div>

      {/* Messages list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <MessageSquare size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">{messages.length === 0 ? 'No messages yet.' : 'No messages in this filter.'}</p>
            <p className="text-gray-300 text-xs mt-1">They appear here when website forms are submitted.</p>
          </div>
        )}
        {filtered.map((msg) => (
          <div
            key={msg.id}
            className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
              msg.status === 'unread' ? 'border-red-100' : 'border-gray-100'
            }`}
          >
            <div className="p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  {msg.status === 'unread' && (
                    <div className="w-2 h-2 rounded-full bg-wine shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-navy-900 text-sm">{msg.full_name}</p>
                      <span className={`badge text-xs ${typeColors[msg.type] ?? 'bg-gray-100 text-gray-600'}`}>
                        {typeLabels[msg.type] ?? msg.type}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5">{msg.subject}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`badge text-xs ${getStatusColor(msg.status)}`}>{msg.status}</span>
                  <span className="text-gray-300 text-xs">{formatRelativeTime(msg.created_at)}</span>
                </div>
              </div>
              <div className="flex gap-4 mb-3">
                {msg.phone && (
                  <a href={`tel:${msg.phone}`} className="flex items-center gap-1.5 text-xs text-sky-500 hover:text-sky-600">
                    <Phone size={11} />{msg.phone}
                  </a>
                )}
                <a href={`mailto:${msg.email}`} className="flex items-center gap-1.5 text-xs text-sky-500 hover:text-sky-600">
                  <Mail size={11} />{msg.email}
                </a>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-600 text-xs leading-relaxed whitespace-pre-wrap">{msg.body}</p>
              </div>
              <div className="flex justify-end mt-3">
                {msg.status === 'unread' ? (
                  <button
                    type="button"
                    disabled={busy === msg.id}
                    onClick={() => setStatus(msg.id, 'read')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 disabled:opacity-50"
                  >
                    <Check size={13} /> Mark as read
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy === msg.id}
                    onClick={() => setStatus(msg.id, 'unread')}
                    className="text-xs font-medium text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    Mark unread
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
