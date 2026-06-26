'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, X, Phone, MapPin, Check, Trash2, Calendar as CalIcon } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import PageHeader from '@/components/ui/PageHeader'

interface Appt {
  id: string
  title: string
  type: string
  starts_at: string
  location: string | null
  status: string
  lead_id: string | null
  leads?: { full_name: string; phone: string } | null
}

const TYPE_META: Record<string, { emoji: string; label: string; color: string }> = {
  showing: { emoji: '🏠', label: 'Showing', color: 'bg-sky-50 text-sky-600 border-sky-200' },
  call: { emoji: '📞', label: 'Call', color: 'bg-purple-50 text-purple-600 border-purple-200' },
  meeting: { emoji: '🤝', label: 'Meeting', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  closing: { emoji: '🔑', label: 'Closing', color: 'bg-green-50 text-green-600 border-green-200' },
  other: { emoji: '📌', label: 'Other', color: 'bg-gray-50 text-gray-600 border-gray-200' },
}

function dayLabel(d: Date): string {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const target = new Date(d); target.setHours(0, 0, 0, 0)
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

export default function CalendarView({ initial, leads }: { initial: Appt[]; leads: { id: string; full_name: string }[] }) {
  const router = useRouter()
  const [appts, setAppts] = useState<Appt[]>(initial)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'showing', starts_at: '', location: '', lead_id: '' })

  async function add() {
    if (!form.title.trim() || !form.starts_at) return
    const res = await fetch('/api/appointments', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title.trim(), type: form.type, starts_at: new Date(form.starts_at).toISOString(),
        location: form.location || null, lead_id: form.lead_id || null, status: 'scheduled',
      }),
    })
    const json = await res.json()
    if (json.success) {
      setAppts((p) => [...p, json.data].sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at)))
      setForm({ title: '', type: 'showing', starts_at: '', location: '', lead_id: '' })
      setShowForm(false)
    }
  }

  async function complete(id: string) {
    setAppts((p) => p.map((a) => (a.id === id ? { ...a, status: 'completed' } : a)))
    await fetch('/api/appointments', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'completed' }) })
  }

  async function remove(id: string) {
    setAppts((p) => p.filter((a) => a.id !== id))
    await fetch(`/api/appointments?id=${id}`, { method: 'DELETE' })
  }

  // Group upcoming by day
  const now = new Date(); now.setHours(0, 0, 0, 0)
  const upcoming = appts.filter((a) => new Date(a.starts_at) >= now || a.status === 'scheduled')
  const grouped: Record<string, Appt[]> = {}
  for (const a of upcoming) {
    const key = new Date(a.starts_at).toDateString()
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(a)
  }
  const dayKeys = Object.keys(grouped).sort((a, b) => +new Date(a) - +new Date(b))

  return (
    <div>
      <PageHeader
        title="Calendar"
        subtitle={`${upcoming.length} upcoming appointments`}
        action={
          <button type="button" onClick={() => setShowForm(!showForm)} className="btn-primary text-sm px-4 py-2.5">
            <Plus size={15} /> Schedule
          </button>
        }
      />

      {/* Quick add form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title — e.g. Showing at Brickell condo" className="input-field text-sm sm:col-span-2" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field text-sm" title="Type">
              {Object.entries(TYPE_META).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
            </select>
            <input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} className="input-field text-sm" title="When" />
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location (optional)" className="input-field text-sm" />
            <select value={form.lead_id} onChange={(e) => setForm({ ...form, lead_id: e.target.value })} className="input-field text-sm" title="Link to lead">
              <option value="">Link to lead (optional)…</option>
              {leads.map((l) => <option key={l.id} value={l.id}>{l.full_name}</option>)}
            </select>
          </div>
          <div className="flex gap-2 mt-3">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm flex-1">Cancel</button>
            <button type="button" onClick={add} disabled={!form.title.trim() || !form.starts_at} className="btn-primary text-sm flex-1 disabled:opacity-50">Schedule</button>
          </div>
        </div>
      )}

      {/* Grouped list */}
      {dayKeys.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <CalIcon size={40} className="text-gray-200 mx-auto mb-4" />
          <h3 className="font-serif text-lg font-bold text-navy-900 mb-2">No Appointments Yet</h3>
          <p className="text-gray-400 text-sm mb-6">Schedule your first showing, call, or meeting.</p>
          <button type="button" onClick={() => setShowForm(true)} className="btn-primary"><Plus size={16} /> Schedule Appointment</button>
        </div>
      )}

      <div className="space-y-6">
        {dayKeys.map((key) => {
          const date = new Date(key)
          const isToday = dayLabel(date) === 'Today'
          return (
            <div key={key}>
              <div className="flex items-center gap-2 mb-3">
                <h2 className={`font-semibold text-sm ${isToday ? 'text-wine' : 'text-navy-900'}`}>{dayLabel(date)}</h2>
                {isToday && <span className="badge bg-wine-50 text-wine text-xs">{grouped[key].length}</span>}
              </div>
              <div className="space-y-2">
                {grouped[key].map((a) => {
                  const meta = TYPE_META[a.type] ?? TYPE_META.other
                  const time = new Date(a.starts_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                  return (
                    <div key={a.id} className={`group bg-white rounded-2xl border shadow-sm p-4 flex items-center gap-4 ${a.status === 'completed' ? 'opacity-60' : ''}`}>
                      <div className="text-center shrink-0 w-14">
                        <p className="text-lg">{meta.emoji}</p>
                        <p className="text-xs font-semibold text-navy-700">{time}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-navy-900 text-sm ${a.status === 'completed' ? 'line-through' : ''}`}>{a.title}</p>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          <span className={`badge text-xs ${meta.color} border`}>{meta.label}</span>
                          {a.leads?.full_name && (
                            a.lead_id
                              ? <Link href={`/admin/leads/${a.lead_id}`} className="text-xs text-sky-600 hover:underline">{a.leads.full_name}</Link>
                              : <span className="text-xs text-gray-400">{a.leads.full_name}</span>
                          )}
                          {a.location && <span className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={10} />{a.location}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {a.leads?.phone && <a href={`tel:${a.leads.phone}`} className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-sky-50 flex items-center justify-center text-sky-500" aria-label="Call"><Phone size={14} /></a>}
                        {a.status !== 'completed' && <button type="button" onClick={() => complete(a.id)} className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-green-50 flex items-center justify-center text-green-500" aria-label="Mark done"><Check size={14} /></button>}
                        <button type="button" onClick={() => remove(a.id)} className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-wine-50 flex items-center justify-center text-gray-300 hover:text-wine opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Delete"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
