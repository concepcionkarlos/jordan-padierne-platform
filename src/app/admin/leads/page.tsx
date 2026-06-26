export const dynamic = 'force-dynamic'
import LeadsTable from '@/components/admin/LeadsTable'
import AddLeadModal from '@/components/admin/AddLeadModal'
import ImportLeadsModal from '@/components/admin/ImportLeadsModal'
import TipBanner from '@/components/admin/TipBanner'
import { getLeadsPage } from '@/lib/leads-query'

const PAGE_SIZE = 25

export default async function LeadsPage({ searchParams }: { searchParams: { tag?: string; stage?: string } }) {
  // Server-renders only the first page (default sort: Smart Score). The table
  // fetches further pages / searches on demand, so the browser never holds the
  // whole book. An optional ?tag= seeds a filter (e.g. command palette "Hot leads");
  // ?stage=CLOSED is the "Clients" view (the closed-won slice — no separate page).
  const initialTag = searchParams?.tag || null
  const initialStage = searchParams?.stage || null
  const initial = await getLeadsPage({ page: 1, pageSize: PAGE_SIZE, sort: 'score', tag: initialTag, stage: initialStage ?? 'ALL' })
  const stats = initial.stats
  const isClients = initialStage === 'CLOSED'

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy-900">{isClients ? 'Clients' : 'Leads'}</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {isClients
              ? <>{initial.total} {initial.total === 1 ? 'client' : 'clients'} · closed deals</>
              : <>{stats.total} total · {stats.active} active</>}
          </p>
        </div>
        <div className="flex gap-2">
          <ImportLeadsModal />
          <AddLeadModal />
        </div>
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

      <TipBanner id="leads">
        💡 Sort by <strong>⚡ Smart Score</strong> to see who&apos;s most ready to buy. The colored dot shows lead freshness — green is fresh, red is going cold. Click any lead to open its Coach.
      </TipBanner>

      {/* key re-seeds the table when the URL filter changes (e.g. palette → Clients
          while already on Leads); in-page filtering keeps the same key, no remount. */}
      <LeadsTable key={`${initialStage ?? 'all'}-${initialTag ?? 'none'}`} initial={initial} pageSize={PAGE_SIZE} initialTag={initialTag} initialStage={initialStage} />
    </div>
  )
}
