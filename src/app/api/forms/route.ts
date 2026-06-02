import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { sendAdminNotification, sendClientAutoReply } from '@/lib/email'
import type { ClientType, LeadSource } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { form_type, ...formData } = body

    if (!form_type || !formData.full_name || !formData.email) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // 1. Save raw form submission
    await supabase.from('form_submissions').insert({
      form_type,
      data: body,
      ip_address: req.headers.get('x-forwarded-for') ?? 'unknown',
      user_agent: req.headers.get('user-agent') ?? 'unknown',
    })

    const clientTypeMap: Record<string, ClientType> = {
      contact: formData.client_type ?? 'Buyer',
      buyer_qualification: 'Buyer',
      investor_inquiry: 'Investor',
      pre_construction_interest: formData.is_investor ? 'Investor' : 'Pre-Construction Buyer',
      showing_request: formData.client_type ?? 'Buyer',
      open_house: formData.client_type ?? 'Buyer',
      home_valuation: 'Seller',
    }

    const messageTypeMap: Record<string, string> = {
      contact: 'contact',
      buyer_qualification: 'buyer_qualification',
      investor_inquiry: 'investor_inquiry',
      pre_construction_interest: 'pre_construction_interest',
      showing_request: 'showing_request',
      open_house: 'open_house',
      home_valuation: 'contact',
    }

    // 2. Create lead in Supabase
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
        metadata: body,
      })
      .select('id')
      .single()

    if (leadError) {
      console.error('[forms] Lead insert error:', leadError)
    }

    // 3. Create message in CRM
    const messageBody = buildMessageBody(form_type, formData)
    await supabase.from('messages').insert({
      type: messageTypeMap[form_type] ?? 'contact',
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone ?? null,
      subject: buildSubject(form_type, formData),
      body: messageBody,
      status: 'unread',
      lead_id: lead?.id ?? null,
      metadata: body,
    })

    // 4. Send emails (non-blocking — don't fail the response if email fails)
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

    // Fire both emails concurrently — await but don't throw on failure
    const [adminSent, clientSent] = await Promise.allSettled([
      sendAdminNotification(emailData),
      sendClientAutoReply(String(formData.email), String(formData.full_name), form_type),
    ])

    const emailStatus = {
      admin: adminSent.status === 'fulfilled' && adminSent.value,
      client: clientSent.status === 'fulfilled' && clientSent.value,
    }

    if (!emailStatus.admin) {
      console.warn('[forms] Admin notification not sent (email may not be configured)')
    }

    return NextResponse.json({
      success: true,
      lead_id: lead?.id,
      email: emailStatus,
    })
  } catch (err) {
    console.error('[forms] API error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

function buildSubject(formType: string, data: Record<string, unknown>): string {
  const subjectMap: Record<string, string> = {
    contact: `New Contact — ${data.full_name}`,
    buyer_qualification: `Buyer Form — ${data.full_name}`,
    investor_inquiry: `Investor Inquiry — ${data.full_name}`,
    pre_construction_interest: `Pre-Construction Interest — ${data.full_name}`,
    showing_request: `Showing Request — ${data.full_name}`,
    open_house: `Open House Check-In — ${data.full_name}`,
    home_valuation: `🏠 Home Valuation Request — ${data.full_name}`,
  }
  return subjectMap[formType] ?? `Form Submission — ${data.full_name}`
}

function buildMessageBody(formType: string, data: Record<string, unknown>): string {
  const lines: string[] = []

  const addLine = (label: string, value: unknown) => {
    if (value !== undefined && value !== null && value !== '') {
      lines.push(`${label}: ${value}`)
    }
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

  if (data.message) {
    lines.push('')
    lines.push(`Message: ${data.message}`)
  }

  return lines.join('\n')
}
