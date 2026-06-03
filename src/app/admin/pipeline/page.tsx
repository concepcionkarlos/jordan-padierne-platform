export const dynamic = 'force-dynamic'
import { safeQuery } from '@/lib/db'
import { getPipelineStageLabel, formatCurrency, formatRelativeTime } from '@/lib/utils'
import { weightedDealValue, commissionFor } from '@/lib/goals'
import { UserCircle, Phone, Flame } from 'lucide-react'
import TipBanner from '@/components/admin/TipBanner'
import Link from 'next/link'

const STAGES = ['NEW', 'QUALIFIED', 'CONTACTED', 'SHOWING_SCHEDULED', 'NEGOTIATION', 'CLOSED', 'LOST'] as const

const stageColors: Record<string, string> = {
  NEW: 'border-sky-200 bg-sky-50',
  QUALIFIED: 'border-blue-200 bg-blue-50',
  CONTACTED: 'border-purple-200 bg-purple-50',
  SHOWING_SCHEDULED: 'border-orange-200 bg-orange-50',
  NEGOTIATION: 'border-amber-200 bg-amber-50',
  CLOSED: 'border-green-200 bg-green-50',
  LOST: 'border-gray-200 bg-gray-50',
}

const stageDotColors: Record<string, string> = {
  NEW: 'bg-sky-400',
  QUALIFIED: 'bg-blue-500',
  CONTACTED: 'bg-purple-500',
  SHOWING_SCHEDULED: 'bg-orange-500',
  NEGOTIATION: 'bg-amber-500',
  CLOSED: 'bg-green-500',
  LOST: 'bg-gray-400',
}

async function getLeadsByStage(): Promise<any[]> {
  return safeQuery(
    (db) => db.from('leads')
      .select('*')
      .order('created_at', { ascending: false }),
    []
  )
}

export default async function PipelinePage() {
  const leads = await getLeadsByStage()

  const grouped = STAGES.reduce((acc, stage) => {
    acc[stage] = leads.filter((l) => l.pipeline_stage === stage)
    return acc
  }, {} as Record<string, typeof leads>)

  const active = leads.filter((l) => !['CLOSED', 'LOST'].includes(l.pipeline_stage))
  const totalValue = active.reduce((sum, l) => sum + (l.deal_value ?? l.budget_max ?? 0), 0)
  const weightedForecast = active.reduce((sum, l) => sum + weightedDealValue(l) * ((l.commission_rate ?? 3) / 100), 0)

  // Per-stage value totals
  const stageValue = (stage: string) =>
    (grouped[stage] ?? []).reduce((s, l) => s + (l.deal_value ?? l.budget_max ?? 0), 0)

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy-900">Pipeline</h1>
          <p className="text-gray-500 text-sm mt-0.5">{active.length} active deals</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-2">
            <p className="text-xs text-gray-400">Pipeline Value</p>
            <p className="font-serif text-lg font-bold text-navy-900">{formatCurrency(Math.round(totalValue))}</p>
          </div>
          <div className="bg-navy-900 rounded-xl px-4 py-2">
            <p className="text-xs text-navy-300">Forecast Commission</p>
            <p className="font-serif text-lg font-bold text-sky-400">{formatCurrency(Math.round(weightedForecast))}</p>
          </div>
        </div>
      </div>

      <TipBanner id="pipeline">
        💡 Open a lead and use the <strong>stage picker</strong> to move it forward. When you mark a deal <strong>Closed</strong>, you&apos;ll get a celebration 🎉 and it counts toward your monthly goal &amp; commission.
      </TipBanner>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageleads = grouped[stage] ?? []
          return (
            <div key={stage} className="w-72 shrink-0">
              <div className={`rounded-xl border px-4 py-3 mb-3 ${stageColors[stage]}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${stageDotColors[stage]}`} />
                    <span className="text-xs font-bold text-navy-900 uppercase tracking-wide">
                      {getPipelineStageLabel(stage)}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-500 bg-white/60 rounded-full px-2 py-0.5">
                    {stageleads.length}
                  </span>
                </div>
                {stageValue(stage) > 0 && (
                  <p className="text-xs font-semibold text-navy-700 mt-1.5">{formatCurrency(Math.round(stageValue(stage)))}</p>
                )}
              </div>

              <div className="space-y-2">
                {stageleads.length === 0 && (
                  <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-5 text-center">
                    <p className="text-gray-300 text-xs">Empty</p>
                  </div>
                )}
                {stageleads.map((lead) => (
                  <div key={lead.id} className="relative bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-card hover:border-sky-200 transition-all">
                    <Link href={`/admin/leads/${lead.id}`} className="block p-4 pr-10">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-navy-50 flex items-center justify-center shrink-0">
                          <UserCircle size={16} className="text-navy-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="font-semibold text-navy-900 text-xs truncate">{lead.full_name}</p>
                            {lead.hot_score === 3 && <Flame size={10} className="text-red-500 shrink-0" />}
                          </div>
                          <p className="text-gray-400 text-xs">{lead.client_type}</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-xs text-gray-500">
                        {lead.preferred_area && <p className="truncate">{lead.preferred_area}</p>}
                        {(lead.deal_value ?? lead.budget_max) && (
                          <p className="font-semibold text-navy-700">
                            {formatCurrency(lead.deal_value ?? lead.budget_max)}
                            {lead.commission_rate && (
                              <span className="text-sky-500 font-medium"> · {formatCurrency(commissionFor(lead.deal_value ?? lead.budget_max, lead.commission_rate))} comm</span>
                            )}
                          </p>
                        )}
                      </div>
                      <p className="text-gray-300 text-xs mt-3 pt-2.5 border-t border-gray-50">
                        {formatRelativeTime(lead.created_at)}
                      </p>
                    </Link>
                    <a
                      href={`tel:${lead.phone}`}
                      aria-label={`Call ${lead.full_name}`}
                      className="absolute top-4 right-3 text-sky-400 hover:text-sky-600 p-1"
                    >
                      <Phone size={13} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
