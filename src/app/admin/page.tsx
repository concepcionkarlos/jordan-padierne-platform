export const dynamic = 'force-dynamic'
import { Users, MessageSquare, TrendingUp, AlertCircle, UserCircle, Phone, Clock, Flame, CalendarClock, ArrowRight } from 'lucide-react'
import StatCard from '@/components/admin/StatCard'
import { safeQuery } from '@/lib/db'
import { isSupabaseConfigured } from '@/lib/supabase'
import { formatRelativeTime, getPipelineStageColor, getPipelineStageLabel, formatPhone } from '@/lib/utils'
import { getLeadFreshness, getFollowupStatus, getHotScore, getTagDef } from '@/lib/leads'
import Link from 'next/link'

async function getDashboardData() {
  const [leads, messages]: [any[], any[]] = await Promise.all([
    safeQuery((db) => db.from('leads').select('*').order('created_at', { ascending: false }).limit(300), []),
    safeQuery((db) => db.from('messages').select('id, full_name, type, status, created_at, subject').order('created_at', { ascending: false }).limit(10), []),
  ])

  const active = leads.filter((l) => !['closed', 'lost'].includes(l.status))

  // Follow-ups due today or overdue
  const followupsDue = active
    .map((l) => ({ lead: l, fu: getFollowupStatus(l.next_followup) }))
    .filter((x) => x.fu?.due)
    .sort((a, b) => (a.fu!.overdue === b.fu!.overdue ? 0 : a.fu!.overdue ? -1 : 1))

  // Stale leads (need attention, no recent contact)
  const staleLeads = active
    .map((l) => ({ lead: l, fresh: getLeadFreshness(l) }))
    .filter((x) => x.fresh.level === 'stale' || x.fresh.level === 'cold')
    .sort((a, b) => b.fresh.ageDays - a.fresh.ageDays)
    .slice(0, 6)

  // Hot leads
  const hotLeads = active.filter((l) => l.hot_score === 3).slice(0, 6)

  const newLeads = leads.filter((l) => l.status === 'new').length
  const unreadMessages = messages.filter((m) => m.status === 'unread').length
  const activePipeline = active.length

  return {
    leads, messages, newLeads, unreadMessages, activePipeline,
    totalLeads: leads.length, followupsDue, staleLeads, hotLeads,
    recentLeads: leads.slice(0, 6),
  }
}

export default async function AdminDashboard() {
  const configured = isSupabaseConfigured()
  const d = await getDashboardData()

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-navy-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Your daily command center.</p>
      </div>

      {!configured && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle size={16} className="text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-amber-900 text-sm">Supabase Not Connected</p>
            <p className="text-amber-700 text-xs mt-1">Add credentials to <code className="bg-amber-100 px-1 rounded">.env.local</code> to activate the CRM.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Leads" value={d.totalLeads} subtitle="All time" icon={Users} color="navy" />
        <StatCard title="New Leads" value={d.newLeads} subtitle="Awaiting first contact" icon={AlertCircle} color="wine" />
        <StatCard title="Unread Messages" value={d.unreadMessages} subtitle="From forms" icon={MessageSquare} color="sky" />
        <StatCard title="Active Pipeline" value={d.activePipeline} subtitle="In progress" icon={TrendingUp} color="green" />
      </div>

      {/* Priority row: Follow-ups + Stale */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Follow-ups due */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 bg-gradient-to-r from-wine-50 to-transparent">
            <div className="flex items-center gap-2">
              <CalendarClock size={16} className="text-wine" />
              <h2 className="font-semibold text-navy-900 text-sm">Follow-Ups Due</h2>
            </div>
            {d.followupsDue.length > 0 && <span className="bg-wine text-white text-xs font-bold px-2 py-0.5 rounded-full">{d.followupsDue.length}</span>}
          </div>
          <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto scrollbar-thin">
            {d.followupsDue.length === 0 && (
              <div className="px-5 py-8 text-center">
                <CalendarClock size={24} className="text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No follow-ups due today.</p>
                <p className="text-gray-300 text-xs mt-0.5">You&apos;re all caught up! 🎉</p>
              </div>
            )}
            {d.followupsDue.map(({ lead, fu }) => (
              <Link key={lead.id} href={`/admin/leads/${lead.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-navy-50 flex items-center justify-center shrink-0">
                  <UserCircle size={16} className="text-navy-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy-900 text-sm truncate">{lead.full_name}</p>
                  <p className="text-gray-400 text-xs">{lead.client_type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a href={`tel:${lead.phone}`} onClick={(e) => e.stopPropagation()} className="text-sky-400 hover:text-sky-600" aria-label="Call"><Phone size={14} /></a>
                  <span className={`badge text-xs ${fu!.overdue ? 'bg-wine-50 text-wine' : 'bg-amber-50 text-amber-600'}`}>{fu!.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Stale leads */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 bg-gradient-to-r from-orange-50 to-transparent">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-orange-500" />
              <h2 className="font-semibold text-navy-900 text-sm">Going Cold — Reach Out</h2>
            </div>
            <Link href="/admin/leads" className="text-sky-500 text-xs font-semibold hover:text-sky-600">All →</Link>
          </div>
          <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto scrollbar-thin">
            {d.staleLeads.length === 0 && (
              <div className="px-5 py-8 text-center">
                <Clock size={24} className="text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No stale leads. Great work!</p>
              </div>
            )}
            {d.staleLeads.map(({ lead, fresh }) => (
              <Link key={lead.id} href={`/admin/leads/${lead.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <span className={`w-2 h-2 rounded-full shrink-0 ${fresh.dotClassName}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy-900 text-sm truncate">{lead.full_name}</p>
                  <p className="text-gray-400 text-xs">{lead.preferred_area ?? lead.client_type}</p>
                </div>
                <span className={`text-xs font-medium ${fresh.className}`}>{fresh.ageDays}d ago</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary row: Hot leads + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hot leads */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 bg-gradient-to-r from-red-50 to-transparent">
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-red-500" />
              <h2 className="font-semibold text-navy-900 text-sm">Hot Leads</h2>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {d.hotLeads.length === 0 && <p className="px-5 py-8 text-center text-gray-400 text-xs">No hot leads marked yet. Mark leads 🔥 in their profile.</p>}
            {d.hotLeads.map((lead) => (
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

        {/* Recent leads */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-navy-900 text-sm">Recent Leads</h2>
            <Link href="/admin/leads" className="text-sky-500 text-xs font-semibold hover:text-sky-600">View All →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {d.recentLeads.length === 0 && (
              <div className="px-5 py-10 text-center">
                <Users size={28} className="text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No leads yet.</p>
              </div>
            )}
            {d.recentLeads.map((lead) => {
              const tags: string[] = lead.tags ?? []
              return (
                <Link key={lead.id} href={`/admin/leads/${lead.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-navy-100 flex items-center justify-center shrink-0">
                    <UserCircle size={18} className="text-navy-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-navy-900 text-sm truncate">{lead.full_name}</p>
                      {lead.hot_score === 3 && <Flame size={11} className="text-red-500 shrink-0" />}
                      {tags.slice(0, 2).map((t) => <span key={t} className="text-xs">{getTagDef(t).emoji}</span>)}
                    </div>
                    <p className="text-gray-400 text-xs">{lead.client_type} · {lead.source}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`badge ${getPipelineStageColor(lead.pipeline_stage)}`}>{getPipelineStageLabel(lead.pipeline_stage)}</span>
                    <span className="text-gray-300 text-xs">{formatRelativeTime(lead.created_at)}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
