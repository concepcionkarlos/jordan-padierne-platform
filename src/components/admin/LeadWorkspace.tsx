'use client'

import { useState } from 'react'
import {
  Phone, Mail, MapPin, Calendar, DollarSign, MessageSquare,
  Send, Plus, Check, Clock, Trash2, StickyNote, ChevronDown, TrendingUp, CalendarPlus, Target,
} from 'lucide-react'
import {
  formatDate, formatPhone, formatRelativeTime, formatCurrency,
  getPipelineStageLabel, getPipelineStageColor,
} from '@/lib/utils'
import { LEAD_TAGS, getTagDef, HOT_SCORES, getHotScore, getLeadFreshness, scoreLead, scoreColor } from '@/lib/leads'
import { commissionFor, statusFieldsForStage } from '@/lib/goals'
import { getNextAction, urgencyMeta } from '@/lib/coach'
import { TEMPLATES, fillTemplate } from '@/lib/templates'
import { toast } from '@/lib/toast'
import { fireConfetti } from '@/lib/confetti'
import TemplatesPanel from './TemplatesPanel'
import ProgressRing from './ProgressRing'
import Tooltip from './Tooltip'
import SendPropertiesPanel from './SendPropertiesPanel'
import { Sparkles, ArrowRight } from 'lucide-react'

const STAGES = ['NEW', 'QUALIFIED', 'CONTACTED', 'SHOWING_SCHEDULED', 'NEGOTIATION', 'CLOSED', 'LOST']

interface Note { id: string; content: string; author: string; created_at: string }
interface Task { id: string; title: string; status: string; priority: string; due_date: string | null }
interface Msg { id: string; subject: string; body: string; created_at: string }
interface Appt { id: string; title: string; type: string; starts_at: string; location: string | null; status: string }

interface Props {
  lead: any
  initialNotes: Note[]
  initialTasks: Task[]
  initialAppointments: Appt[]
  messages: Msg[]
}

export default function LeadWorkspace({ lead: initialLead, initialNotes, initialTasks, initialAppointments, messages }: Props) {
  const [lead, setLead] = useState(initialLead)
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [appts, setAppts] = useState<Appt[]>(initialAppointments)
  const [noteText, setNoteText] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [showTagPicker, setShowTagPicker] = useState(false)
  const [showStagePicker, setShowStagePicker] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDue, setTaskDue] = useState('')
  const [showTaskForm, setShowTaskForm] = useState(false)
  // Appointment form
  const [showApptForm, setShowApptForm] = useState(false)
  const [apptTitle, setApptTitle] = useState('')
  const [apptMode, setApptMode] = useState<'in_person' | 'video'>('in_person')
  const [apptDuration, setApptDuration] = useState(30)
  const [apptInvite, setApptInvite] = useState(true)
  const [scheduling, setScheduling] = useState(false)
  const [apptWhen, setApptWhen] = useState('')
  const [apptLocation, setApptLocation] = useState('')
  // Buyer form
  const [sendingForm, setSendingForm] = useState(false)
  const [formSentAt, setFormSentAt] = useState<string | null>(initialLead.metadata?.form_sent_at ?? null)

  const freshness = getLeadFreshness(lead)
  const hotScore = getHotScore(lead.hot_score)
  const tags: string[] = lead.tags ?? []
  const dealValue = lead.deal_value ?? lead.budget_max ?? 0
  const commRate = lead.commission_rate ?? 3
  const commission = dealValue ? commissionFor(dealValue, commRate) : 0
  const smart = scoreLead({ ...lead, noteCount: notes.length, apptCount: appts.length })
  const aiNote = notes.find((n) => n.author === 'AI Evaluation')

  // ─── "What they want" — the qualify-form answers, surfaced as a work hub ───
  const meta = (lead.metadata ?? {}) as Record<string, any>
  const firstNm = (lead.full_name || '').trim().split(' ')[0] || 'This lead'
  const budgetTxt = lead.budget_max
    ? `${lead.budget_min ? formatCurrency(lead.budget_min) + ' – ' : 'Up to '}${formatCurrency(lead.budget_max)}`
    : lead.budget_min ? `${formatCurrency(lead.budget_min)}+` : null
  const wants = [
    { label: 'Looking to', value: meta.intent ?? lead.client_type },
    { label: 'Budget', value: budgetTxt },
    { label: 'Area', value: lead.preferred_area ?? meta.preferred_area },
    { label: 'Property type', value: meta.property_type },
    { label: 'Bedrooms', value: meta.bedrooms },
    { label: 'Timeline', value: lead.timeline ?? meta.timeline },
    { label: 'Financing', value: lead.financing_status ?? meta.financing_status },
    { label: 'Must-haves', value: meta.must_haves },
    { label: 'Selling because', value: meta.why_selling },
    { label: 'Their property', value: meta.property_address },
    { label: 'Condition', value: meta.condition },
    { label: 'Hopes to get', value: meta.expected_price ? formatCurrency(Number(meta.expected_price)) : null },
    { label: 'Best time to reach', value: meta.best_time },
    { label: 'Prefers contact by', value: meta.contact_method },
  ].filter((w) => w.value !== null && w.value !== undefined && w.value !== '')
  const motivation = meta.motivation

  // ─── Journey / pipeline progression ───
  const JOURNEY = ['NEW', 'QUALIFIED', 'CONTACTED', 'SHOWING_SCHEDULED', 'NEGOTIATION', 'CLOSED']
  const journeyIdx = JOURNEY.indexOf(lead.pipeline_stage)
  const isLost = lead.pipeline_stage === 'LOST'
  const nextStage = journeyIdx >= 0 && journeyIdx < JOURNEY.length - 1 ? JOURNEY[journeyIdx + 1] : null
  // Normalize the phone once so every tel:/WhatsApp link is well-formed.
  // US 10-digit numbers get a +1 country code so wa.me always resolves.
  const phoneDigits = (lead.phone ?? '').replace(/\D/g, '')
  const phoneE164 = phoneDigits ? (phoneDigits.length === 10 ? `1${phoneDigits}` : phoneDigits) : ''
  const telHref = phoneE164 ? `tel:+${phoneE164}` : undefined
  const waBase = phoneE164 ? `https://wa.me/${phoneE164}` : ''
  const whatsappDigits = phoneE164
  // Local "now" for the appointment picker's min (prevents past-dated showings).
  const minDateTime = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)

  // ─── Coach: next best action ───
  const now = new Date()
  const upcoming = appts.find((a) => new Date(a.starts_at) >= now && a.status === 'scheduled')
  const pastAppt = appts.find((a) => new Date(a.starts_at) < now)
  const lastNoteAt = notes[0]?.created_at
  const hasPastApptNoFollowup = !!pastAppt && (!lastNoteAt || new Date(lastNoteAt) < new Date(pastAppt.starts_at))
  const nextAction = getNextAction(lead, {
    noteCount: notes.length,
    hasUpcomingAppt: !!upcoming,
    nextApptAt: upcoming?.starts_at ?? null,
    hasPastApptNoFollowup,
  })
  const uMeta = urgencyMeta(nextAction.urgency)

  // Resolve the coach button into a concrete one-click action
  function runCoachAction() {
    const a = nextAction
    if (a.actionType === 'call') { if (telHref) window.location.href = telHref; return }
    if (a.actionType === 'schedule') { setShowApptForm(true); document.getElementById('appt-anchor')?.scrollIntoView({ behavior: 'smooth' }); return }
    if (a.actionType === 'advance' && a.stage) {
      setStage(a.stage)
      return
    }
    if ((a.actionType === 'template' || a.actionType === 'whatsapp') && a.templateId) {
      const tpl = TEMPLATES.find((t) => t.id === a.templateId)
      if (tpl && waBase) {
        const text = fillTemplate(tpl.en, lead.full_name)
        window.open(`${waBase}?text=${encodeURIComponent(text)}`, '_blank')
      }
      return
    }
  }

  // ─── Lead patch helper ───
  // Optimistic, but verifies the write: on any failure it reverts the UI and
  // tells Jordan, so a dropped save can never silently look successful.
  // Returns true only when the change actually persisted.
  async function patchLead(updates: Record<string, unknown>): Promise<boolean> {
    const prevLead = lead
    setLead((prev: any) => ({ ...prev, ...updates }))
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lead.id, ...updates }),
      })
      const json = await res.json().catch(() => ({ success: false }))
      if (!res.ok || !json.success) {
        setLead(prevLead)
        toast(json.error || 'Could not save — please try again.', { type: 'warn' })
        return false
      }
      // Optimistic state already reflects the change; the page re-fetches fresh
      // on next navigation (force-dynamic). No full router.refresh() per edit.
      return true
    } catch {
      setLead(prevLead)
      toast('Could not save — check your connection.', { type: 'warn' })
      return false
    }
  }

  // ─── Stage change with celebration ───
  async function setStage(stage: string) {
    // Use the same canonical mapping the server applies, so the optimistic UI
    // matches the persisted record exactly (incl. NEW→'new' and clearing
    // closed_at when a deal is reopened).
    const extra: Record<string, unknown> = { pipeline_stage: stage, ...statusFieldsForStage(stage) }
    // Only celebrate once the write is confirmed — never on a failed/false close.
    const ok = await patchLead(extra)
    if (!ok) return
    if (stage === 'CLOSED') {
      fireConfetti()
      const comm = commission ? ` · ${formatCurrency(commission)} commission 💰` : ''
      toast(`Deal closed! 🎉${comm}`, { type: 'celebrate', duration: 4000 })
    } else if (stage === 'LOST') {
      toast('Moved to Lost', { type: 'warn', emoji: '📦' })
    } else {
      toast(`Moved to ${getPipelineStageLabel(stage)}`, { type: 'success', emoji: '✅' })
    }
  }

  // ─── Notes ───
  async function addNote() {
    if (!noteText.trim()) return
    setSavingNote(true)
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: noteText.trim(), lead_id: lead.id }),
      })
      const json = await res.json().catch(() => ({ success: false }))
      if (res.ok && json.success) {
        setNotes((prev) => [json.data, ...prev])
        setNoteText('')
        setLead((prev: any) => ({ ...prev, last_contact: new Date().toISOString() }))
        toast('Activity logged — streak kept alive! 🔥', { type: 'success' })
      } else {
        toast(json.error || 'Could not save the note — please try again.', { type: 'warn' })
      }
    } catch {
      toast('Could not save the note — check your connection.', { type: 'warn' })
    } finally {
      setSavingNote(false)
    }
  }

  async function deleteNote(id: string) {
    const prev = notes
    setNotes((p) => p.filter((n) => n.id !== id))
    try {
      const res = await fetch(`/api/notes?id=${id}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({ success: false }))
      if (!res.ok || !json.success) { setNotes(prev); toast('Could not delete the note.', { type: 'warn' }) }
    } catch {
      setNotes(prev); toast('Could not delete the note.', { type: 'warn' })
    }
  }

  // ─── Send the buyer qualification form to this lead ───
  async function sendBuyerForm() {
    if (!lead.email || /placeholder|no-email/i.test(lead.email)) {
      toast('This lead has no real email on file.', { type: 'warn' })
      return
    }
    setSendingForm(true)
    try {
      const res = await fetch('/api/leads/send-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: lead.id }),
      })
      const json = await res.json().catch(() => ({ success: false }))
      if (res.ok && json.success) {
        setFormSentAt(json.sent_at)
        if (json.note) setNotes((prev) => [json.note, ...prev])
        toast(`Buyer form sent to ${lead.email} 📨`, { type: 'success' })
      } else {
        toast(json.error || 'Could not send the form.', { type: 'warn' })
      }
    } catch {
      toast('Could not send the form.', { type: 'warn' })
    } finally {
      setSendingForm(false)
    }
  }

  // ─── Tags ───
  async function toggleTag(tagId: string) {
    const adding = !tags.includes(tagId)
    const next = adding ? [...tags, tagId] : tags.filter((t) => t !== tagId)
    const def = getTagDef(tagId)
    const ok = await patchLead({ tags: next })
    if (ok) toast(adding ? `Tagged ${def.emoji} ${def.label}` : `Removed ${def.label}`, { type: 'success', emoji: adding ? def.emoji : '➖' })
  }

  // ─── Tasks ───
  async function addTask() {
    if (!taskTitle.trim()) return
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle.trim(),
          lead_id: lead.id,
          status: 'todo',
          priority: 'medium',
          due_date: taskDue || null,
        }),
      })
      const json = await res.json().catch(() => ({ success: false }))
      if (res.ok && json.success) {
        setTasks((prev) => [...prev, json.data])
        setTaskTitle('')
        setTaskDue('')
        setShowTaskForm(false)
        toast('Task added', { type: 'success', emoji: '📋' })
      } else {
        toast(json.error || 'Could not add the task — please try again.', { type: 'warn' })
      }
    } catch {
      toast('Could not add the task — check your connection.', { type: 'warn' })
    }
  }

  async function toggleTask(task: Task) {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    const prev = tasks
    setTasks((p) => p.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)))
    if (newStatus === 'done') toast('Task complete! ✓', { type: 'success' })
    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, status: newStatus, completed_at: newStatus === 'done' ? new Date().toISOString() : null }),
      })
      const json = await res.json().catch(() => ({ success: false }))
      if (!res.ok || !json.success) { setTasks(prev); toast('Could not update the task.', { type: 'warn' }) }
    } catch {
      setTasks(prev); toast('Could not update the task.', { type: 'warn' })
    }
  }

  // ─── Appointments — schedule + email the client a calendar invite ───
  async function scheduleAndInvite() {
    if (!apptTitle.trim() || !apptWhen) return
    if (new Date(apptWhen).getTime() < Date.now()) {
      toast('Pick a future date and time for the appointment.', { type: 'warn' })
      return
    }
    setScheduling(true)
    try {
      const res = await fetch('/api/leads/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: lead.id,
          title: apptTitle.trim(),
          starts_at: new Date(apptWhen).toISOString(),
          duration_minutes: apptDuration,
          mode: apptMode,
          location: apptMode === 'in_person' ? apptLocation : undefined,
          send_invite: apptInvite,
        }),
      })
      const json = await res.json().catch(() => ({ success: false }))
      if (res.ok && json.success) {
        if (json.appointment) {
          setAppts((prev) => [...prev, json.appointment].sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at)))
        }
        setApptTitle(''); setApptWhen(''); setApptLocation(''); setShowApptForm(false)
        const extra = apptMode === 'video' && json.videoUrl ? ' · video link included' : ''
        toast(json.invite_sent ? `Invite sent to ${lead.email} 📅${extra}` : 'Appointment scheduled 📅', { type: 'success' })
      } else {
        toast(json.error || 'Could not schedule.', { type: 'warn' })
      }
    } catch {
      toast('Could not schedule.', { type: 'warn' })
    } finally {
      setScheduling(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ─── Lead journey ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-navy-900 text-sm">Lead journey</h3>
          {nextStage && <span className="text-xs text-wine font-semibold">Next: {getPipelineStageLabel(nextStage)}</span>}
        </div>
        <div className="flex items-start overflow-x-auto pb-1">
          {JOURNEY.map((st, i) => {
            const done = journeyIdx > i
            const current = journeyIdx === i
            return (
              <div key={st} className="flex items-center shrink-0">
                <button type="button" onClick={() => setStage(st)} title={`Move to ${getPipelineStageLabel(st)}`} className="flex flex-col items-center gap-1.5 group">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${done ? 'bg-green-500 text-white' : current ? 'bg-wine text-white ring-4 ring-wine/15' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
                    {done ? <Check size={13} /> : i + 1}
                  </span>
                  <span className={`text-[10px] font-semibold whitespace-nowrap ${current ? 'text-wine' : done ? 'text-navy-700' : 'text-gray-400'}`}>{getPipelineStageLabel(st)}</span>
                </button>
                {i < JOURNEY.length - 1 && <div className={`w-7 sm:w-10 h-0.5 mx-1 mb-5 ${journeyIdx > i ? 'bg-green-400' : 'bg-gray-100'}`} />}
              </div>
            )
          })}
        </div>
        {isLost && <p className="text-xs text-gray-400 mt-2">Marked as Lost — click a stage to revive this lead.</p>}
      </div>

      {/* ─── Coach: Next Best Action ─── */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-700 rounded-2xl p-5 lg:p-6 shadow-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 text-2xl">
            {nextAction.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center gap-1 text-xs font-bold text-sky-300 uppercase tracking-wide">
                <Sparkles size={12} /> Your Next Move
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${uMeta.className}`}>{uMeta.label}</span>
            </div>
            <p className="text-white font-serif text-lg font-bold leading-tight">{nextAction.title}</p>
            <p className="text-navy-200 text-sm mt-0.5">{nextAction.reason}</p>
          </div>
          <button type="button" onClick={runCoachAction} className="btn-wine cta-shine shrink-0 whitespace-nowrap">
            {nextAction.actionLabel} <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* ─── AI Evaluation summary (when the client completed their profile) ─── */}
      {aiNote && (
        <div className="bg-gradient-to-br from-sky-50 to-white rounded-2xl border-2 border-sky-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
              <Sparkles size={15} className="text-sky-600" />
            </div>
            <h3 className="font-semibold text-navy-900 text-sm">AI Evaluation</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ml-auto ${hotScore.className}`}>{hotScore.emoji} {hotScore.label}</span>
          </div>
          <p className="text-navy-700 text-sm leading-relaxed whitespace-pre-wrap">{aiNote.content}</p>
          <p className="text-gray-400 text-xs mt-3">Auto-evaluated · {formatRelativeTime(aiNote.created_at)}</p>
        </div>
      )}

      {/* ─── What the client is looking for (their form answers) ─── */}
      {wants.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-wine-50 flex items-center justify-center">
              <Target size={15} className="text-wine" />
            </div>
            <h3 className="font-serif text-lg font-bold text-navy-900">What {firstNm} is looking for</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-4">
            {wants.map((w) => (
              <div key={w.label}>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{w.label}</p>
                <p className="text-navy-900 text-sm font-semibold mt-0.5 break-words">{String(w.value)}</p>
              </div>
            ))}
          </div>
          {motivation && (
            <div className="mt-4 pt-4 border-t border-gray-50">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">In their words</p>
              <p className="text-navy-700 text-sm italic">“{String(motivation)}”</p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ─── Left column: contact + actions ─── */}
      <div className="lg:col-span-1 space-y-4">
        {/* Smart Score */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
              ⚡ Smart Score
              <Tooltip text="Auto-calculated 0–100 from budget, pipeline stage, how engaged they are (calls/notes/showings), financing readiness, and timeline. Higher = more ready to buy." />
            </p>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${smart.className}`}>{smart.emoji} {smart.label}</span>
          </div>
          <div className="flex items-center gap-4">
            <ProgressRing value={smart.score} max={100} size={68} stroke={7} color={scoreColor(smart.score)} trackColor="#F1F5F9">
              <div className="text-center">
                <p className="font-serif text-xl font-bold text-navy-900 leading-none">{smart.score}</p>
                <p className="text-[9px] text-gray-400">/ 100</p>
              </div>
            </ProgressRing>
            <div className="flex-1 space-y-1">
              {smart.breakdown.slice(0, 4).map((b) => (
                <div key={b.label} className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{b.label}</span>
                  <span className={`font-semibold ${b.points < 0 ? 'text-wine' : 'text-navy-700'}`}>{b.points > 0 ? '+' : ''}{b.points}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hot score + freshness */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Lead Temperature</p>
            <span className={`flex items-center gap-1 text-xs font-medium ${freshness.className}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${freshness.dotClassName}`} />
              {freshness.label}
            </span>
          </div>
          <div className="flex gap-2">
            {HOT_SCORES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={async () => { if (await patchLead({ hot_score: s.value })) toast(`Marked ${s.label}`, { emoji: s.emoji }) }}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all active:scale-95 ${
                  lead.hot_score === s.value
                    ? `${s.className} border-transparent`
                    : 'bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100'
                }`}
              >
                <span className="text-base">{s.emoji}</span>
                <span className="text-xs font-semibold">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-navy-900 text-sm mb-4">Contact</h3>
          <div className="space-y-2">
            <a href={telHref} className="flex items-center gap-3 text-sm text-navy-700 hover:text-wine">
              <Phone size={14} className="text-sky-400" />{formatPhone(lead.phone)}
            </a>
            <a href={`mailto:${lead.email}`} className="flex items-center gap-3 text-sm text-navy-700 hover:text-wine break-all">
              <Mail size={14} className="text-sky-400 shrink-0" />{lead.email}
            </a>
            {lead.phone && (
              <a href={waBase} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-green-600 hover:text-green-700">
                <MessageSquare size={14} />WhatsApp
              </a>
            )}
            {lead.preferred_area && (
              <div className="flex items-center gap-3 text-sm text-navy-700">
                <MapPin size={14} className="text-sky-400" />{lead.preferred_area}
              </div>
            )}
          </div>

          {/* Send buyer qualification form */}
          <div className="mt-4 pt-4 border-t border-gray-50">
            <button
              type="button"
              onClick={sendBuyerForm}
              disabled={sendingForm}
              className="btn-wine w-full justify-center text-sm py-2.5 disabled:opacity-60"
            >
              <Send size={14} /> {sendingForm ? 'Sending…' : formSentAt ? 'Resend buyer form' : 'Send buyer form'}
            </button>
            {whatsappDigits && (
              <a
                href={`https://wa.me/${whatsappDigits}?text=${encodeURIComponent(`Hi ${firstNm}! 👋 Jordan here. Take 60 seconds to tell me what you're looking for so I can match you with the right homes: https://jordanpadierne.com/qualify/${lead.id}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center justify-center gap-1.5 w-full text-sm py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors"
              >
                <MessageSquare size={14} /> Send form via WhatsApp
              </a>
            )}
            {formSentAt && (
              <p className="text-xs text-gray-400 text-center mt-2">
                Sent {formatRelativeTime(formSentAt)} · they fill it in → this profile updates automatically
              </p>
            )}
            <a href={`/portal/${lead.id}`} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center justify-center gap-1.5 w-full text-xs text-sky-600 hover:text-sky-700 font-semibold">
              ↗ Open client portal
            </a>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-navy-900 text-sm">Tags</h3>
            <button type="button" onClick={() => setShowTagPicker(!showTagPicker)} className="text-sky-500 hover:text-sky-600" aria-label="Add tag">
              <Plus size={15} className={showTagPicker ? 'rotate-45 transition-transform' : 'transition-transform'} />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.length === 0 && !showTagPicker && <p className="text-gray-300 text-xs">No tags yet</p>}
            {tags.map((tagId) => {
              const t = getTagDef(tagId)
              return (
                <button key={tagId} type="button" onClick={() => toggleTag(tagId)} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${t.className}`}>
                  {t.emoji} {t.label} <span className="opacity-50">×</span>
                </button>
              )
            })}
          </div>
          {showTagPicker && (
            <div className="flex flex-wrap gap-1.5 pt-3 border-t border-gray-50">
              {LEAD_TAGS.filter((t) => !tags.includes(t.id)).map((t) => (
                <button key={t.id} type="button" onClick={() => toggleTag(t.id)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100">
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pipeline stage quick change */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-navy-900 text-sm mb-3">Pipeline Stage</h3>
          <button type="button" onClick={() => setShowStagePicker(!showStagePicker)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border ${getPipelineStageColor(lead.pipeline_stage)} border-transparent`}>
            <span className="text-sm font-semibold">{getPipelineStageLabel(lead.pipeline_stage)}</span>
            <ChevronDown size={15} className={showStagePicker ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>
          {showStagePicker && (
            <div className="mt-2 space-y-1">
              {STAGES.map((stage) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => { setStage(stage); setShowStagePicker(false) }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    lead.pipeline_stage === stage ? 'bg-navy-900 text-white font-semibold' : 'text-navy-700 hover:bg-gray-50'
                  }`}
                >
                  {getPipelineStageLabel(stage)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Next follow-up */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-navy-900 text-sm mb-3 flex items-center gap-2">
            <Clock size={14} className="text-sky-400" /> Next Follow-Up
          </h3>
          <input
            type="date"
            value={lead.next_followup ? lead.next_followup.slice(0, 10) : ''}
            onChange={(e) => patchLead({ next_followup: e.target.value || null })}
            className="input-field text-sm"
            title="Next follow-up date"
          />
          {lead.next_followup && (
            <p className="text-xs text-gray-400 mt-2">Scheduled for {formatDate(lead.next_followup)}</p>
          )}
        </div>

        {/* Deal & Commission */}
        <div className="bg-gradient-to-br from-navy-900 to-navy-700 rounded-2xl p-5 shadow-sm text-white">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <TrendingUp size={14} className="text-sky-400" /> Deal & Commission
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-navy-300 mb-1">Deal Value ($)</label>
              <input
                type="number"
                defaultValue={lead.deal_value ?? ''}
                onBlur={(e) => patchLead({ deal_value: e.target.value ? Number(e.target.value) : null })}
                placeholder={lead.budget_max ? String(lead.budget_max) : '650000'}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-navy-400 text-sm focus:outline-none focus:border-sky-400"
                title="Deal value"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs text-navy-300 mb-1">Commission %</label>
                <input
                  type="number"
                  step="0.5"
                  defaultValue={lead.commission_rate ?? 3}
                  onBlur={(e) => patchLead({ commission_rate: e.target.value ? Number(e.target.value) : 3 })}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-sky-400"
                  title="Commission rate"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-navy-300 mb-1">Close %</label>
                <input
                  type="number"
                  defaultValue={lead.close_probability ?? 50}
                  onBlur={(e) => patchLead({ close_probability: e.target.value ? Number(e.target.value) : 50 })}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-sky-400"
                  title="Close probability"
                />
              </div>
            </div>
            <div className="pt-3 border-t border-white/15 flex items-center justify-between">
              <span className="text-navy-300 text-xs">Your Commission</span>
              <span className="font-serif text-2xl font-bold text-sky-400">{commission ? formatCurrency(commission) : '—'}</span>
            </div>
          </div>
        </div>

        {/* Send matching homes */}
        <SendPropertiesPanel lead={lead} />

        {/* Appointments */}
        <div id="appt-anchor" className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm scroll-mt-24">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-navy-900 text-sm flex items-center gap-2">
              <CalendarPlus size={14} className="text-sky-400" /> Appointments
            </h3>
            <button type="button" onClick={() => setShowApptForm(!showApptForm)} className="text-sky-500 hover:text-sky-600" aria-label="Add appointment">
              <Plus size={15} className={showApptForm ? 'rotate-45 transition-transform' : 'transition-transform'} />
            </button>
          </div>
          {showApptForm && (
            <div className="space-y-2.5 mb-3 pb-3 border-b border-gray-50">
              <input value={apptTitle} onChange={(e) => setApptTitle(e.target.value)} placeholder={`e.g. Showing in ${lead.preferred_area || 'Brickell'}`} className="input-field text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setApptMode('in_person')} className={`py-2 rounded-xl border text-xs font-semibold transition-all ${apptMode === 'in_person' ? 'bg-navy-900 border-navy-900 text-white' : 'bg-white border-gray-200 text-navy-700 hover:border-navy-300'}`}>🏠 In person</button>
                <button type="button" onClick={() => setApptMode('video')} className={`py-2 rounded-xl border text-xs font-semibold transition-all ${apptMode === 'video' ? 'bg-navy-900 border-navy-900 text-white' : 'bg-white border-gray-200 text-navy-700 hover:border-navy-300'}`}>🎥 Video call</button>
              </div>
              <div className="flex gap-2">
                <input type="datetime-local" value={apptWhen} min={minDateTime} onChange={(e) => setApptWhen(e.target.value)} className="input-field text-sm flex-1" title="When" />
                <select value={apptDuration} onChange={(e) => setApptDuration(Number(e.target.value))} className="input-field text-sm w-24" title="Duration">
                  <option value={15}>15 min</option>
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>60 min</option>
                </select>
              </div>
              {apptMode === 'in_person' ? (
                <input value={apptLocation} onChange={(e) => setApptLocation(e.target.value)} placeholder="Address / where to meet" className="input-field text-sm" />
              ) : (
                <p className="text-xs text-gray-400 flex items-center gap-1.5">🔗 A video-call link is generated and sent to the client automatically.</p>
              )}
              <label className="flex items-center gap-2 text-xs text-navy-700">
                <input type="checkbox" checked={apptInvite} onChange={(e) => setApptInvite(e.target.checked)} className="w-3.5 h-3.5 accent-sky-500" />
                Email calendar invite to {firstNm}
              </label>
              <button type="button" onClick={scheduleAndInvite} disabled={!apptTitle.trim() || !apptWhen || scheduling} className="btn-primary w-full text-sm disabled:opacity-50">
                {scheduling ? 'Scheduling…' : apptInvite ? 'Schedule & send invite' : 'Schedule'}
              </button>
            </div>
          )}
          <div className="space-y-2">
            {appts.length === 0 && !showApptForm && <p className="text-gray-300 text-xs text-center py-1">No appointments scheduled.</p>}
            {appts.map((a) => (
              <div key={a.id} className="flex items-center gap-2.5 text-sm">
                <span className="text-base">{a.type === 'showing' ? '🏠' : a.type === 'video' ? '🎥' : a.type === 'call' ? '📞' : a.type === 'meeting' ? '🤝' : a.type === 'closing' ? '🔑' : '📌'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-navy-700 text-xs font-medium truncate">{a.title}</p>
                  <p className="text-gray-400 text-xs">{formatDate(a.starts_at)} · {new Date(a.starts_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lead details */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-navy-900 text-sm mb-3">Details</h3>
          <div className="space-y-2.5 text-sm">
            {(lead.budget_min || lead.budget_max) && (
              <div className="flex items-center gap-3">
                <DollarSign size={14} className="text-gray-300" />
                <span className="text-gray-500">Budget:</span>
                <span className="text-navy-700 font-medium">
                  {lead.budget_min ? formatCurrency(lead.budget_min) : '—'} – {lead.budget_max ? formatCurrency(lead.budget_max) : 'Open'}
                </span>
              </div>
            )}
            {lead.timeline && <div className="flex items-center gap-3"><Calendar size={14} className="text-gray-300" /><span className="text-gray-500">Timeline:</span><span className="text-navy-700">{lead.timeline}</span></div>}
            {lead.financing_status && <div className="flex gap-3"><span className="text-gray-500 shrink-0">Financing:</span><span className="text-navy-700">{lead.financing_status}</span></div>}
            <div className="flex items-center gap-3"><span className="text-gray-500">Source:</span><span className="text-navy-700">{lead.source}</span></div>
            <div className="flex items-center gap-3"><span className="text-gray-500">Client:</span><span className="text-navy-700">{lead.client_type}</span></div>
          </div>
        </div>
      </div>

      {/* ─── Right column: notes, tasks, timeline ─── */}
      <div className="lg:col-span-2 space-y-6">
        {/* Quick note composer */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
            <StickyNote size={15} className="text-sky-400" />
            <h3 className="font-semibold text-navy-900 text-sm">Notes & Activity Log</h3>
            <span className="text-gray-400 text-xs ml-auto">{notes.length}</span>
          </div>
          <div className="p-5">
            <div className="flex gap-2 mb-4">
              <input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addNote() } }}
                placeholder="Log a call, meeting, or note… (Enter to save)"
                className="input-field text-sm"
              />
              <button type="button" onClick={addNote} disabled={savingNote || !noteText.trim()} aria-label="Save note" className="btn-primary px-4 shrink-0 disabled:opacity-50">
                <Send size={14} />
              </button>
            </div>
            {/* Quick note presets */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {['📞 Called — left voicemail', '📞 Spoke — interested', '📧 Sent listings', '🏠 Showing scheduled', '🤝 Met in person'].map((preset) => (
                <button key={preset} type="button" onClick={() => setNoteText(preset)} className="text-xs px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 hover:bg-sky-50 hover:text-sky-600 transition-colors">
                  {preset}
                </button>
              ))}
            </div>
            {/* Notes list */}
            <div className="space-y-3">
              {notes.length === 0 && <p className="text-gray-300 text-sm text-center py-4">No activity logged yet. Add your first note above.</p>}
              {notes.map((note) => (
                <div key={note.id} className="group flex gap-3 pb-3 border-b border-gray-50 last:border-0">
                  <div className="w-7 h-7 rounded-full bg-sky-50 flex items-center justify-center shrink-0 mt-0.5">
                    <StickyNote size={12} className="text-sky-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-navy-700 text-sm leading-relaxed">{note.content}</p>
                    <p className="text-gray-400 text-xs mt-1">{note.author} · {formatRelativeTime(note.created_at)}</p>
                  </div>
                  <button type="button" onClick={() => deleteNote(note.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-wine transition-all shrink-0" aria-label="Delete note">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
            <Check size={15} className="text-sky-400" />
            <h3 className="font-semibold text-navy-900 text-sm">Tasks</h3>
            <button type="button" onClick={() => setShowTaskForm(!showTaskForm)} className="ml-auto text-sky-500 hover:text-sky-600 text-xs font-semibold flex items-center gap-1">
              <Plus size={13} /> Add
            </button>
          </div>
          <div className="p-5">
            {showTaskForm && (
              <div className="flex flex-col sm:flex-row gap-2 mb-4 pb-4 border-b border-gray-50">
                <input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Task title…" className="input-field text-sm flex-1" />
                <input type="date" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} className="input-field text-sm sm:w-40" title="Due date" />
                <button type="button" onClick={addTask} disabled={!taskTitle.trim()} className="btn-primary px-4 text-sm disabled:opacity-50">Add</button>
              </div>
            )}
            <div className="space-y-2">
              {tasks.length === 0 && !showTaskForm && <p className="text-gray-300 text-sm text-center py-2">No tasks for this lead.</p>}
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3">
                  <button type="button" onClick={() => toggleTask(task)} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${task.status === 'done' ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-sky-400'}`}>
                    {task.status === 'done' && <Check size={12} className="text-white" />}
                  </button>
                  <span className={`text-sm flex-1 ${task.status === 'done' ? 'text-gray-400 line-through' : 'text-navy-700'}`}>{task.title}</span>
                  {task.due_date && <span className="text-xs text-gray-400">{formatDate(task.due_date)}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Original message + form submissions */}
        {(lead.message || messages.length > 0) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h3 className="font-semibold text-navy-900 text-sm">Form Submissions</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {lead.message && (
                <div className="px-5 py-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Original Inquiry</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{lead.message}</p>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-navy-900 text-sm">{msg.subject}</p>
                    <span className="text-gray-400 text-xs">{formatDate(msg.created_at)}</span>
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick message templates */}
        <TemplatesPanel leadName={lead.full_name} leadPhone={lead.phone} leadEmail={lead.email} />
      </div>
      </div>
    </div>
  )
}
