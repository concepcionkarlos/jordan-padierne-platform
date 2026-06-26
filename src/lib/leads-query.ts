// Server-side leads query: filtering, search, scoring, sorting, and pagination
// all happen here so the client receives only one page of results (not the whole
// book) and never re-scores on every keystroke. Reuses the exact same
// scoreLead / getLeadFreshness logic the workspace uses, so scores never diverge.

import { safeQuery } from '@/lib/db'
import { getLeadFreshness, scoreLead } from '@/lib/leads'

export type LeadSort = 'score' | 'recent' | 'stale'

export interface LeadsQueryOpts {
  search?: string
  stage?: string // 'ALL' or a pipeline stage
  type?: string // 'All Types' or a client_type
  tag?: string | null
  sort?: LeadSort
  page?: number // 1-based
  pageSize?: number
}

export interface LeadsPage {
  data: any[]
  total: number // count after filtering/search
  page: number
  pageSize: number
  stats: { total: number; hot: number; needsAttention: number; active: number }
}

export async function getLeadsPage(opts: LeadsQueryOpts = {}): Promise<LeadsPage> {
  const page = Math.max(1, Math.floor(opts.page ?? 1))
  const pageSize = Math.min(100, Math.max(5, Math.floor(opts.pageSize ?? 25)))
  const sort: LeadSort = opts.sort ?? 'score'

  // Heavy work stays on the server; only one page is ever serialized to the client.
  const [rawLeads, notes, appts] = await Promise.all([
    safeQuery((db) => db.from('leads').select('*').order('created_at', { ascending: false }).limit(2000), []),
    safeQuery((db) => db.from('notes').select('lead_id').limit(5000), []),
    safeQuery((db) => db.from('appointments').select('lead_id').limit(5000), []),
  ])

  const noteCounts: Record<string, number> = {}
  const apptCounts: Record<string, number> = {}
  for (const n of notes) if (n.lead_id) noteCounts[n.lead_id] = (noteCounts[n.lead_id] ?? 0) + 1
  for (const a of appts) if (a.lead_id) apptCounts[a.lead_id] = (apptCounts[a.lead_id] ?? 0) + 1
  const all = rawLeads.map((l: any) => ({ ...l, noteCount: noteCounts[l.id] ?? 0, apptCount: apptCounts[l.id] ?? 0 }))

  // Header stats reflect the WHOLE book (never the filtered view).
  const stats = {
    total: all.length,
    hot: all.filter((l: any) => l.hot_score === 3).length,
    needsAttention: all
      .filter((l: any) => { const f = getLeadFreshness(l); return f.level === 'stale' || f.level === 'cold' })
      .filter((l: any) => !['closed', 'lost'].includes(l.status)).length,
    active: all.filter((l: any) => !['CLOSED', 'LOST'].includes(l.pipeline_stage)).length,
  }

  // Filter + search.
  const q = (opts.search ?? '').trim().toLowerCase()
  const filtered = all.filter((l: any) => {
    if (opts.stage && opts.stage !== 'ALL' && l.pipeline_stage !== opts.stage) return false
    if (opts.type && opts.type !== 'All Types' && l.client_type !== opts.type) return false
    if (opts.tag && !(l.tags ?? []).includes(opts.tag)) return false
    if (q) {
      const hay = `${l.full_name ?? ''} ${l.email ?? ''} ${l.phone ?? ''} ${l.preferred_area ?? ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  // Sort (score computed once per lead, then ordered).
  let ordered = filtered
  if (sort === 'score' || sort === 'stale') {
    type Scored = { l: any; score: number; age: number }
    ordered = filtered
      .map((l: any): Scored => ({ l, score: scoreLead(l).score, age: getLeadFreshness(l).ageDays }))
      .sort((a: Scored, b: Scored) => (sort === 'score' ? b.score - a.score : b.age - a.age))
      .map((x: Scored) => x.l)
  } // 'recent' is already created_at desc from the query

  const total = ordered.length
  const start = (page - 1) * pageSize
  const data = ordered.slice(start, start + pageSize)

  return { data, total, page, pageSize, stats }
}
