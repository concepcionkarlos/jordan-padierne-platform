import { describe, it, expect, beforeEach } from 'vitest'
import { aiEvaluateLead } from '@/lib/ai-evaluate'
import { evaluateLead } from '@/lib/evaluate'

// Protects: the AI evaluation FALLBACK contract. If no AI keys are configured
// (or the providers fail), aiEvaluateLead must return null so the caller falls
// back to the deterministic rule-based engine — never throw, never block qualify.
describe('AI evaluation fallback', () => {
  beforeEach(() => {
    // Force the "no provider configured" path — deterministic, no network.
    process.env.GEMINI_API_KEY = ''
    process.env.ANTHROPIC_API_KEY = ''
  })

  it('aiEvaluateLead returns null when no providers are configured', async () => {
    const result = await aiEvaluateLead({ full_name: 'Test Lead', client_type: 'Buyer', budget_max: 500_000 })
    expect(result).toBeNull()
  })

  it('rule-based evaluateLead always returns a valid Evaluation', () => {
    const ev = evaluateLead({
      full_name: 'María Restrepo', client_type: 'Buyer', budget_max: 900_000,
      timeline: 'ASAP (1-30 days)', financing_status: 'cash',
    })
    expect([1, 2, 3]).toContain(ev.hot_score)
    expect(['Hot', 'Warm', 'Cool']).toContain(ev.temperature)
    expect(Array.isArray(ev.tasks)).toBe(true)
    expect(ev.tasks.length).toBeGreaterThan(0)
    expect(typeof ev.summary).toBe('string')
    expect(ev.summary.length).toBeGreaterThan(0)
  })

  it('a strong profile is rated Hot by the rule-based engine', () => {
    const ev = evaluateLead({
      full_name: 'Cash Buyer', budget_max: 1_500_000, financing_status: 'cash',
      timeline: 'ASAP (1-30 days)', client_type: 'Luxury Buyer',
    })
    expect(ev.temperature).toBe('Hot')
    expect(ev.hot_score).toBe(3)
  })
})
