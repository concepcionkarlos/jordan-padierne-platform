import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase'
import {
  formatDate,
  formatPhone,
  formatRelativeTime,
  getPipelineStageColor,
  getPipelineStageLabel,
  getStatusColor,
  formatCurrency,
} from '@/lib/utils'
import { ArrowLeft, Phone, Mail, MapPin, Calendar, DollarSign, User } from 'lucide-react'

async function getLead(id: string) {
  const supabase = createServiceClient()
  const { data } = await supabase.from('leads').select('*').eq('id', id).single()
  return data
}

async function getLeadNotes(leadId: string) {
  const supabase = createServiceClient()
  const { data } = await supabase.from('notes').select('*').eq('lead_id', leadId).order('created_at', { ascending: false })
  return data ?? []
}

async function getLeadMessages(leadId: string) {
  const supabase = createServiceClient()
  const { data } = await supabase.from('messages').select('*').eq('lead_id', leadId).order('created_at', { ascending: false })
  return data ?? []
}

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const [lead, notes, messages] = await Promise.all([
    getLead(params.id),
    getLeadNotes(params.id),
    getLeadMessages(params.id),
  ])

  if (!lead) notFound()

  return (
    <div className="p-6 lg:p-8">
      {/* Back */}
      <Link href="/admin/leads" className="flex items-center gap-2 text-sm text-gray-400 hover:text-navy-900 mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to Leads
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy-900">{lead.full_name}</h1>
          <p className="text-gray-400 text-sm mt-1">{lead.client_type} · Added {formatRelativeTime(lead.created_at)}</p>
        </div>
        <div className="flex gap-2">
          <span className={`badge ${getPipelineStageColor(lead.pipeline_stage)}`}>
            {getPipelineStageLabel(lead.pipeline_stage)}
          </span>
          <span className={`badge ${getStatusColor(lead.status)}`}>{lead.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead info */}
        <div className="lg:col-span-1 space-y-4">
          {/* Contact */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-semibold text-navy-900 text-sm mb-4">Contact Info</h3>
            <div className="space-y-3">
              <a href={`tel:${lead.phone}`} className="flex items-center gap-3 text-sm text-navy-700 hover:text-wine group">
                <Phone size={14} className="text-sky-400 group-hover:text-wine" />
                {formatPhone(lead.phone)}
              </a>
              <a href={`mailto:${lead.email}`} className="flex items-center gap-3 text-sm text-navy-700 hover:text-wine group">
                <Mail size={14} className="text-sky-400 group-hover:text-wine" />
                {lead.email}
              </a>
              {lead.preferred_area && (
                <div className="flex items-center gap-3 text-sm text-navy-700">
                  <MapPin size={14} className="text-sky-400" />
                  {lead.preferred_area}
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-semibold text-navy-900 text-sm mb-4">Lead Details</h3>
            <div className="space-y-3 text-sm">
              {lead.budget_min && (
                <div className="flex items-center gap-3">
                  <DollarSign size={14} className="text-gray-300" />
                  <span className="text-gray-500">Budget:</span>
                  <span className="text-navy-700 font-medium">
                    {formatCurrency(lead.budget_min)} – {lead.budget_max ? formatCurrency(lead.budget_max) : 'Open'}
                  </span>
                </div>
              )}
              {lead.timeline && (
                <div className="flex items-center gap-3">
                  <Calendar size={14} className="text-gray-300" />
                  <span className="text-gray-500">Timeline:</span>
                  <span className="text-navy-700">{lead.timeline}</span>
                </div>
              )}
              {lead.financing_status && (
                <div className="flex items-center gap-3">
                  <User size={14} className="text-gray-300" />
                  <span className="text-gray-500">Financing:</span>
                  <span className="text-navy-700">{lead.financing_status}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <span className="text-gray-500">Source:</span>
                <span className="text-navy-700">{lead.source}</span>
              </div>
            </div>
          </div>

          {/* Message */}
          {lead.message && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-semibold text-navy-900 text-sm mb-3">Original Message</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{lead.message}</p>
            </div>
          )}
        </div>

        {/* Notes + Messages */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notes */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-semibold text-navy-900 text-sm">Notes</h3>
              <span className="text-gray-400 text-xs">{notes.length} note{notes.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="p-5">
              {notes.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No notes yet.</p>}
              {notes.map((note) => (
                <div key={note.id} className="mb-4 pb-4 border-b border-gray-50 last:border-0 last:mb-0 last:pb-0">
                  <p className="text-navy-700 text-sm leading-relaxed">{note.content}</p>
                  <p className="text-gray-400 text-xs mt-1.5">{note.author} · {formatDate(note.created_at)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Form messages */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h3 className="font-semibold text-navy-900 text-sm">Form Submissions</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {messages.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-8">No form submissions linked.</p>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-navy-900 text-sm">{msg.subject}</p>
                    <span className="text-gray-400 text-xs">{formatDate(msg.created_at)}</span>
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
