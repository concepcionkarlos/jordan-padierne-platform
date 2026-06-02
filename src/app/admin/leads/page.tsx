export const dynamic = 'force-dynamic'
import { safeQuery } from '@/lib/db'
import LeadsTable from '@/components/admin/LeadsTable'
import AddLeadModal from '@/components/admin/AddLeadModal'
import { getLeadFreshness } from '@/lib/leads'

async function getLeads(): Promise<any[]> {
  return safeQuery((db) => db.from('leads').select('*').order('created_at', { ascending: false }).limit(500), [])
}
async function getNotes(): Promise<any[]> {
  return safeQuery((db) => db.from('notes').select('lead_id').limit(2000), [])
}
async function getAppts(): Promise<any[]> {
  return safeQuery((db) => db.from('appointments').select('lead_id').limit(2000), [])
}

export default async function LeadsPage() {
  const [rawLeads, notes, appts] = await Promise.all([getLeads(), getNotes(), getAppts()])

  // Engagement counts per lead → feed the smart score
  const noteCounts: Record<string, number> = {}
  for (const n of notes) if (n.lead_id) noteCounts[n.lead_id] = (noteCounts[n.lead_id] ?? 0) + 1
  const apptCounts: Record<string, number> = {}
  for (const a of appts) if (a.lead_id) apptCounts[a.lead_id] = (apptCounts[a.lead_id] ?? 0) + 1

  const leads = rawLeads.map((l) => ({ ...l, noteCount: noteCounts[l.id] ?? 0, apptCount: apptCounts[l.id] ?? 0 }))

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
        <AddLeadModal />
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
