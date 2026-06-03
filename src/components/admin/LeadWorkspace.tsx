'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Phone, Mail, MapPin, Calendar, DollarSign, MessageSquare,
  Send, Plus, Check, Clock, Trash2, StickyNote, ChevronDown, TrendingUp, CalendarPlus,
} from 'lucide-react'
import {
  formatDate, formatPhone, formatRelativeTime, formatCurrency,
  getPipelineStageLabel, getPipelineStageColor,
} from '@/lib/utils'
import { LEAD_TAGS, getTagDef, HOT_SCORES, getHotScore, getLeadFreshness, scoreLead, scoreColor } from '@/lib/leads'
import { commissionFor } from '@/lib/goals'
import { getNextAction, urgencyMeta } from '@/lib/coach'
import { TEMPLATES, fillTemplate } from '@/lib/templates'
import { toast } from '@/lib/toast'
import { fireConfetti } from '@/lib/confetti'
import TemplatesPanel from './TemplatesPanel'
import ProgressRing from './ProgressRing'
import Tooltip from './Tooltip'
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
  const router = useRouter()
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
  const [apptType, setApptType] = useState('showing')
  const [apptWhen, setApptWhen] = useState('')
  const [apptLocation, setApptLocation] = useState('')

  const freshness = getLeadFreshness(lead)
  const hotScore = getHotScore(lead.hot_score)
  const tags: string[] = lead.tags ?? []
  const dealValue = lead.deal_value ?? lead.budget_max ?? 0
  const commRate = lead.commission_rate ?? 3
  const commission = dealValue ? commissionFor(dealValue, commRate) : 0
  const smart = scoreLead({ ...lead, noteCount: notes.length, apptCount: appts.length })

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
    if (a.actionType === 'call') { window.location.href = `tel:${lead.phone}`; return }
    if (a.actionType === 'schedule') { setShowApptForm(true); document.getElementById('appt-anchor')?.scrollIntoView({ behavior: 'smooth' }); return }
    if (a.actionType === 'advance' && a.stage) {
      setStage(a.stage)
      return
    }
    if ((a.actionType === 'template' || a.actionType === 'whatsapp') && a.templateId) {
      const tpl = TEMPLATES.find((t) => t.id === a.templateId)
      if (tpl) {
        const text = fillTemplate(tpl.en, lead.full_name)
        const phone = (lead.phone ?? '').replace(/\D/g, '')
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank')
      }
      return
    }
  }

  // ─── Lead patch helper ───
  async function patchLead(updates: Record<string, unknown>) {
    setLead((prev: any) => ({ ...prev, ...updates }))
    await fetch('/api/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: lead.id, ...updates }),
    })
    router.refresh()
  }

  // ─── Stage change with celebration ───
  async function setStage(stage: string) {
    const status = stage === 'QUALIFIED' ? 'qualified' : stage === 'CLOSED' ? 'closed' : stage === 'LOST' ? 'lost' : 'active'
    const extra: Record<string, unknown> = { pipeline_stage: stage, status }
    if (stage === 'CLOSED') extra.closed_at = new Date().toISOString()
    await patchLead(extra)
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
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: noteText.trim(), lead_id: lead.id }),
    })
    const json = await res.json()
    if (json.success) {
      setNotes((prev) => [json.data, ...prev])
      setNoteText('')
      setLead((prev: any) => ({ ...prev, last_contact: new Date().toISOString() }))
      toast('Activity logged — streak kept alive! 🔥', { type: 'success' })
    }
    setSavingNote(false)
  }

  async function deleteNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id))
    await fetch(`/api/notes?id=${id}`, { method: 'DELETE' })
  }

  // ─── Tags ───
  async function toggleTag(tagId: string) {
    const adding = !tags.includes(tagId)
    const next = adding ? [...tags, tagId] : tags.filter((t) => t !== tagId)
    const def = getTagDef(tagId)
    await patchLead({ tags: next })
    toast(adding ? `Tagged ${def.emoji} ${def.label}` : `Removed ${def.label}`, { type: 'success', emoji: adding ? def.emoji : '➖' })
  }

  // ─── Tasks ───
  async function addTask() {
    if (!taskTitle.trim()) return
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
    const json = await res.json()
    if (json.success) {
      setTasks((prev) => [...prev, json.data])
      setTaskTitle('')
      setTaskDue('')
      setShowTaskForm(false)
      toast('Task added', { type: 'success', emoji: '📋' })
    }
  }

  async function toggleTask(task: Task) {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)))
    if (newStatus === 'done') toast('Task complete! ✓', { type: 'success' })
    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: task.id, status: newStatus, completed_at: newStatus === 'done' ? new Date().toISOString() : null }),
    })
  }

  // ─── Appointments ───
  async function addAppt() {
    if (!apptTitle.trim() || !apptWhen) return
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: apptTitle.trim(), type: apptType, starts_at: new Date(apptWhen).toISOString(),
        location: apptLocation || null, lead_id: lead.id, status: 'scheduled',
      }),
    })
    const json = await res.json()
    if (json.success) {
      setAppts((prev) => [...prev, json.data].sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at)))
      setApptTitle(''); setApptWhen(''); setApptLocation(''); setShowApptForm(false)
      toast('Appointment scheduled 📅', { type: 'success' })
    }
  }

  return (
    <div className="space-y-6">
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
                onClick={() => { patchLead({ hot_score: s.value }); toast(`Marked ${s.label}`, { emoji: s.emoji }) }}
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
            <a href={`tel:${lead.phone}`} className="flex items-center gap-3 text-sm text-navy-700 hover:text-wine">
              <Phone size={14} className="text-sky-400" />{formatPhone(lead.phone)}
            </a>
            <a href={`mailto:${lead.email}`} className="flex items-center gap-3 text-sm text-navy-700 hover:text-wine break-all">
              <Mail size={14} className="text-sky-400 shrink-0" />{lead.email}
            </a>
            {lead.phone && (
              <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-green-600 hover:text-green-700">
                <MessageSquare size={14} />WhatsApp
              </a>
            )}
            {lead.preferred_area && (
              <div className="flex items-center gap-3 text-sm text-navy-700">
                <MapPin size={14} className="text-sky-400" />{lead.preferred_area}
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-navy-900 text-sm">Tags</h3>
            <button type="button" onClick={() => setShowTagPicker(!showTagPicker)} className="text-sky-500 hover:text-sky-600">
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
            <div className="space-y-2 mb-3 pb-3 border-b border-gray-50">
              <input value={apptTitle} onChange={(e) => setApptTitle(e.target.value)} placeholder="e.g. Showing at Brickell condo" className="input-field text-sm" />
              <div className="flex gap-2">
                <select value={apptType} onChange={(e) => setApptType(e.target.value)} className="input-field text-sm flex-1" title="Appointment type">
                  <option value="showing">🏠 Showing</option>
                  <option value="call">📞 Call</option>
                  <option value="meeting">🤝 Meeting</option>
                  <option value="closing">🔑 Closing</option>
                  <option value="other">📌 Other</option>
                </select>
                <input type="datetime-local" value={apptWhen} onChange={(e) => setApptWhen(e.target.value)} className="input-field text-sm flex-1" title="When" />
              </div>
              <input value={apptLocation} onChange={(e) => setApptLocation(e.target.value)} placeholder="Location (optional)" className="input-field text-sm" />
              <button type="button" onClick={addAppt} disabled={!apptTitle.trim() || !apptWhen} className="btn-primary w-full text-sm disabled:opacity-50">Schedule</button>
            </div>
          )}
          <div className="space-y-2">
            {appts.length === 0 && !showApptForm && <p className="text-gray-300 text-xs text-center py-1">No appointments scheduled.</p>}
            {appts.map((a) => (
              <div key={a.id} className="flex items-center gap-2.5 text-sm">
                <span className="text-base">{a.type === 'showing' ? '🏠' : a.type === 'call' ? '📞' : a.type === 'meeting' ? '🤝' : a.type === 'closing' ? '🔑' : '📌'}</span>
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
