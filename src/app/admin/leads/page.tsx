export const dynamic = 'force-dynamic'
import { safeQuery } from '@/lib/db'
import { Plus } from 'lucide-react'
import LeadsTable from '@/components/admin/LeadsTable'
import { getLeadFreshness } from '@/lib/leads'

async function getLeads(): Promise<any[]> {
  return safeQuery((db) => db.from('leads').select('*').order('created_at', { ascending: false }).limit(500), [])
}

export default async function LeadsPage() {
  const leads = await getLeads()

  const stats = {
    total: leads.length,
    hot: leads.filter((l) => l.hot_score === 3).length,
    needsAttention: leads.filter((l) => { const f = getLeadFreshness(l); return f.level === 'stale' || f.level === 'cold' }).filter((l) => !['closed', 'lost'].includes(l.status)).length,
    active: leads.filter((l) => !['CLOSED', 'LOST'].includes(l.pipeline_stage)).length,
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy-900">Leads</h1>
          <p className="text-gray-500 text-sm mt-0.5">{stats.total} total · {stats.active} active</p>
        </div>
        <button type="button" className="btn-primary text-sm px-4 py-2.5">
          <Plus size={15} /> Add Lead
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total</p>
          <p className="font-serif text-2xl font-bold text-navy-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">🔥 Hot</p>
          <p className="font-serif text-2xl font-bold text-red-500 mt-1">{stats.hot}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">⏰ Needs Attention</p>
          <p className="font-serif text-2xl font-bold text-orange-500 mt-1">{stats.needsAttention}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Active</p>
          <p className="font-serif text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
        </div>
      </div>

      <LeadsTable leads={leads} />
    </div>
  )
}
