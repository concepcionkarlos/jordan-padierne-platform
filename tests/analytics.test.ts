import { describe, it, expect } from 'vitest'
import { commissionFor, weightedDealValue, isThisMonth, isThisYear, STAGE_PROBABILITY } from '@/lib/goals'

// Protects: analytics calculations (earnings, forecast, YTD/month windows).
describe('commission math', () => {
  it('commissionFor rounds (deal * rate%)', () => {
    expect(commissionFor(890_000, 3)).toBe(26_700)
    expect(commissionFor(500_000, 2.5)).toBe(12_500)
    expect(commissionFor(0, 3)).toBe(0)
  })

  it('weightedDealValue uses close_probability when present', () => {
    expect(weightedDealValue({ deal_value: 600_000, pipeline_stage: 'NEGOTIATION', close_probability: 70 })).toBe(420_000)
  })

  it('weightedDealValue falls back to stage probability', () => {
    const v = weightedDealValue({ budget_max: 400_000, pipeline_stage: 'NEGOTIATION', close_probability: null })
    expect(v).toBe(400_000 * STAGE_PROBABILITY.NEGOTIATION)
  })

  it('CLOSED probability is 1, LOST is 0', () => {
    expect(STAGE_PROBABILITY.CLOSED).toBe(1)
    expect(STAGE_PROBABILITY.LOST).toBe(0)
  })
})

describe('date windows (YTD vs all-time)', () => {
  const now = new Date(2026, 5, 25) // fixed reference
  it('isThisYear true within the year, false otherwise', () => {
    expect(isThisYear('2026-01-02T00:00:00Z', now)).toBe(true)
    expect(isThisYear('2025-12-31T00:00:00Z', now)).toBe(false)
    expect(isThisYear(null, now)).toBe(false)
  })
  it('isThisMonth true within the month only', () => {
    expect(isThisMonth('2026-06-01T12:00:00Z', now)).toBe(true)
    expect(isThisMonth('2026-05-31T12:00:00Z', now)).toBe(false)
    expect(isThisMonth(undefined, now)).toBe(false)
  })
})
