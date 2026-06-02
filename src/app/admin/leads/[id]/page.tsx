export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { safeQuery } from '@/lib/db'
import { formatRelativeTime, getPipelineStageColor, getPipelineStageLabel, getStatusColor } from '@/lib/utils'
import { getTagDef } from '@/lib/leads'
import { ArrowLeft } from 'lucide-react'
import LeadWorkspace from '@/components/admin/LeadWorkspace'

async function getLead(id: string): Promise<any> {
  return safeQuery((db) => db.from('leads').select('*').eq('id', id).single(), null)
}
async function getLeadNotes(leadId: string): Promise<any[]> {
  return safeQuery((db) => db.from('notes').select('*').eq('lead_id', leadId).order('created_at', { ascending: false }), [])
}
async function getLeadMessages(leadId: string): Promise<any[]> {
  return safeQuery((db) => db.from('messages').select('*').eq('lead_id', leadId).order('created_at', { ascending: false }), [])
}
async function getLeadTasks(leadId: string): Promise<any[]> {
  return safeQuery((db) => db.from('tasks').select('*').eq('lead_id', leadId).order('created_at', { ascending: true }), [])
}

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const [lead, notes, messages, tasks] = await Promise.all([
    getLead(params.id),
    getLeadNotes(params.id),
    getLeadMessages(params.id),
    getLeadTasks(params.id),
  ])

  if (!lead) notFound()

  const tags: string[] = lead.tags ?? []

  return (
    <div className="p-6 lg:p-8">
      <Link href="/admin/leads" className="flex items-center gap-2 text-sm text-gray-400 hover:text-navy-900 mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to Leads
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-serif text-2xl font-bold text-navy-900">{lead.full_name}</h1>
            {tags.map((t) => {
              const def = getTagDef(t)
              return <span key={t} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${def.className}`}>{def.emoji} {def.label}</span>
            })}
          </div>
          <p className="text-gray-400 text-sm mt-1">{lead.client_type} · Added {formatRelativeTime(lead.created_at)}</p>
        </div>
        <div className="flex gap-2">
          <span className={`badge ${getPipelineStageColor(lead.pipeline_stage)}`}>{getPipelineStageLabel(lead.pipeline_stage)}</span>
          <span className={`badge ${getStatusColor(lead.status)}`}>{lead.status}</span>
        </div>
      </div>

      <LeadWorkspace lead={lead} initialNotes={notes} initialTasks={tasks} messages={messages} />
    </div>
  )
}
