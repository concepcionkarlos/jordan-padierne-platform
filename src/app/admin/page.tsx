export const dynamic = 'force-dynamic'
import { Users, MessageSquare, TrendingUp, AlertCircle, UserCircle, Phone, Clock, Flame, CalendarClock, ArrowRight, Target, Zap, CheckSquare, Calendar, Sparkles } from 'lucide-react'
import { safeQuery } from '@/lib/db'
import { isSupabaseConfigured } from '@/lib/supabase'
import { formatRelativeTime, getPipelineStageColor, getPipelineStageLabel, formatCurrency } from '@/lib/utils'
import { getLeadFreshness, getFollowupStatus, getTagDef } from '@/lib/leads'
import { buildActivityDays, calcStreak, countTodayActivity, commissionFor, weightedDealValue, isThisMonth } from '@/lib/goals'
import { getNextAction, urgencyMeta, urgencyRank } from '@/lib/coach'
import ProgressRing from '@/components/admin/ProgressRing'
import GettingStarted from '@/components/admin/GettingStarted'
import TipBanner from '@/components/admin/TipBanner'
import Link from 'next/link'

const DAILY_GOAL = 5
const MONTHLY_CLOSE_GOAL = 2

async function getData() {
  const [leads, messages, notes, appointments, doneTasks, todoTasks, properties, testimonials]: any[] = await Promise.all([
    safeQuery((db) => db.from('leads').select('*').order('created_at', { ascending: false }).limit(400), []),
    safeQuery((db) => db.from('messages').select('id, full_name, status, created_at').order('created_at', { ascending: false }).limit(10), []),
    safeQuery((db) => db.from('notes').select('created_at, lead_id').order('created_at', { ascending: false }).limit(800), []),
    safeQuery((db) => db.from('appointments').select('*, leads(full_name, phone)').order('starts_at', { ascending: true }).limit(200), []),
    safeQuery((db) => db.from('tasks').select('completed_at').eq('status', 'done').limit(400), []),
    safeQuery((db) => db.from('tasks').select('*').eq('status', 'todo').order('due_date', { ascending: true }).limit(100), []),
    safeQuery((db) => db.from('properties').select('id').limit(1), []),
    safeQuery((db) => db.from('testimonials').select('id').limit(1), []),
  ])

  const active = leads.filter((l: any) => !['closed', 'lost'].includes(l.status))

  // ─── Coach Action Feed: the single best move per active lead, prioritized ───
  const noteCountBy: Record<string, number> = {}
  const lastNoteBy: Record<string, string> = {}
  for (const n of notes) {
    if (!n.lead_id) continue
    noteCountBy[n.lead_id] = (noteCountBy[n.lead_id] ?? 0) + 1
    if (!lastNoteBy[n.lead_id]) lastNoteBy[n.lead_id] = n.created_at // notes are desc, first seen is latest
  }
  const nowD = new Date()
  const apptByLead: Record<string, any[]> = {}
  for (const a of appointments) { if (a.lead_id) (apptByLead[a.lead_id] ??= []).push(a) }

  const actionFeed = active.map((l: any) => {
    const la: any[] = apptByLead[l.id] ?? []
    const upcoming = la.find((a: any) => new Date(a.starts_at) >= nowD && a.status === 'scheduled')
    const pastAppt = la.find((a: any) => new Date(a.starts_at) < nowD)
    const lastNote = lastNoteBy[l.id]
    const action = getNextAction(l, {
      noteCount: noteCountBy[l.id] ?? 0,
      hasUpcomingAppt: !!upcoming,
      nextApptAt: upcoming?.starts_at ?? null,
      hasPastApptNoFollowup: !!pastAppt && (!lastNote || new Date(lastNote) < new Date(pastAppt.starts_at)),
    })
    return { lead: l, action }
  })
    .sort((a: any, b: any) => urgencyRank(a.action.urgency) - urgencyRank(b.action.urgency))
    .slice(0, 12)

  // Gamification
  const activityDays = buildActivityDays(notes, appointments, doneTasks)
  const streak = calcStreak(activityDays)
  const todayCount = countTodayActivity(notes, appointments, doneTasks)

  // Commission: earned this month (closed) + weighted forecast (pipeline)
  const closedThisMonth = leads.filter((l: any) => l.status === 'closed' && isThisMonth(l.closed_at ?? l.updated_at))
  const earnedThisMonth = closedThisMonth.reduce((s: number, l: any) => s + commissionFor(l.deal_value ?? l.budget_max ?? 0, l.commission_rate ?? 3), 0)
  const forecastValue = active.reduce((s: number, l: any) => s + weightedDealValue(l) * ((l.commission_rate ?? 3) / 100), 0)
  const closedCount = closedThisMonth.length

  // Today's plan
  const now = new Date()
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endToday = new Date(startToday.getTime() + 86400000)
  const todaysAppts = appointments.filter((a: any) => {
    const t = new Date(a.starts_at)
    return t >= startToday && t < endToday && a.status === 'scheduled'
  })
  const followupsDue = active
    .map((l: any) => ({ lead: l, fu: getFollowupStatus(l.next_followup) }))
    .filter((x: any) => x.fu?.due)
    .sort((a: any, b: any) => (a.fu.overdue === b.fu.overdue ? 0 : a.fu.overdue ? -1 : 1))
  const overdueTasks = todoTasks.filter((t: any) => t.due_date && new Date(t.due_date) < endToday)

  const staleLeads = active
    .map((l: any) => ({ lead: l, fresh: getLeadFreshness(l) }))
    .filter((x: any) => x.fresh.level === 'stale' || x.fresh.level === 'cold')
    .sort((a: any, b: any) => b.fresh.ageDays - a.fresh.ageDays)
    .slice(0, 5)

  const hotLeads = active.filter((l: any) => l.hot_score === 3).slice(0, 5)

  return {
    totalLeads: leads.length, newLeads: leads.filter((l: any) => l.status === 'new').length,
    unreadMessages: messages.filter((m: any) => m.status === 'unread').length, activePipeline: active.length,
    streak, todayCount, earnedThisMonth, forecastValue, closedCount,
    todaysAppts, followupsDue, overdueTasks, staleLeads, hotLeads, actionFeed,
    recentLeads: leads.slice(0, 5),
    onboarding: {
      leads: leads.length, properties: properties.length, notes: notes.length,
      appointments: appointments.length, testimonials: testimonials.length,
    },
    planCount: todaysAppts.length + followupsDue.length + overdueTasks.length,
  }
}

function apptIcon(type: string) {
  return type === 'showing' ? '🏠' : type === 'call' ? '📞' : type === 'meeting' ? '🤝' : type === 'closing' ? '🔑' : '📌'
}

export default async function AdminDashboard() {
  const configured = isSupabaseConfigured()
  const d = await getData()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-6 lg:p-8">
      {!configured && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
          <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900 text-sm">Supabase Not Connected</p>
            <p className="text-amber-700 text-xs mt-1">Add credentials to <code className="bg-amber-100 px-1 rounded">.env.local</code> to activate the CRM.</p>
          </div>
        </div>
      )}

      {/* ─── Command strip: greeting + streak + daily goal + commission ─── */}
      <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 rounded-3xl p-6 lg:p-7 mb-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <p className="text-sky-400 text-sm font-medium">{greeting}, Jordan 👋</p>
            <h1 className="font-serif text-2xl lg:text-3xl font-bold text-white mt-1">
              {d.planCount > 0 ? `You have ${d.planCount} thing${d.planCount > 1 ? 's' : ''} to do today` : "You're all caught up! 🎉"}
            </h1>
            <p className="text-navy-200 text-sm mt-1.5">
              {d.streak > 0 ? `🔥 ${d.streak}-day streak — keep it going!` : 'Log an activity today to start a streak 🔥'}
            </p>
          </div>

          <div className="flex items-center gap-6">
            {/* Daily activity ring */}
            <div className="text-center">
              <ProgressRing value={d.todayCount} max={DAILY_GOAL} color={d.todayCount >= DAILY_GOAL ? '#4ADE80' : '#7BA7C2'}>
                <div className="text-center">
                  <p className="font-serif text-xl font-bold leading-none">{d.todayCount}</p>
                  <p className="text-[10px] text-navy-300">/ {DAILY_GOAL}</p>
                </div>
              </ProgressRing>
              <p className="text-xs text-navy-300 mt-1.5">Today&apos;s Activity</p>
            </div>
            {/* Streak */}
            <div className="text-center">
              <div className="w-[72px] h-[72px] rounded-full bg-white/10 flex items-center justify-center">
                <div>
                  <p className="font-serif text-xl font-bold leading-none">{d.streak}</p>
                  <p className="text-[10px] text-navy-300 text-center">🔥 days</p>
                </div>
              </div>
              <p className="text-xs text-navy-300 mt-1.5">Streak</p>
            </div>
            {/* Commission */}
            <div className="hidden sm:block border-l border-white/15 pl-6">
              <p className="text-xs text-navy-300">Forecast Commission</p>
              <p className="font-serif text-2xl font-bold text-sky-400 mt-0.5">{formatCurrency(Math.round(d.forecastValue))}</p>
              <p className="text-xs text-navy-300 mt-1">Earned this month: <span className="text-green-400 font-semibold">{formatCurrency(d.earnedThisMonth)}</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Getting Started (auto-hides when complete) ─── */}
      <GettingStarted stats={d.onboarding} />

      {/* ─── Stat cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Leads', value: d.totalLeads, icon: Users, color: 'text-navy-700 bg-navy-50' },
          { label: 'New Leads', value: d.newLeads, icon: AlertCircle, color: 'text-wine bg-wine-50' },
          { label: 'Unread Messages', value: d.unreadMessages, icon: MessageSquare, color: 'text-sky-600 bg-sky-50' },
          { label: 'Closed This Month', value: `${d.closedCount}/${MONTHLY_CLOSE_GOAL}`, icon: Target, color: 'text-green-600 bg-green-50' },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">{s.label}</p>
                  <p className="font-serif text-3xl font-bold text-navy-900 mt-1">{s.value}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}><Icon size={20} /></div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ─── Coach Action Feed: what to do, per lead, prioritized ─── */}
      {d.actionFeed.length > 0 && (
        <TipBanner id="coach">
          💡 <strong>Your Coach</strong> tells you exactly what to do next with each client, ranked by urgency. Work the list top to bottom — each lead you touch keeps your 🔥 streak alive.
        </TipBanner>
      )}
      {d.actionFeed.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2 bg-gradient-to-r from-navy-900/5 to-transparent">
            <Sparkles size={16} className="text-wine" />
            <h2 className="font-semibold text-navy-900 text-sm">Your Coach — Next Moves</h2>
            <span className="text-gray-400 text-xs ml-auto">Smart-prioritized across {d.activePipeline} active leads</span>
          </div>
          <div className="divide-y divide-gray-50">
            {d.actionFeed.map(({ lead, action }: any) => {
              const um = urgencyMeta(action.urgency)
              return (
                <div key={lead.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group">
                  <span className="text-xl shrink-0">{action.emoji}</span>
                  <Link href={`/admin/leads/${lead.id}`} className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-navy-900 text-sm truncate">{action.title}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${um.className} shrink-0`}>{um.label}</span>
                    </div>
                    <p className="text-gray-400 text-xs truncate">{lead.full_name} · {action.reason}</p>
                  </Link>
                  {lead.phone && (
                    <a href={`tel:${lead.phone}`} className="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-sky-50 flex items-center justify-center text-sky-500 shrink-0" aria-label="Call"><Phone size={14} /></a>
                  )}
                  <Link href={`/admin/leads/${lead.id}`} className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-wine shrink-0">{action.actionLabel}<ArrowRight size={12} /></Link>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ─── Today's Plan ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2 bg-gradient-to-r from-sky-50 to-transparent">
          <Zap size={16} className="text-sky-500" />
          <h2 className="font-semibold text-navy-900 text-sm">Today&apos;s Plan</h2>
          {d.planCount > 0 && <span className="bg-sky-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{d.planCount}</span>}
        </div>
        <div className="divide-y divide-gray-50">
          {d.planCount === 0 && (
            <div className="px-5 py-10 text-center">
              <CheckSquare size={28} className="text-green-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm font-medium">Nothing scheduled today.</p>
              <p className="text-gray-400 text-xs mt-1">Time to prospect — add a lead or schedule a showing.</p>
            </div>
          )}
          {/* Appointments */}
          {d.todaysAppts.map((a: any) => (
            <div key={a.id} className="flex items-center gap-3 px-5 py-3">
              <span className="text-lg">{apptIcon(a.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy-900 text-sm truncate">{a.title}</p>
                <p className="text-gray-400 text-xs">{a.leads?.full_name ?? 'Appointment'}{a.location ? ` · ${a.location}` : ''}</p>
              </div>
              <span className="badge bg-sky-50 text-sky-600 text-xs">{new Date(a.starts_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
            </div>
          ))}
          {/* Follow-ups */}
          {d.followupsDue.map(({ lead, fu }: any) => (
            <div key={lead.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
              <CalendarClock size={18} className="text-wine shrink-0" />
              <Link href={`/admin/leads/${lead.id}`} className="flex-1 min-w-0">
                <p className="font-semibold text-navy-900 text-sm truncate">Follow up with {lead.full_name}</p>
                <p className="text-gray-400 text-xs">{lead.client_type}</p>
              </Link>
              <a href={`tel:${lead.phone}`} className="text-sky-400 hover:text-sky-600" aria-label="Call"><Phone size={15} /></a>
              <span className={`badge text-xs ${fu.overdue ? 'bg-wine-50 text-wine' : 'bg-amber-50 text-amber-600'}`}>{fu.label}</span>
            </div>
          ))}
          {/* Overdue tasks */}
          {d.overdueTasks.map((t: any) => (
            <Link key={t.id} href="/admin/tasks" className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
              <CheckSquare size={18} className="text-orange-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy-900 text-sm truncate">{t.title}</p>
                <p className="text-gray-400 text-xs">Task</p>
              </div>
              <span className="badge bg-orange-50 text-orange-600 text-xs">Due</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── Bottom grid: stale + hot + recent ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Going cold */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2 bg-gradient-to-r from-orange-50 to-transparent">
            <Clock size={15} className="text-orange-500" />
            <h2 className="font-semibold text-navy-900 text-sm">Going Cold</h2>
            <Link href="/admin/leads" className="ml-auto text-sky-500 text-xs font-semibold hover:text-sky-600">All →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {d.staleLeads.length === 0 && <p className="px-5 py-8 text-center text-gray-400 text-xs">No stale leads. 👏</p>}
            {d.staleLeads.map(({ lead, fresh }: any) => (
              <Link key={lead.id} href={`/admin/leads/${lead.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <span className={`w-2 h-2 rounded-full shrink-0 ${fresh.dotClassName}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy-900 text-xs truncate">{lead.full_name}</p>
                  <p className="text-gray-400 text-xs">{lead.preferred_area ?? lead.client_type}</p>
                </div>
                <span className={`text-xs font-medium ${fresh.className}`}>{fresh.ageDays}d</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Hot */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2 bg-gradient-to-r from-red-50 to-transparent">
            <Flame size={15} className="text-red-500" />
            <h2 className="font-semibold text-navy-900 text-sm">Hot Leads</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {d.hotLeads.length === 0 && <p className="px-5 py-8 text-center text-gray-400 text-xs">Mark leads 🔥 to prioritize.</p>}
            {d.hotLeads.map((lead: any) => (
              <Link key={lead.id} href={`/admin/leads/${lead.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <Flame size={14} className="text-red-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy-900 text-xs truncate">{lead.full_name}</p>
                  <p className="text-gray-400 text-xs">{getPipelineStageLabel(lead.pipeline_stage)}</p>
                </div>
                <ArrowRight size={13} className="text-gray-300" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-navy-900 text-sm">Recent Leads</h2>
            <Link href="/admin/leads" className="text-sky-500 text-xs font-semibold hover:text-sky-600">All →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {d.recentLeads.length === 0 && <p className="px-5 py-8 text-center text-gray-400 text-xs">No leads yet.</p>}
            {d.recentLeads.map((lead: any) => {
              const tags: string[] = lead.tags ?? []
              return (
                <Link key={lead.id} href={`/admin/leads/${lead.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center shrink-0"><UserCircle size={16} className="text-navy-600" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-navy-900 text-xs truncate">{lead.full_name}</p>
                      {lead.hot_score === 3 && <Flame size={10} className="text-red-500 shrink-0" />}
                      {tags.slice(0, 1).map((t) => <span key={t} className="text-xs">{getTagDef(t).emoji}</span>)}
                    </div>
                    <p className="text-gray-400 text-xs">{formatRelativeTime(lead.created_at)}</p>
                  </div>
                  <span className={`badge ${getPipelineStageColor(lead.pipeline_stage)} text-xs`}>{getPipelineStageLabel(lead.pipeline_stage)}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
