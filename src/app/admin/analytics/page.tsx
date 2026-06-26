export const dynamic = 'force-dynamic'
import { safeQuery } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import PageHeader from '@/components/ui/PageHeader'
import { commissionFor, weightedDealValue, isThisMonth, isThisYear, MONTH_NAMES } from '@/lib/goals'
import { TrendingUp, Target, DollarSign, Award, Users } from 'lucide-react'

const STAGES = ['NEW', 'QUALIFIED', 'CONTACTED', 'SHOWING_SCHEDULED', 'NEGOTIATION', 'CLOSED'] as const
const STAGE_LABELS: Record<string, string> = {
  NEW: 'New', QUALIFIED: 'Qualified', CONTACTED: 'Contacted',
  SHOWING_SCHEDULED: 'Showing', NEGOTIATION: 'Negotiation', CLOSED: 'Closed',
}

async function getLeads(): Promise<any[]> {
  return safeQuery((db) => db.from('leads').select('*').limit(1000), [])
}

export default async function AnalyticsPage() {
  const leads = await getLeads()
  const now = new Date()

  // Funnel
  const funnel = STAGES.map((stage) => ({
    stage,
    label: STAGE_LABELS[stage],
    count: leads.filter((l) => l.pipeline_stage === stage).length,
  }))
  const totalInFunnel = leads.filter((l) => l.status !== 'lost').length
  const closedCount = leads.filter((l) => l.pipeline_stage === 'CLOSED').length
  const conversionRate = totalInFunnel > 0 ? Math.round((closedCount / totalInFunnel) * 100) : 0
  const maxFunnel = Math.max(...funnel.map((f) => f.count), 1)

  // Source performance
  const sourceMap: Record<string, { total: number; closed: number }> = {}
  for (const l of leads) {
    const src = l.source ?? 'Unknown'
    if (!sourceMap[src]) sourceMap[src] = { total: 0, closed: 0 }
    sourceMap[src].total++
    if (l.pipeline_stage === 'CLOSED') sourceMap[src].closed++
  }
  const sources = Object.entries(sourceMap)
    .map(([source, v]) => ({ source, ...v, rate: v.total > 0 ? Math.round((v.closed / v.total) * 100) : 0 }))
    .sort((a, b) => b.total - a.total)
  const maxSource = Math.max(...sources.map((s) => s.total), 1)

  // Client type breakdown
  const typeMap: Record<string, number> = {}
  for (const l of leads) typeMap[l.client_type ?? 'Other'] = (typeMap[l.client_type ?? 'Other'] ?? 0) + 1
  const types = Object.entries(typeMap).sort((a, b) => b[1] - a[1])

  // Commission
  const active = leads.filter((l) => !['closed', 'lost'].includes(l.status))
  const forecast = active.reduce((s, l) => s + weightedDealValue(l) * ((l.commission_rate ?? 3) / 100), 0)
  const closedThisMonth = leads.filter((l) => l.status === 'closed' && isThisMonth(l.closed_at ?? l.updated_at))
  const earnedThisMonth = closedThisMonth.reduce((s, l) => s + commissionFor(l.deal_value ?? l.budget_max ?? 0, l.commission_rate ?? 3), 0)
  // YTD = closed deals in the current calendar year (not all-time).
  const closedYTD = leads.filter((l) => l.status === 'closed' && isThisYear(l.closed_at ?? l.updated_at))
  const earnedYTD = closedYTD.reduce((s, l) => s + commissionFor(l.deal_value ?? l.budget_max ?? 0, l.commission_rate ?? 3), 0)
  const pipelineValue = active.reduce((s, l) => s + (l.deal_value ?? l.budget_max ?? 0), 0)

  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="Analytics" subtitle={`Your performance at a glance — ${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`} />

      {/* Commission cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Forecast (weighted)', value: formatCurrency(Math.round(forecast)), icon: TrendingUp, color: 'text-sky-600 bg-sky-50', sub: 'Probability-adjusted pipeline' },
          { label: 'Earned This Month', value: formatCurrency(earnedThisMonth), icon: DollarSign, color: 'text-green-600 bg-green-50', sub: `${closedThisMonth.length} deals closed` },
          { label: 'Earned YTD', value: formatCurrency(earnedYTD), icon: Award, color: 'text-navy-700 bg-navy-50', sub: `${closedYTD.length} ${closedYTD.length === 1 ? 'deal' : 'deals'} in ${now.getFullYear()}` },
          { label: 'Pipeline Value', value: formatCurrency(Math.round(pipelineValue)), icon: Target, color: 'text-wine bg-wine-50', sub: `${active.length} active deals` },
        ].map((c) => {
          const Icon = c.icon
          return (
            <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">{c.label}</p>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.color}`}><Icon size={16} /></div>
              </div>
              <p className="font-serif text-2xl font-bold text-navy-900">{c.value}</p>
              <p className="text-gray-400 text-xs mt-1">{c.sub}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion funnel */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-navy-900 text-sm">Conversion Funnel</h2>
            <span className="badge bg-green-50 text-green-600 text-xs">{conversionRate}% close rate</span>
          </div>
          <div className="p-5 space-y-3">
            {funnel.map((f, i) => (
              <div key={f.stage}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-navy-700 font-medium">{f.label}</span>
                  <span className="text-sm text-gray-400">{f.count}</span>
                </div>
                <div className="h-7 bg-gray-50 rounded-lg overflow-hidden">
                  <div
                    className="h-full rounded-lg flex items-center justify-end pr-2 transition-all"
                    style={{
                      width: `${Math.max((f.count / maxFunnel) * 100, f.count > 0 ? 8 : 0)}%`,
                      background: `linear-gradient(90deg, #1A3A6B, #7BA7C2)`,
                      opacity: 1 - i * 0.12,
                    }}
                  >
                    {f.count > 0 && <span className="text-white text-xs font-semibold">{Math.round((f.count / maxFunnel) * 100)}%</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Source performance */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-navy-900 text-sm">Lead Sources</h2>
          </div>
          <div className="p-5 space-y-3">
            {sources.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No data yet.</p>}
            {sources.map((s) => (
              <div key={s.source}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-navy-700 font-medium">{s.source}</span>
                  <span className="text-xs text-gray-400">{s.total} leads · {s.closed} closed</span>
                </div>
                <div className="h-6 bg-gray-50 rounded-lg overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-sky-400 to-sky-300 rounded-lg" style={{ width: `${Math.max((s.total / maxSource) * 100, 6)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Client type breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden lg:col-span-2">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
            <Users size={15} className="text-sky-400" />
            <h2 className="font-semibold text-navy-900 text-sm">Client Type Breakdown</h2>
          </div>
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {types.map(([type, count]) => (
              <div key={type} className="text-center p-4 rounded-xl bg-gray-50">
                <p className="font-serif text-2xl font-bold text-navy-900">{count}</p>
                <p className="text-gray-500 text-xs mt-1 leading-tight">{type}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
