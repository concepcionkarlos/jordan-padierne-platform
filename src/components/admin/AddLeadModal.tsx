'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Plus, UserPlus } from 'lucide-react'
import { AREAS, CLIENT_TYPES, TIMELINES } from '@/lib/utils'

const SOURCES = ['Referral', 'Website', 'Social Media', 'Open House', 'Zillow', 'Realtor.com', 'Direct', 'Other']

export default function AddLeadModal() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', client_type: 'Buyer',
    source: 'Referral', preferred_area: '', budget_min: '', budget_max: '',
    timeline: '', message: '',
  })

  function update(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  // Command-palette "Add lead" deep link (/admin/leads?add=1).
  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('add') === '1') setOpen(true)
  }, [])

  async function submit() {
    if (!form.full_name.trim() || !form.phone.trim()) return
    setSaving(true)
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: form.full_name.trim(),
        email: form.email.trim() || 'no-email@placeholder.com',
        phone: form.phone.trim(),
        client_type: form.client_type,
        source: form.source,
        status: 'new',
        pipeline_stage: 'NEW',
        preferred_area: form.preferred_area || null,
        budget_min: form.budget_min ? Number(form.budget_min) : null,
        budget_max: form.budget_max ? Number(form.budget_max) : null,
        timeline: form.timeline || null,
        message: form.message || null,
      }),
    })
    const json = await res.json()
    setSaving(false)
    if (json.success) {
      setOpen(false)
      setForm({ full_name: '', email: '', phone: '', client_type: 'Buyer', source: 'Referral', preferred_area: '', budget_min: '', budget_max: '', timeline: '', message: '' })
      router.push(`/admin/leads/${json.data.id}`)
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-primary text-sm px-4 py-2.5">
        <Plus size={15} /> Add Lead
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-premium w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center"><UserPlus size={16} className="text-navy-700" /></div>
                <h2 className="font-serif text-lg font-bold text-navy-900">Add New Lead</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-navy-900" aria-label="Close"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Full Name *</label>
                  <input value={form.full_name} onChange={(e) => update('full_name', e.target.value)} className="input-field" placeholder="John Smith" />
                </div>
                <div>
                  <label className="label">Phone *</label>
                  <input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input-field" placeholder="(305) 000-0000" />
                </div>
              </div>
              <div>
                <label className="label">Email</label>
                <input value={form.email} onChange={(e) => update('email', e.target.value)} className="input-field" placeholder="john@email.com" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Client Type</label>
                  <select value={form.client_type} onChange={(e) => update('client_type', e.target.value)} className="input-field">
                    {CLIENT_TYPES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Source</label>
                  <select value={form.source} onChange={(e) => update('source', e.target.value)} className="input-field">
                    {SOURCES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Preferred Area</label>
                <select value={form.preferred_area} onChange={(e) => update('preferred_area', e.target.value)} className="input-field">
                  <option value="">Select area…</option>
                  {AREAS.map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Budget Min ($)</label>
                  <input type="number" value={form.budget_min} onChange={(e) => update('budget_min', e.target.value)} className="input-field" placeholder="300000" />
                </div>
                <div>
                  <label className="label">Budget Max ($)</label>
                  <input type="number" value={form.budget_max} onChange={(e) => update('budget_max', e.target.value)} className="input-field" placeholder="800000" />
                </div>
              </div>
              <div>
                <label className="label">Timeline</label>
                <select value={form.timeline} onChange={(e) => update('timeline', e.target.value)} className="input-field">
                  <option value="">Select…</option>
                  {TIMELINES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea value={form.message} onChange={(e) => update('message', e.target.value)} rows={2} className="input-field resize-none" placeholder="How you met, what they need…" />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100 flex gap-3 rounded-b-3xl">
              <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="button" onClick={submit} disabled={saving || !form.full_name.trim() || !form.phone.trim()} className="btn-primary flex-1 disabled:opacity-50">
                {saving ? 'Saving…' : 'Add Lead'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
