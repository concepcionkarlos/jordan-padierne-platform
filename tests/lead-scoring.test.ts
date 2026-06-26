import { describe, it, expect } from 'vitest'
import { scoreLead, getLeadFreshness } from '@/lib/leads'

// Protects: lead scoring (Smart Score) + freshness — drive the Leads table,
// dashboard Coach ordering, and "needs attention".
const today = new Date().toISOString()
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString()

describe('scoreLead', () => {
  it('returns a 0–100 score with a breakdown', () => {
    const r = scoreLead({ pipeline_stage: 'NEW', created_at: today })
    expect(r.score).toBeGreaterThanOrEqual(0)
    expect(r.score).toBeLessThanOrEqual(100)
    expect(Array.isArray(r.breakdown)).toBe(true)
  })

  it('a strong cash buyer scores much higher than a cold low-budget lead', () => {
    const strong = scoreLead({
      deal_value: 1_200_000, pipeline_stage: 'NEGOTIATION', financing_status: 'cash',
      tags: ['cash_buyer'], timeline: 'ASAP (1-30 days)', created_at: today, last_contact: today,
      noteCount: 3, apptCount: 1,
    })
    const weak = scoreLead({
      budget_max: 150_000, pipeline_stage: 'NEW', created_at: daysAgo(60), last_contact: daysAgo(60),
      noteCount: 0, apptCount: 0,
    })
    expect(strong.score).toBeGreaterThan(weak.score)
    expect(strong.score).toBeGreaterThanOrEqual(70)
  })

  it('engagement (notes + appts) increases the score', () => {
    const base = { budget_max: 500_000, pipeline_stage: 'CONTACTED', created_at: today, last_contact: today }
    const noEngagement = scoreLead({ ...base, noteCount: 0, apptCount: 0 })
    const engaged = scoreLead({ ...base, noteCount: 3, apptCount: 1 })
    expect(engaged.score).toBeGreaterThan(noEngagement.score)
  })
})

describe('getLeadFreshness', () => {
  it('a lead contacted today is age 0 and not cold', () => {
    const f = getLeadFreshness({ created_at: today, last_contact: today, status: 'new' } as any)
    expect(f.ageDays).toBe(0)
    expect(f.level).not.toBe('cold')
  })

  it('a long-untouched active lead becomes stale or cold', () => {
    const f = getLeadFreshness({ created_at: daysAgo(90), last_contact: daysAgo(90), status: 'new' } as any)
    expect(['stale', 'cold']).toContain(f.level)
    expect(f.ageDays).toBeGreaterThanOrEqual(30)
  })
})
