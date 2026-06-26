import { describe, it, expect } from 'vitest'
import { buildLeadDraftFromMessage, MESSAGE_TYPE_TO_CLIENT } from '@/lib/message-convert'

// Protects: message → lead conversion field mapping + fallbacks.
describe('buildLeadDraftFromMessage', () => {
  it('maps known message types to client types', () => {
    expect(buildLeadDraftFromMessage({ type: 'investor_inquiry' }).client_type).toBe('Investor')
    expect(buildLeadDraftFromMessage({ type: 'pre_construction_interest' }).client_type).toBe('Pre-Construction Buyer')
    expect(buildLeadDraftFromMessage({ type: 'buyer_qualification' }).client_type).toBe('Buyer')
    expect(MESSAGE_TYPE_TO_CLIENT.investor_inquiry).toBe('Investor')
  })

  it('defaults unknown/missing type to Buyer', () => {
    expect(buildLeadDraftFromMessage({ type: 'contact' }).client_type).toBe('Buyer')
    expect(buildLeadDraftFromMessage({}).client_type).toBe('Buyer')
  })

  it('always produces a NEW lead from the Message source with required fields', () => {
    const d = buildLeadDraftFromMessage({ full_name: 'Linda Park', email: 'linda@mail.com', phone: '305', body: 'hi', type: 'contact' })
    expect(d.status).toBe('new')
    expect(d.pipeline_stage).toBe('NEW')
    expect(d.source).toBe('Message')
    expect(d.full_name).toBe('Linda Park')
    expect(d.email).toBe('linda@mail.com')
    expect(d.message).toBe('hi')
  })

  it('fills safe fallbacks for missing name/email/phone (NOT NULL columns)', () => {
    const d = buildLeadDraftFromMessage({})
    expect(d.full_name).toBe('New lead')
    expect(d.email).toBe('no-email@placeholder.com')
    expect(d.phone).toBe('')
    expect(d.message).toBeNull()
  })
})
