// Pure mapping from an inbound message to a new-lead draft. Kept here (not in the
// route) so the field mapping + fallbacks can be regression-tested directly.

export const MESSAGE_TYPE_TO_CLIENT: Record<string, string> = {
  investor_inquiry: 'Investor',
  pre_construction_interest: 'Pre-Construction Buyer',
  buyer_qualification: 'Buyer',
}

export interface MessageLike {
  full_name?: string | null
  email?: string | null
  phone?: string | null
  type?: string | null
  body?: string | null
}

export function buildLeadDraftFromMessage(msg: MessageLike) {
  return {
    full_name: msg.full_name || 'New lead',
    email: msg.email || 'no-email@placeholder.com',
    phone: msg.phone || '',
    client_type: MESSAGE_TYPE_TO_CLIENT[msg.type ?? ''] || 'Buyer',
    source: 'Message',
    status: 'new',
    pipeline_stage: 'NEW',
    message: msg.body || null,
  }
}
