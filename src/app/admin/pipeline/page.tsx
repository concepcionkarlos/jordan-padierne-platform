export const dynamic = 'force-dynamic'
import { safeQuery } from '@/lib/db'
import { getPipelineStageLabel, formatCurrency, formatRelativeTime } from '@/lib/utils'
import { UserCircle, Phone } from 'lucide-react'
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
      .select('id, full_name, client_type, pipeline_stage, budget_min, budget_max, phone, preferred_area, created_at')
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

  const activeDealValue = leads
    .filter((l) => !['CLOSED', 'LOST'].includes(l.pipeline_stage) && l.budget_max)
    .reduce((sum, l) => sum + (l.budget_max ?? 0), 0)

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-navy-900">Pipeline</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {leads.filter((l) => !['CLOSED', 'LOST'].includes(l.pipeline_stage)).length} active deals
          {activeDealValue > 0 && (
            <> · <span className="font-semibold text-navy-700">{formatCurrency(activeDealValue)} potential value</span></>
          )}
        </p>
      </div>

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
              </div>

              <div className="space-y-2">
                {stageleads.length === 0 && (
                  <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-5 text-center">
                    <p className="text-gray-300 text-xs">Empty</p>
                  </div>
                )}
                {stageleads.map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/admin/leads/${lead.id}`}
                    className="block bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-card hover:border-sky-200 transition-all"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-navy-50 flex items-center justify-center shrink-0">
                        <UserCircle size={16} className="text-navy-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-navy-900 text-xs truncate">{lead.full_name}</p>
                        <p className="text-gray-400 text-xs">{lead.client_type}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-xs text-gray-500">
                      {lead.preferred_area && <p className="truncate">{lead.preferred_area}</p>}
                      {(lead.budget_min || lead.budget_max) && (
                        <p className="font-medium text-navy-700">
                          {lead.budget_min ? formatCurrency(lead.budget_min) : '—'} – {lead.budget_max ? formatCurrency(lead.budget_max) : 'Open'}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-50">
                      <span className="text-gray-300 text-xs">{formatRelativeTime(lead.created_at)}</span>
                      <a href={`tel:${lead.phone}`} onClick={(e) => e.stopPropagation()} aria-label={`Call ${lead.full_name}`} className="text-sky-500 hover:text-sky-600">
                        <Phone size={13} />
                      </a>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
