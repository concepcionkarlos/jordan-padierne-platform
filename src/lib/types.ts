// ─── Core Enums ─────────────────────────────────────────────────────────────

export type PipelineStage =
  | 'NEW'
  | 'QUALIFIED'
  | 'CONTACTED'
  | 'SHOWING_SCHEDULED'
  | 'NEGOTIATION'
  | 'CLOSED'
  | 'LOST'

export type ClientType =
  | 'Buyer'
  | 'Investor'
  | 'International Buyer'
  | 'Luxury Buyer'
  | 'Pre-Construction Buyer'
  | 'Seller'

export type LeadSource =
  | 'Website'
  | 'Referral'
  | 'Social Media'
  | 'Open House'
  | 'Zillow'
  | 'Realtor.com'
  | 'Direct'
  | 'Other'

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'active' | 'closed' | 'lost'

export type PropertyStatus = 'available' | 'pending' | 'sold' | 'off-market'

export type PropertyType = 'condo' | 'house' | 'townhouse' | 'land' | 'pre-construction'

export type TaskStatus = 'todo' | 'in_progress' | 'done'

export type TaskPriority = 'low' | 'medium' | 'high'

export type MessageType =
  | 'contact'
  | 'showing_request'
  | 'open_house'
  | 'buyer_qualification'
  | 'investor_inquiry'
  | 'pre_construction_interest'

// ─── Database Models ─────────────────────────────────────────────────────────

export interface Lead {
  id: string
  created_at: string
  updated_at: string
  full_name: string
  email: string
  phone: string
  client_type: ClientType
  source: LeadSource
  status: LeadStatus
  pipeline_stage: PipelineStage
  preferred_area: string | null
  budget_min: number | null
  budget_max: number | null
  timeline: string | null
  property_interest: string | null
  financing_status: string | null
  message: string | null
  notes: string | null
  assigned_to: string | null
  last_contact: string | null
  next_followup: string | null
}

export interface Contact {
  id: string
  created_at: string
  updated_at: string
  full_name: string
  email: string
  phone: string
  client_type: ClientType | null
  preferred_area: string | null
  budget_min: number | null
  budget_max: number | null
  notes: string | null
  lead_id: string | null
}

export interface Property {
  id: string
  created_at: string
  updated_at: string
  title: string
  description: string | null
  price: number
  bedrooms: number | null
  bathrooms: number | null
  sqft: number | null
  address: string
  city: string
  state: string
  zip: string
  status: PropertyStatus
  type: PropertyType
  is_pre_construction: boolean
  is_luxury: boolean
  images: string[]
  featured: boolean
  mls_number: string | null
  year_built: number | null
  hoa_fee: number | null
}

export interface Message {
  id: string
  created_at: string
  updated_at: string
  type: MessageType
  full_name: string
  email: string
  phone: string | null
  subject: string | null
  body: string
  status: 'unread' | 'read' | 'replied' | 'archived'
  lead_id: string | null
  metadata: Record<string, unknown> | null
}

export interface Note {
  id: string
  created_at: string
  content: string
  author: string
  lead_id: string | null
  contact_id: string | null
}

export interface Task {
  id: string
  created_at: string
  updated_at: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  lead_id: string | null
  contact_id: string | null
  assigned_to: string | null
  completed_at: string | null
}

export interface PipelineEntry {
  id: string
  created_at: string
  updated_at: string
  lead_id: string
  stage: PipelineStage
  notes: string | null
  expected_close: string | null
  deal_value: number | null
}

// ─── Form Submission Types ───────────────────────────────────────────────────

export interface ContactFormData {
  full_name: string
  email: string
  phone: string
  client_type: ClientType
  preferred_area: string
  budget: string
  timeline: string
  message: string
  source: LeadSource
}

export interface ShowingRequestData {
  full_name: string
  email: string
  phone: string
  property_address: string
  preferred_date: string
  preferred_time: string
  client_type: ClientType
  message: string
}

export interface BuyerQualificationData {
  full_name: string
  email: string
  phone: string
  preferred_area: string
  budget_min: number
  budget_max: number
  bedrooms: number
  timeline: string
  financing_status: string
  pre_approval: boolean
  message: string
  source: LeadSource
}

export interface InvestorFormData {
  full_name: string
  email: string
  phone: string
  investment_type: string
  preferred_area: string
  budget_min: number
  budget_max: number
  investment_goal: string
  timeline: string
  experience_level: string
  message: string
  source: LeadSource
}

export interface PreConstructionInterestData {
  full_name: string
  email: string
  phone: string
  preferred_project: string
  preferred_area: string
  budget: string
  unit_type: string
  timeline: string
  is_investor: boolean
  message: string
  source: LeadSource
}

export interface OpenHouseCheckInData {
  full_name: string
  email: string
  phone: string
  property_address: string
  is_working_with_agent: boolean
  agent_name: string
  client_type: ClientType
  timeline: string
  prequalified: boolean
  source: LeadSource
}

// ─── API Response Types ──────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export interface DashboardStats {
  totalLeads: number
  newLeads: number
  pendingFollowups: number
  recentMessages: number
  activeClients: number
  pipelineSummary: Record<PipelineStage, number>
}
