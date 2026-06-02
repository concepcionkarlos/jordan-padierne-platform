export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase'
import {
  formatRelativeTime,
  getPipelineStageColor,
  getPipelineStageLabel,
  getStatusColor,
  formatPhone,
} from '@/lib/utils'
import { UserCircle, Phone, Mail, Plus } from 'lucide-react'

async function getLeads() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)
  return data ?? []
}

export default async function LeadsPage() {
  const leads = await getLeads()

  const byStage = {
    new: leads.filter((l) => l.status === 'new').length,
    contacted: leads.filter((l) => l.status === 'contacted').length,
    qualified: leads.filter((l) => l.status === 'qualified').length,
    active: leads.filter((l) => l.status === 'active').length,
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy-900">Leads</h1>
          <p className="text-gray-500 text-sm mt-0.5">{leads.length} total leads</p>
        </div>
        <button className="btn-primary text-sm px-4 py-2.5">
          <Plus size={15} /> Add Lead
        </button>
      </div>

      {/* Stage summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {Object.entries(byStage).map(([stage, count]) => (
          <div key={stage} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide capitalize">{stage}</p>
            <p className="font-serif text-2xl font-bold text-navy-900 mt-1">{count}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Contact</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden lg:table-cell">Type</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Pipeline</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Source</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">
                    No leads yet. Leads will appear here once website forms are submitted.
                  </td>
                </tr>
              )}
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <Link href={`/admin/leads/${lead.id}`} className="flex items-center gap-3 group">
                      <div className="w-8 h-8 rounded-full bg-navy-50 flex items-center justify-center shrink-0">
                        <UserCircle size={16} className="text-navy-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-navy-900 group-hover:text-wine transition-colors text-sm">{lead.full_name}</p>
                        <p className="text-gray-400 text-xs">{lead.preferred_area ?? '—'}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <div className="space-y-0.5">
                      <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-gray-500 hover:text-navy-900 text-xs">
                        <Phone size={11} />{formatPhone(lead.phone)}
                      </a>
                      <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-gray-500 hover:text-navy-900 text-xs">
                        <Mail size={11} />{lead.email}
                      </a>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className="text-xs text-navy-700 font-medium">{lead.client_type}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`badge ${getPipelineStageColor(lead.pipeline_stage)}`}>
                      {getPipelineStageLabel(lead.pipeline_stage)}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className="text-xs text-gray-500">{lead.source}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs text-gray-400">{formatRelativeTime(lead.created_at)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
