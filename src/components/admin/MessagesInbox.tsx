'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { MessageSquare, Phone, Mail, Check, UserPlus, ArrowRight, CheckCheck } from 'lucide-react'
import { formatRelativeTime, getStatusColor } from '@/lib/utils'
import PageHeader from '@/components/ui/PageHeader'
import { toast } from '@/lib/toast'

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

// Tab → predicate. 'All' matches everything; status tabs by status; the rest by type.
const TABS: { label: string; match: (m: any) => boolean }[] = [
  { label: 'All', match: () => true },
  { label: 'Unread', match: (m) => m.status === 'unread' },
  { label: 'Contact', match: (m) => m.type === 'contact' },
  { label: 'Buyer Form', match: (m) => m.type === 'buyer_qualification' },
  { label: 'Investor', match: (m) => m.type === 'investor_inquiry' },
  { label: 'Showing', match: (m) => m.type === 'showing_request' },
  { label: 'Handled', match: (m) => m.status === 'handled' },
]

export default function MessagesInbox({ initial }: { initial: any[] }) {
  const [messages, setMessages] = useState<any[]>(initial)
  const [tab, setTab] = useState('All')
  const [busy, setBusy] = useState<string | null>(null)
  const [converting, setConverting] = useState<string | null>(null)

  const unread = messages.filter((m) => m.status === 'unread').length
  const active = TABS.find((t) => t.label === tab) ?? TABS[0]
  const filtered = useMemo(() => messages.filter(active.match), [messages, active])

  async function setStatus(id: string, status: 'read' | 'unread' | 'handled') {
    setBusy(id)
    const prev = messages
    setMessages((ms) => ms.map((m) => (m.id === id ? { ...m, status } : m)))
    try {
      const res = await fetch('/api/messages', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      const d = await res.json().catch(() => ({ success: false }))
      if (!res.ok || !d.success) { setMessages(prev); toast('Could not update — try again.', { type: 'warn' }) }
    } catch {
      setMessages(prev); toast('Could not update — check your connection.', { type: 'warn' })
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
        fetch('/api/messages', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'read' }) })
      )
    )
  }

  async function convert(msg: any) {
    setConverting(msg.id)
    try {
      const res = await fetch('/api/messages/convert', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: msg.id }),
      })
      const json = await res.json().catch(() => ({ success: false }))
      if (res.ok && json.success) {
        setMessages((ms) => ms.map((m) => (m.id === msg.id ? { ...m, lead_id: json.lead_id, leads: { id: json.lead_id, full_name: m.full_name }, status: 'handled' } : m)))
        toast(json.linked ? 'Linked to existing lead 🔗' : 'Lead created from message ✅', { type: 'success' })
      } else {
        toast(json.error || 'Could not convert.', { type: 'warn' })
      }
    } catch {
      toast('Could not convert.', { type: 'warn' })
    } finally {
      setConverting(null)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Messages"
        subtitle={<>{unread > 0 ? <span className="text-wine font-semibold">{unread} unread</span> : 'All caught up'} · {messages.length} total</>}
        action={unread > 0 && (
          <button type="button" onClick={markAllRead} className="btn-secondary text-xs px-3 py-2 whitespace-nowrap">
            <Check size={14} /> Mark all read
          </button>
        )}
      />

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
        {filtered.map((msg) => {
          const leadId = msg.lead_id || msg.leads?.id
          const leadName = msg.leads?.full_name
          const isHandled = msg.status === 'handled'
          return (
            <div
              key={msg.id}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-opacity ${
                msg.status === 'unread' ? 'border-red-100' : 'border-gray-100'
              } ${isHandled ? 'opacity-70' : ''}`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    {msg.status === 'unread' && <div className="w-2 h-2 rounded-full bg-wine shrink-0 mt-0.5" />}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-navy-900 text-sm">{msg.full_name}</p>
                        <span className={`badge text-xs ${typeColors[msg.type] ?? 'bg-gray-100 text-gray-600'}`}>{typeLabels[msg.type] ?? msg.type}</span>
                        {leadId && <span className="badge text-xs bg-green-50 text-green-700">👤 Lead</span>}
                      </div>
                      <p className="text-gray-400 text-xs mt-0.5">{msg.subject}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`badge text-xs ${isHandled ? 'bg-green-50 text-green-700' : getStatusColor(msg.status)}`}>{msg.status}</span>
                    <span className="text-gray-300 text-xs">{formatRelativeTime(msg.created_at)}</span>
                  </div>
                </div>
                <div className="flex gap-4 mb-3">
                  {msg.phone && (
                    <a href={`tel:${msg.phone}`} className="flex items-center gap-1.5 text-xs text-sky-500 hover:text-sky-600"><Phone size={11} />{msg.phone}</a>
                  )}
                  <a href={`mailto:${msg.email}`} className="flex items-center gap-1.5 text-xs text-sky-500 hover:text-sky-600"><Mail size={11} />{msg.email}</a>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-600 text-xs leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                </div>

                {/* Actions: lead link/convert (left) · status (right) */}
                <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
                  <div>
                    {leadId ? (
                      <Link href={`/admin/leads/${leadId}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-wine hover:text-wine-700">
                        Open {leadName ? `${leadName}'s` : 'lead'} workspace <ArrowRight size={12} />
                      </Link>
                    ) : (
                      <button type="button" disabled={converting === msg.id} onClick={() => convert(msg)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 disabled:opacity-50">
                        <UserPlus size={13} /> {converting === msg.id ? 'Converting…' : 'Convert to lead'}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {!isHandled && (
                      <button type="button" disabled={busy === msg.id} onClick={() => setStatus(msg.id, 'handled')} className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700 disabled:opacity-50">
                        <CheckCheck size={13} /> Mark handled
                      </button>
                    )}
                    {msg.status === 'unread' ? (
                      <button type="button" disabled={busy === msg.id} onClick={() => setStatus(msg.id, 'read')} className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 disabled:opacity-50"><Check size={13} /> Mark read</button>
                    ) : msg.status === 'read' ? (
                      <button type="button" disabled={busy === msg.id} onClick={() => setStatus(msg.id, 'unread')} className="text-xs font-medium text-gray-400 hover:text-gray-600 disabled:opacity-50">Mark unread</button>
                    ) : (
                      <button type="button" disabled={busy === msg.id} onClick={() => setStatus(msg.id, 'read')} className="text-xs font-medium text-gray-400 hover:text-gray-600 disabled:opacity-50">Reopen</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
