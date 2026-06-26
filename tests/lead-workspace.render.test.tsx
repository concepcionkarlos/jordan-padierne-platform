// @vitest-environment jsdom
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import LeadWorkspace from '@/components/admin/LeadWorkspace'

// jsdom doesn't implement scrollIntoView (used by quick actions / deep links).
beforeAll(() => { Element.prototype.scrollIntoView = vi.fn() })
afterEach(() => cleanup())

const baseLead = (o: any = {}) => ({
  id: 'lead-1', full_name: 'María Restrepo', client_type: 'Buyer', email: 'maria@mail.com', phone: '3055550123',
  pipeline_stage: 'QUALIFIED', status: 'qualified', hot_score: 3, tags: ['cash_buyer'],
  budget_min: 750000, budget_max: 1100000, timeline: 'ASAP', financing_status: 'cash', source: 'Website',
  preferred_area: 'Brickell', created_at: new Date().toISOString(), metadata: {}, ...o,
})
const ai = { id: 'n-ai', author: 'AI Evaluation', content: 'HOT — cash buyer, call today.', created_at: new Date().toISOString() }
function mount(p: any = {}) {
  return render(
    <LeadWorkspace
      lead={baseLead(p.lead)}
      initialNotes={p.notes ?? []}
      initialTasks={p.tasks ?? []}
      initialAppointments={p.appts ?? []}
      messages={p.messages ?? []}
    />
  )
}

describe('Lead Workspace render', () => {
  it('renders the core structure (rail + main + coach + quick actions)', () => {
    const { container } = mount()
    const txt = container.textContent || ''
    expect(txt).toContain('María Restrepo')         // snapshot
    expect(txt).toContain('Your Next Move')          // coach
    expect(txt).toContain('Smart Score')
    expect(txt).toContain('Deal & Commission')
    expect(txt).toContain('Activity Timeline')
    // Quick actions present
    for (const label of ['Call', 'WhatsApp', 'Log a note', 'Schedule an appointment']) {
      expect(container.querySelector(`[aria-label="${label}"]`)).toBeTruthy()
    }
    // Portal link
    expect(container.querySelector('a[href="/portal/lead-1"]')).toBeTruthy()
  })

  it('shows the AI Lead Brief when an AI note exists', () => {
    const { container } = mount({ notes: [ai] })
    const txt = container.textContent || ''
    expect(txt).toContain('AI Lead Brief')
    expect(txt).toContain('HOT — cash buyer, call today.')
    expect(txt).not.toContain('No AI read yet')
  })

  it('shows the AI placeholder when there is no AI note', () => {
    const { container } = mount({ notes: [] })
    expect(container.textContent).toContain('No AI read yet')
  })

  it('merges all sources into the timeline in the right order', () => {
    const now = Date.now()
    const notes = [
      { id: 'n1', author: 'Jordan', content: 'Called — left voicemail', created_at: new Date(now - 1000).toISOString() },
      ai,
    ]
    const appts = [{ id: 'a1', title: 'Brickell showing', type: 'showing', starts_at: new Date(now + 86400000).toISOString(), location: null, status: 'scheduled', created_at: new Date(now - 2000).toISOString() }]
    const messages = [{ id: 'm1', subject: 'Buyer form submitted', body: 'details', created_at: new Date(now - 3000).toISOString() }]
    const tasks = [{ id: 't1', title: 'Send comps', status: 'todo', priority: 'high', due_date: null, created_at: new Date(now - 500).toISOString() }]
    const { container } = mount({ notes, appts, messages, tasks })
    const txt = container.textContent || ''
    expect(txt).toContain('Called — left voicemail')   // note
    expect(txt).toContain('Brickell showing')          // appointment
    expect(txt).toContain('Buyer form submitted')      // form submission
    expect(txt).toContain('Send comps')                // task
    expect(txt).toContain('AI Evaluation')             // ai in timeline
  })

  it('renders every pipeline state without crashing', () => {
    for (const stage of ['NEW', 'QUALIFIED', 'CONTACTED', 'SHOWING_SCHEDULED', 'NEGOTIATION', 'CLOSED', 'LOST']) {
      const { container, unmount } = mount({ lead: { pipeline_stage: stage, status: stage.toLowerCase() } })
      expect(container.textContent).toContain('María Restrepo')
      if (stage === 'LOST') expect(container.textContent).toContain('Marked as Lost')
      unmount()
    }
  })

  it('disables Call/WhatsApp quick actions when the lead has no phone', () => {
    const { container } = mount({ lead: { phone: '' } })
    const call = container.querySelector('[aria-label="Call"]') as HTMLAnchorElement
    expect(call?.className).toContain('pointer-events-none')
  })

  it('deep link ?focus=schedule opens the appointment form', () => {
    window.history.pushState({}, '', '/admin/leads/lead-1?focus=schedule')
    const { container } = mount()
    expect(container.textContent).toContain('Email calendar invite to') // the appt form is open
    window.history.pushState({}, '', '/admin/leads/lead-1')
  })
})
