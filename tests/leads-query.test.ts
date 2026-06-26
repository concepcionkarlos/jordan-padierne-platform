import { describe, it, expect } from 'vitest'
import { applyLeadsQuery } from '@/lib/leads-query'
import { scoreLead } from '@/lib/leads'

// Protects: the Leads list — server-side filter / search / sort / pagination /
// whole-book stats. (Pure core; the DB load is the only untested wrapper.)
const now = Date.now()
const mk = (i: number) => ({
  id: 'id' + i, full_name: `Lead ${i}`, email: `lead${i}@mail.com`, phone: `30500000${String(i).padStart(2, '0')}`,
  preferred_area: i % 2 ? 'Brickell' : 'Doral', client_type: i % 3 === 0 ? 'Investor' : 'Buyer',
  pipeline_stage: i === 7 ? 'CLOSED' : i === 8 ? 'LOST' : 'NEW', status: i === 7 ? 'closed' : i === 8 ? 'lost' : 'new',
  hot_score: i % 10 === 0 ? 3 : 1, tags: i === 5 ? ['cash_buyer'] : [],
  budget_max: 100_000 + i * 30_000, created_at: new Date(now - i * 86400000).toISOString(),
  last_contact: new Date(now - i * 86400000).toISOString(), deal_value: null, noteCount: 0, apptCount: 0,
})
const leads = Array.from({ length: 60 }, (_, i) => mk(i + 1))

describe('applyLeadsQuery', () => {
  it('paginates without overlap and reports the true total', () => {
    const p1 = applyLeadsQuery(leads, { page: 1, pageSize: 25, sort: 'recent' })
    const p2 = applyLeadsQuery(leads, { page: 2, pageSize: 25, sort: 'recent' })
    const p3 = applyLeadsQuery(leads, { page: 3, pageSize: 25, sort: 'recent' })
    expect(p1.total).toBe(60)
    expect(p1.data.length).toBe(25)
    expect(p3.data.length).toBe(10)
    expect(p1.data.some((a) => p2.data.find((b) => b.id === a.id))).toBe(false)
  })

  it('clamps pageSize (5..100) and page (>=1)', () => {
    expect(applyLeadsQuery(leads, { pageSize: 1 }).pageSize).toBe(5)
    expect(applyLeadsQuery(leads, { pageSize: 9999 }).pageSize).toBe(100)
    expect(applyLeadsQuery(leads, { page: 0 }).page).toBe(1)
  })

  it('searches by name / email / area, server-side', () => {
    expect(applyLeadsQuery(leads, { search: 'lead42@mail', pageSize: 100 }).total).toBe(1)
    expect(applyLeadsQuery(leads, { search: 'doral', pageSize: 100 }).total).toBe(leads.filter((l) => l.preferred_area === 'Doral').length)
    expect(applyLeadsQuery(leads, { search: 'zzz-none', pageSize: 100 }).total).toBe(0)
  })

  it('filters by stage and type', () => {
    expect(applyLeadsQuery(leads, { stage: 'CLOSED', pageSize: 100 }).total).toBe(1)
    expect(applyLeadsQuery(leads, { type: 'Investor', pageSize: 100 }).total).toBe(leads.filter((l) => l.client_type === 'Investor').length)
  })

  it('the "hot" tag unifies tag + hot_score===3', () => {
    const hot = applyLeadsQuery(leads, { tag: 'hot', pageSize: 100 })
    const expected = leads.filter((l) => (l.tags ?? []).includes('hot') || l.hot_score === 3).length
    expect(hot.total).toBe(expected)
    expect(expected).toBeGreaterThan(0)
  })

  it('score sort is descending by real scoreLead', () => {
    const r = applyLeadsQuery(leads, { sort: 'score', pageSize: 100 })
    for (let i = 1; i < r.data.length; i++) {
      expect(scoreLead(r.data[i - 1]).score).toBeGreaterThanOrEqual(scoreLead(r.data[i]).score)
    }
  })

  it('recent sort is newest-first regardless of input order', () => {
    const shuffled = [...leads].reverse()
    const r = applyLeadsQuery(shuffled, { sort: 'recent', pageSize: 100 })
    expect(new Date(r.data[0].created_at).getTime()).toBeGreaterThanOrEqual(new Date(r.data[1].created_at).getTime())
  })

  it('stats reflect the WHOLE book, not the filtered view', () => {
    const filtered = applyLeadsQuery(leads, { stage: 'CLOSED' })
    expect(filtered.stats.total).toBe(60)
    expect(filtered.stats.active).toBe(58) // excludes CLOSED + LOST
    expect(filtered.stats.hot).toBe(leads.filter((l) => l.hot_score === 3).length)
  })
})
