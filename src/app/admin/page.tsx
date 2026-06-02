export const dynamic = 'force-dynamic'
import { Users, MessageSquare, CheckSquare, TrendingUp, AlertCircle, UserCircle } from 'lucide-react'
import StatCard from '@/components/admin/StatCard'
import { safeQuery } from '@/lib/db'
import { isSupabaseConfigured } from '@/lib/supabase'
import { formatRelativeTime, getPipelineStageColor, getPipelineStageLabel, getStatusColor } from '@/lib/utils'
import Link from 'next/link'

async function getDashboardData() {
  const [leads, messages, tasks]: [any[], any[], any[]] = await Promise.all([
    safeQuery((db) => db.from('leads').select('id, full_name, status, pipeline_stage, client_type, created_at, source').order('created_at', { ascending: false }).limit(100), []),
    safeQuery((db) => db.from('messages').select('id, full_name, type, status, created_at, subject').order('created_at', { ascending: false }).limit(10), []),
    safeQuery((db) => db.from('tasks').select('id, title, status, priority, due_date').eq('status', 'todo').order('due_date', { ascending: true }).limit(10), []),
  ])

  const newLeads = leads.filter((l: any) => l.status === 'new').length
  const unreadMessages = messages.filter((m: any) => m.status === 'unread').length
  const activePipeline = leads.filter((l: any) => !['CLOSED', 'LOST'].includes(l.pipeline_stage)).length
  const recentLeads = leads.slice(0, 8)

  return { leads, messages, tasks, newLeads, unreadMessages, activePipeline, recentLeads, totalLeads: leads.length }
}

export default async function AdminDashboard() {
  const configured = isSupabaseConfigured()
  const data = await getDashboardData()

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-navy-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your leads, messages, and tasks.</p>
      </div>

      {/* Supabase setup banner */}
      {!configured && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle size={16} className="text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-amber-900 text-sm">Supabase Not Connected</p>
            <p className="text-amber-700 text-xs mt-1 leading-relaxed">
              Add your Supabase credentials to <code className="bg-amber-100 px-1 rounded">.env.local</code> to activate the CRM.
              Run <code className="bg-amber-100 px-1 rounded">supabase/schema.sql</code> in your Supabase SQL editor first.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Leads" value={data.totalLeads} subtitle="All time" icon={Users} color="navy" />
        <StatCard title="New Leads" value={data.newLeads} subtitle="Awaiting contact" icon={AlertCircle} color="wine" />
        <StatCard title="Unread Messages" value={data.unreadMessages} subtitle="From website forms" icon={MessageSquare} color="sky" />
        <StatCard title="Active Pipeline" value={data.activePipeline} subtitle="In progress deals" icon={TrendingUp} color="green" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Leads */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-navy-900">Recent Leads</h2>
            <Link href="/admin/leads" className="text-sky-500 text-xs font-semibold hover:text-sky-600">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {data.recentLeads.length === 0 && (
              <div className="px-6 py-10 text-center">
                <Users size={28} className="text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No leads yet.</p>
                <p className="text-gray-300 text-xs mt-1">They appear here when website forms are submitted.</p>
              </div>
            )}
            {data.recentLeads.map((lead) => (
              <Link
                key={lead.id}
                href={`/admin/leads/${lead.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-navy-100 flex items-center justify-center shrink-0">
                  <UserCircle size={18} className="text-navy-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy-900 text-sm truncate">{lead.full_name}</p>
                  <p className="text-gray-400 text-xs">{lead.client_type} · {lead.source}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`badge ${getPipelineStageColor(lead.pipeline_stage)}`}>
                    {getPipelineStageLabel(lead.pipeline_stage)}
                  </span>
                  <span className="text-gray-300 text-xs">{formatRelativeTime(lead.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Recent Messages */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-navy-900 text-sm">Recent Messages</h2>
              <Link href="/admin/messages" className="text-sky-500 text-xs font-semibold hover:text-sky-600">
                All →
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {data.messages.length === 0 && (
                <p className="px-5 py-6 text-center text-gray-400 text-xs">No messages yet.</p>
              )}
              {data.messages.slice(0, 5).map((msg) => (
                <Link
                  key={msg.id}
                  href="/admin/messages"
                  className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${msg.status === 'unread' ? 'bg-wine' : 'bg-gray-200'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy-900 text-xs truncate">{msg.full_name}</p>
                    <p className="text-gray-400 text-xs truncate">{msg.subject}</p>
                  </div>
                  <span className="text-gray-300 text-xs shrink-0">{formatRelativeTime(msg.created_at)}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-navy-900 text-sm">Pending Tasks</h2>
              <Link href="/admin/tasks" className="text-sky-500 text-xs font-semibold hover:text-sky-600">
                All →
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {data.tasks.length === 0 && (
                <p className="px-5 py-6 text-center text-gray-400 text-xs">No pending tasks.</p>
              )}
              {data.tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-start gap-3 px-5 py-3.5">
                  <CheckSquare size={14} className={task.priority === 'high' ? 'text-wine mt-0.5' : 'text-gray-400 mt-0.5'} />
                  <div className="flex-1 min-w-0">
                    <p className="text-navy-900 text-xs font-medium truncate">{task.title}</p>
                    {task.due_date && (
                      <p className="text-gray-400 text-xs">Due {formatRelativeTime(task.due_date)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
