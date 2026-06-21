import crypto from 'crypto'
import { createServiceClient } from '@/lib/supabase'
import { sendAdminNotification, sendClientAutoReply } from '@/lib/email'
import { sendPushToAll } from '@/lib/push'
import { isValidEmail, isPlaceholderEmail } from '@/lib/antispam'
import type { ClientType, LeadSource } from '@/lib/types'

// ─── Pending (double opt-in) ─────────────────────────────────────────────────
const EXPIRES_DAYS = 3

export async function createPending(kind: 'form' | 'subscribe', email: string, payload: Record<string, unknown>): Promise<string | null> {
  try {
    const supabase = createServiceClient()
    const token = crypto.randomBytes(24).toString('base64url')
    const expires = new Date(Date.now() + EXPIRES_DAYS * 86400000).toISOString()
    const { error } = await supabase.from('pending_leads').insert({ token, kind, email, payload, expires_at: expires })
    if (error) { console.error('[intake] createPending', error); return null }
    return token
  } catch (err) {
    console.error('[intake] createPending', err)
    return null
  }
}

// Consume a token once: returns the pending record if valid & unexpired, then deletes it.
export async function consumePending(token: string): Promise<{ kind: string; email: string; payload: Record<string, unknown> } | null> {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase.from('pending_leads').select('*').eq('token', token).single()
    if (!data) return null
    await supabase.from('pending_leads').delete().eq('token', token)
    if (new Date(data.expires_at).getTime() < Date.now()) return null
    return { kind: data.kind, email: data.email, payload: data.payload as Record<string, unknown> }
  } catch {
    return null
  }
}

// ─── Finalize a verified form submission → create the CRM lead + notify ───────
export async function finalizeFormLead(body: Record<string, any>, meta?: { ip?: string; ua?: string }): Promise<{ leadId?: string }> {
  const { form_type, ...formData } = body
  const supabase = createServiceClient()

  // Never persist SSN.
  delete (body as Record<string, unknown>).ssn_last4
  delete (formData as Record<string, unknown>).ssn_last4

  await supabase.from('form_submissions').insert({
    form_type,
    data: body,
    ip_address: meta?.ip ?? 'verified',
    user_agent: meta?.ua ?? 'verified',
  })

  const clientTypeMap: Record<string, ClientType> = {
    contact: formData.client_type ?? 'Buyer',
    buyer_qualification: 'Buyer',
    investor_inquiry: 'Investor',
    pre_construction_interest: formData.is_investor ? 'Investor' : 'Pre-Construction Buyer',
    showing_request: formData.client_type ?? 'Buyer',
    open_house: formData.client_type ?? 'Buyer',
    home_valuation: 'Seller',
    rental_application: 'Buyer',
  }
  const messageTypeMap: Record<string, string> = {
    contact: 'contact', buyer_qualification: 'buyer_qualification', investor_inquiry: 'investor_inquiry',
    pre_construction_interest: 'pre_construction_interest', showing_request: 'showing_request',
    open_house: 'open_house', home_valuation: 'contact', rental_application: 'contact',
  }

  const isWarm = formData.source === 'Website Popup' || form_type === 'home_valuation' || form_type === 'rental_application'

  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .insert({
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone ?? '',
      client_type: clientTypeMap[form_type] ?? 'Buyer',
      source: (formData.source as LeadSource) ?? 'Website',
      status: 'new',
      pipeline_stage: 'NEW',
      preferred_area: formData.preferred_area ?? null,
      budget_min: formData.budget_min ? Number(formData.budget_min) : null,
      budget_max: formData.budget_max ? Number(formData.budget_max) : null,
      timeline: formData.timeline ?? null,
      property_interest: formData.preferred_project ?? formData.property_address ?? null,
      financing_status: formData.financing_status ?? null,
      message: formData.message ?? null,
      hot_score: isWarm ? 2 : 1,
      tags: isWarm ? ['hot'] : [],
      metadata: { ...body, email_verified: true },
    })
    .select('id')
    .single()

  if (leadError) console.error('[intake] lead insert', leadError)

  await supabase.from('messages').insert({
    type: messageTypeMap[form_type] ?? 'contact',
    full_name: formData.full_name,
    email: formData.email,
    phone: formData.phone ?? null,
    subject: buildSubject(form_type, formData),
    body: buildMessageBody(form_type, formData),
    status: 'unread',
    lead_id: lead?.id ?? null,
    metadata: body,
  })

  const emailData = {
    full_name: String(formData.full_name),
    email: String(formData.email),
    phone: formData.phone ? String(formData.phone) : undefined,
    client_type: formData.client_type ? String(formData.client_type) : clientTypeMap[form_type],
    preferred_area: formData.preferred_area ? String(formData.preferred_area) : undefined,
    budget: formData.budget
      ? String(formData.budget)
      : formData.budget_min
        ? `$${Number(formData.budget_min).toLocaleString()} – $${Number(formData.budget_max).toLocaleString()}`
        : undefined,
    timeline: formData.timeline ? String(formData.timeline) : undefined,
    financing_status: formData.financing_status ? String(formData.financing_status) : undefined,
    source: formData.source ? String(formData.source) : 'Website',
    message: formData.message ? String(formData.message) : undefined,
    form_type,
    lead_id: lead?.id,
  }

  sendPushToAll({
    title: `${isWarm ? '🔥' : '🏠'} New lead: ${formData.full_name}`,
    body: `${clientTypeMap[form_type] ?? 'Buyer'}${formData.phone ? ` · ${formData.phone}` : ''}${formData.preferred_area ? ` · ${formData.preferred_area}` : ''} — tap to call now`,
    url: lead?.id ? `/admin/leads/${lead.id}` : '/admin/leads',
    tag: `lead-${lead?.id ?? 'new'}`,
  }).catch(() => {})

  const canAutoReply = isValidEmail(formData.email) && !isPlaceholderEmail(formData.email)
  await Promise.allSettled([
    sendAdminNotification(emailData),
    canAutoReply ? sendClientAutoReply(String(formData.email), String(formData.full_name), form_type, lead?.id) : Promise.resolve(false),
  ])

  return { leadId: lead?.id }
}

// ─── Finalize a verified newsletter / guide signup ───────────────────────────
export async function finalizeSubscribe(body: Record<string, any>): Promise<{ leadId?: string }> {
  const { type, email, full_name, source_article } = body
  const supabase = createServiceClient()
  const isGuide = type === 'guide'
  const source = isGuide ? 'Guide Download' : 'Newsletter'
  const name = (full_name && String(full_name).trim()) || String(email).split('@')[0]

  const { data: existing } = await supabase.from('leads').select('id').eq('email', email).eq('source', source).limit(1)
  if (existing && existing.length) return { leadId: existing[0].id }

  const { data: lead } = await supabase
    .from('leads')
    .insert({
      full_name: name, email, phone: '', client_type: 'Buyer', source,
      status: 'new', pipeline_stage: 'NEW', hot_score: isGuide ? 2 : 1,
      tags: isGuide ? ['hot', 'newsletter'] : ['newsletter'],
      metadata: { type: source, source_article: source_article ?? null, email_verified: true },
    })
    .select('id')
    .single()

  await supabase.from('messages').insert({
    type: 'contact', full_name: name, email,
    subject: isGuide ? `📘 Guide download — ${name}` : `📩 Newsletter signup — ${email}`,
    body: isGuide ? `Requested the guide${source_article ? ` from: ${source_article}` : ''}.` : `Subscribed to the newsletter${source_article ? ` from: ${source_article}` : ''}.`,
    status: 'unread', lead_id: lead?.id ?? null,
  })

  if (isGuide) {
    sendPushToAll({
      title: `📘 Guide download: ${name}`,
      body: `${email} — wants the guide. Tap to follow up.`,
      url: lead?.id ? `/admin/leads/${lead.id}` : '/admin/leads',
      tag: `guide-${lead?.id ?? 'new'}`,
    }).catch(() => {})
  }

  return { leadId: lead?.id }
}

// ─── CRM message helpers (moved from the forms route) ─────────────────────────
export function buildSubject(formType: string, data: Record<string, unknown>): string {
  const subjectMap: Record<string, string> = {
    contact: `New Contact — ${data.full_name}`,
    buyer_qualification: `Buyer Form — ${data.full_name}`,
    investor_inquiry: `Investor Inquiry — ${data.full_name}`,
    pre_construction_interest: `Pre-Construction Interest — ${data.full_name}`,
    showing_request: `Showing Request — ${data.full_name}`,
    open_house: `Open House Check-In — ${data.full_name}`,
    home_valuation: `🏠 Home Valuation Request — ${data.full_name}`,
    rental_application: `🏘️ Rental Application — ${data.full_name}`,
  }
  return subjectMap[formType] ?? `Form Submission — ${data.full_name}`
}

export function buildMessageBody(formType: string, data: Record<string, unknown>): string {
  const lines: string[] = []
  const addLine = (label: string, value: unknown) => {
    if (value !== undefined && value !== null && value !== '') lines.push(`${label}: ${value}`)
  }

  addLine('Name', data.full_name)
  addLine('Email', data.email)
  addLine('Phone', data.phone)
  addLine('Client Type', data.client_type)
  addLine('Preferred Area', data.preferred_area)
  addLine('Budget', data.budget ?? (data.budget_min ? `$${data.budget_min} – $${data.budget_max}` : null))
  addLine('Timeline', data.timeline)
  addLine('Financing', data.financing_status)
  addLine('Source', data.source)

  if (formType === 'investor_inquiry') {
    addLine('Investment Type', data.investment_type)
    addLine('Investment Goal', data.investment_goal)
    addLine('Experience', data.experience_level)
  }
  if (formType === 'pre_construction_interest') {
    addLine('Project Interest', data.preferred_project)
    addLine('Unit Type', data.unit_type)
    addLine('Is Investor', data.is_investor ? 'Yes' : 'No')
  }
  if (formType === 'showing_request') {
    addLine('Property', data.property_address)
    addLine('Preferred Date', data.preferred_date)
    addLine('Preferred Time', data.preferred_time)
  }
  if (formType === 'open_house') {
    addLine('Property', data.property_address)
    addLine('Working with Agent', data.is_working_with_agent ? 'Yes' : 'No')
    if (data.is_working_with_agent) addLine('Agent Name', data.agent_name)
    addLine('Pre-Qualified', data.prequalified ? 'Yes' : 'No')
  }
  if (formType === 'home_valuation') {
    addLine('Property Address', data.property_address)
    addLine('City/Area', data.city)
    addLine('Property Type', data.property_type)
    addLine('Bedrooms', data.bedrooms)
    addLine('Bathrooms', data.bathrooms)
    addLine('Sq Ft', data.sqft)
    addLine('Condition', data.condition)
    addLine('Selling Timeline', data.timeline)
  }
  if (formType === 'rental_application') {
    lines.push('', '── APPLICANT ──')
    addLine('Date of Birth', data.date_of_birth)
    addLine('Applying for', data.property_address)
    addLine('Desired Move-in', data.desired_move_in)
    addLine('Occupants', data.occupants)
    addLine('Pets', data.pets)
    const curAddr = [data.current_address, data.current_city, data.current_state, data.current_zip].filter(Boolean).join(', ')
    addLine('Current Address', curAddr)
    addLine('Housing Status', data.housing_status)
    addLine('Monthly Payment', data.monthly_payment)
    addLine('Time at Address', data.residence_length)
    lines.push('', '── EMPLOYMENT ──')
    addLine('Employer', data.employer)
    addLine('Position', data.position)
    addLine('Pay Type', data.employment_type)
    addLine('Annual Income', data.annual_income ? `$${data.annual_income}` : null)
    addLine('Employer Phone', data.employer_phone)
    addLine('Time Employed', data.employment_length)
    addLine('Employer Address', data.employer_address)
    if (data.has_coapplicant) {
      lines.push('', '── CO-APPLICANT ──')
      addLine('Name', data.co_full_name)
      addLine('Date of Birth', data.co_dob)
      addLine('Phone', data.co_phone)
      addLine('Email', data.co_email)
      addLine('Employer', data.co_employer)
      addLine('Annual Income', data.co_income ? `$${data.co_income}` : null)
    }
    lines.push('', '── EMERGENCY CONTACT ──')
    addLine('Name', data.emergency_name)
    addLine('Phone', data.emergency_phone)
    addLine('Relationship', data.emergency_relationship)
    lines.push('', '── REFERENCE ──')
    addLine('Name', data.reference_name)
    addLine('Phone', data.reference_phone)
    addLine('Authorized check', data.authorize ? 'Yes' : 'No')
  }

  if (data.message) {
    lines.push('')
    lines.push(`Message: ${data.message}`)
  }
  return lines.join('\n')
}
