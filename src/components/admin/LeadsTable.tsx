'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, UserCircle, Phone, Mail, Flame, X } from 'lucide-react'
import { formatRelativeTime, getPipelineStageColor, getPipelineStageLabel, formatPhone, formatCurrency } from '@/lib/utils'
import { getLeadFreshness, getHotScore, getTagDef, LEAD_TAGS, scoreLead } from '@/lib/leads'

interface Props {
  leads: any[]
}

const STAGE_FILTERS = ['ALL', 'NEW', 'QUALIFIED', 'CONTACTED', 'SHOWING_SCHEDULED', 'NEGOTIATION', 'CLOSED', 'LOST']
const CLIENT_FILTERS = ['All Types', 'Buyer', 'Investor', 'International Buyer', 'Luxury Buyer', 'Pre-Construction Buyer', 'Seller']

export default function LeadsTable({ leads }: Props) {
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('ALL')
  const [clientFilter, setClientFilter] = useState('All Types')
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'score' | 'recent' | 'stale'>('score')

  const filtered = useMemo(() => {
    let result = leads.filter((lead) => {
      if (stageFilter !== 'ALL' && lead.pipeline_stage !== stageFilter) return false
      if (clientFilter !== 'All Types' && lead.client_type !== clientFilter) return false
      if (tagFilter && !(lead.tags ?? []).includes(tagFilter)) return false
      if (search) {
        const q = search.toLowerCase()
        const hay = `${lead.full_name} ${lead.email} ${lead.phone} ${lead.preferred_area ?? ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })

    if (sortBy === 'score') {
      result = [...result].sort((a, b) => scoreLead(b).score - scoreLead(a).score)
    } else if (sortBy === 'stale') {
      result = [...result].sort((a, b) => getLeadFreshness(b).ageDays - getLeadFreshness(a).ageDays)
    }
    return result
  }, [leads, search, stageFilter, clientFilter, tagFilter, sortBy])

  const activeFilters = (stageFilter !== 'ALL' ? 1 : 0) + (clientFilter !== 'All Types' ? 1 : 0) + (tagFilter ? 1 : 0)

  return (
    <div>
      {/* Search + sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, or area…"
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(['score', 'recent', 'stale'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSortBy(s)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                sortBy === s ? 'bg-navy-900 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-navy-300'
              }`}
            >
              {s === 'score' ? '⚡ Smart Score' : s === 'recent' ? 'Most Recent' : '⏰ Needs Attention'}
            </button>
          ))}
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="text-xs font-semibold rounded-lg border border-gray-200 px-3 py-1.5 text-navy-700 bg-white" title="Filter by stage">
          {STAGE_FILTERS.map((s) => <option key={s} value={s}>{s === 'ALL' ? 'All Stages' : getPipelineStageLabel(s)}</option>)}
        </select>
        <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} className="text-xs font-semibold rounded-lg border border-gray-200 px-3 py-1.5 text-navy-700 bg-white" title="Filter by client type">
          {CLIENT_FILTERS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {LEAD_TAGS.slice(0, 6).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTagFilter(tagFilter === t.id ? null : t.id)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              tagFilter === t.id ? t.className : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
            }`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
        {activeFilters > 0 && (
          <button type="button" onClick={() => { setStageFilter('ALL'); setClientFilter('All Types'); setTagFilter(null) }} className="inline-flex items-center gap-1 text-xs text-wine font-semibold px-2 py-1.5">
            <X size={12} /> Clear
          </button>
        )}
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} of {leads.length}</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Lead</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Score</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Contact</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden lg:table-cell">Budget</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Stage</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">No leads match your filters.</td></tr>
              )}
              {filtered.map((lead) => {
                const fresh = getLeadFreshness(lead)
                const sc = scoreLead(lead)
                const tags: string[] = lead.tags ?? []
                return (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <Link href={`/admin/leads/${lead.id}`} className="flex items-center gap-3 group">
                        <div className="relative shrink-0">
                          <div className="w-9 h-9 rounded-full bg-navy-50 flex items-center justify-center">
                            <UserCircle size={18} className="text-navy-600" />
                          </div>
                          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${fresh.dotClassName}`} title={fresh.label} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-navy-900 group-hover:text-wine transition-colors text-sm truncate">{lead.full_name}</p>
                            {lead.hot_score === 3 && <Flame size={12} className="text-red-500 shrink-0" />}
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-gray-400 text-xs">{lead.preferred_area ?? lead.client_type}</p>
                            {tags.slice(0, 2).map((t) => {
                              const def = getTagDef(t)
                              return <span key={t} className="text-xs">{def.emoji}</span>
                            })}
                          </div>
                        </div>
                      </Link>
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`} className="md:hidden inline-flex items-center gap-1 text-sky-600 text-xs mt-1.5 ml-12 font-medium">
                          <Phone size={11} /> {formatPhone(lead.phone)}
                        </a>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${sc.score >= 75 ? '#FEE2E2' : sc.score >= 50 ? '#FEF3C7' : sc.score >= 30 ? '#E8F1F7' : '#F1F5F9'}`, color: `${sc.score >= 75 ? '#DC2626' : sc.score >= 50 ? '#D97706' : sc.score >= 30 ? '#46779A' : '#64748B'}` }}>
                          {sc.score}
                        </div>
                        <span className="text-xs">{sc.emoji}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="space-y-0.5">
                        <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-gray-500 hover:text-navy-900 text-xs"><Phone size={11} />{formatPhone(lead.phone)}</a>
                        <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-gray-500 hover:text-navy-900 text-xs truncate max-w-[180px]"><Mail size={11} />{lead.email}</a>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      {(lead.budget_min || lead.budget_max) ? (
                        <span className="text-xs text-navy-700 font-medium">
                          {lead.budget_min ? formatCurrency(lead.budget_min) : '—'}{lead.budget_max ? ` – ${formatCurrency(lead.budget_max)}` : '+'}
                        </span>
                      ) : <span className="text-xs text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge ${getPipelineStageColor(lead.pipeline_stage)}`}>{getPipelineStageLabel(lead.pipeline_stage)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`flex items-center gap-1.5 text-xs ${fresh.className}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${fresh.dotClassName}`} />
                        {fresh.ageDays === 0 ? 'Today' : formatRelativeTime(lead.last_contact ?? lead.created_at)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
