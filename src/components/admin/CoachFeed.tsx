'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, Phone, MessageSquare, ArrowRight, Check, CalendarClock, ChevronRight } from 'lucide-react'
import { urgencyMeta } from '@/lib/coach'
import { getPipelineStageLabel } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { AiBadge } from './AiBadge'

const JOURNEY = ['NEW', 'QUALIFIED', 'CONTACTED', 'SHOWING_SCHEDULED', 'NEGOTIATION', 'CLOSED']

interface Props {
  items: { lead: any; action: any }[]
  activePipeline: number
}

function phoneE164(phone: string | null | undefined): string {
  const d = (phone ?? '').replace(/\D/g, '')
  if (!d) return ''
  return d.length === 10 ? `1${d}` : d
}

export default function CoachFeed({ items, activePipeline }: Props) {
  // leadId → label of the completed inline action (optimistic "handled" state).
  const [done, setDone] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState<string | null>(null)

  if (items.length === 0) return null

  async function patchLead(id: string, updates: Record<string, unknown>): Promise<boolean> {
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      })
      const json = await res.json().catch(() => ({ success: false }))
      return res.ok && json.success
    } catch { return false }
  }

  async function advance(lead: any) {
    const idx = JOURNEY.indexOf(lead.pipeline_stage)
    const next = idx >= 0 && idx < JOURNEY.length - 1 ? JOURNEY[idx + 1] : null
    if (!next) return
    setBusy(lead.id)
    const ok = await patchLead(lead.id, { pipeline_stage: next })
    setBusy(null)
    if (ok) { setDone((d) => ({ ...d, [lead.id]: `Moved to ${getPipelineStageLabel(next)}` })); toast(`Moved to ${getPipelineStageLabel(next)}`, { type: 'success', emoji: '✅' }) }
    else toast('Could not update — try again.', { type: 'warn' })
  }

  async function markContacted(lead: any) {
    setBusy(lead.id)
    const now = new Date().toISOString()
    const [ok] = await Promise.all([
      patchLead(lead.id, { last_contact: now }),
      fetch('/api/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: '📞 Reached out (from Coach)', lead_id: lead.id }) }).then((r) => r.ok).catch(() => false),
    ])
    setBusy(null)
    if (ok) { setDone((d) => ({ ...d, [lead.id]: 'Logged contact' })); toast('Marked contacted 📞', { type: 'success' }) }
    else toast('Could not update — try again.', { type: 'warn' })
  }

  async function followUp(lead: any) {
    setBusy(lead.id)
    const d3 = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10)
    const ok = await patchLead(lead.id, { next_followup: d3 })
    setBusy(null)
    if (ok) { setDone((d) => ({ ...d, [lead.id]: 'Follow-up in 3 days' })); toast('Follow-up set for +3 days 📅', { type: 'success' }) }
    else toast('Could not update — try again.', { type: 'warn' })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
      <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2 bg-gradient-to-r from-sky-50 to-transparent">
        <Sparkles size={16} className="text-sky-500" />
        <h2 className="font-semibold text-navy-900 text-sm">Your Coach — Next Moves</h2>
        <AiBadge />
        <span className="text-gray-400 text-xs ml-auto hidden sm:inline">Smart-prioritized across {activePipeline} active leads</span>
      </div>
      <div className="divide-y divide-gray-50">
        {items.map(({ lead, action }) => {
          const um = urgencyMeta(action.urgency)
          const e164 = phoneE164(lead.phone)
          const idx = JOURNEY.indexOf(lead.pipeline_stage)
          const next = idx >= 0 && idx < JOURNEY.length - 1 ? JOURNEY[idx + 1] : null
          const isBusy = busy === lead.id
          const completed = done[lead.id]

          return (
            <div key={lead.id} className={`flex items-center gap-3 px-5 py-3.5 transition-colors group ${completed ? 'opacity-50' : 'hover:bg-gray-50'}`}>
              <span className="text-xl shrink-0">{completed ? '✅' : action.emoji}</span>
              <Link href={`/admin/leads/${lead.id}`} className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-navy-900 text-sm truncate">{completed ?? action.title}</p>
                  {!completed && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${um.className} shrink-0`}>{um.label}</span>}
                </div>
                <p className="text-gray-400 text-xs truncate">{lead.full_name}{completed ? '' : ` · ${action.reason}`}</p>
              </Link>

              {completed ? (
                <span className="inline-flex items-center gap-1 text-green-600 text-xs font-semibold shrink-0"><Check size={14} /> Done</span>
              ) : (
                <div className="flex items-center gap-1 shrink-0">
                  {e164 && (
                    <a href={`tel:+${e164}`} className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-sky-50 flex items-center justify-center text-sky-500" aria-label={`Call ${lead.full_name}`}><Phone size={14} /></a>
                  )}
                  {e164 && (
                    <a href={`https://wa.me/${e164}?text=${encodeURIComponent(`Hi ${(lead.full_name || '').split(' ')[0] || 'there'}! 👋 Jordan here.`)}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-green-50 flex items-center justify-center text-green-600" aria-label={`WhatsApp ${lead.full_name}`}><MessageSquare size={14} /></a>
                  )}
                  <button type="button" onClick={() => markContacted(lead)} disabled={isBusy} className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-navy-50 flex items-center justify-center text-navy-600 disabled:opacity-40" aria-label="Mark contacted"><Check size={14} /></button>
                  <button type="button" onClick={() => followUp(lead)} disabled={isBusy} className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-amber-50 flex items-center justify-center text-amber-600 disabled:opacity-40" aria-label="Follow up in 3 days"><CalendarClock size={14} /></button>
                  {next && (
                    <button type="button" onClick={() => advance(lead)} disabled={isBusy} className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-wine px-2 py-1.5 rounded-lg hover:bg-wine-50 disabled:opacity-40 whitespace-nowrap" aria-label={`Advance to ${getPipelineStageLabel(next)}`}>
                      {isBusy ? '…' : <>Advance <ChevronRight size={12} /></>}
                    </button>
                  )}
                  {!next && (
                    <Link href={`/admin/leads/${lead.id}`} className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-wine px-2 py-1.5" aria-label="Open lead">{action.actionLabel}<ArrowRight size={12} /></Link>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
