'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Phone, Mail, MapPin, Calendar, DollarSign, MessageSquare,
  Send, Plus, Check, Flame, Clock, Trash2, StickyNote, ChevronDown, Tag,
} from 'lucide-react'
import {
  formatDate, formatPhone, formatRelativeTime, formatCurrency,
  getPipelineStageLabel, getPipelineStageColor,
} from '@/lib/utils'
import { LEAD_TAGS, getTagDef, HOT_SCORES, getHotScore, getLeadFreshness } from '@/lib/leads'

const STAGES = ['NEW', 'QUALIFIED', 'CONTACTED', 'SHOWING_SCHEDULED', 'NEGOTIATION', 'CLOSED', 'LOST']

interface Note { id: string; content: string; author: string; created_at: string }
interface Task { id: string; title: string; status: string; priority: string; due_date: string | null }
interface Msg { id: string; subject: string; body: string; created_at: string }

interface Props {
  lead: any
  initialNotes: Note[]
  initialTasks: Task[]
  messages: Msg[]
}

export default function LeadWorkspace({ lead: initialLead, initialNotes, initialTasks, messages }: Props) {
  const router = useRouter()
  const [lead, setLead] = useState(initialLead)
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [noteText, setNoteText] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [showTagPicker, setShowTagPicker] = useState(false)
  const [showStagePicker, setShowStagePicker] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDue, setTaskDue] = useState('')
  const [showTaskForm, setShowTaskForm] = useState(false)

  const freshness = getLeadFreshness(lead)
  const hotScore = getHotScore(lead.hot_score)
  const tags: string[] = lead.tags ?? []

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
    }
    setSavingNote(false)
  }

  async function deleteNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id))
    await fetch(`/api/notes?id=${id}`, { method: 'DELETE' })
  }

  // ─── Tags ───
  async function toggleTag(tagId: string) {
    const next = tags.includes(tagId) ? tags.filter((t) => t !== tagId) : [...tags, tagId]
    await patchLead({ tags: next })
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
    }
  }

  async function toggleTask(task: Task) {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)))
    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: task.id, status: newStatus, completed_at: newStatus === 'done' ? new Date().toISOString() : null }),
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ─── Left column: contact + actions ─── */}
      <div className="lg:col-span-1 space-y-4">
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
                onClick={() => patchLead({ hot_score: s.value })}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all ${
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
                  onClick={() => { patchLead({ pipeline_stage: stage }); setShowStagePicker(false) }}
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
              <button type="button" onClick={addNote} disabled={savingNote || !noteText.trim()} className="btn-primary px-4 shrink-0 disabled:opacity-50">
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
      </div>
    </div>
  )
}
