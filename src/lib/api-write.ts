// Shared write-safety helpers for admin API routes. All admin routes are
// auth-gated (requireUser), but we still whitelist the columns a request may
// write so a malformed/oversized/unknown payload can never reach the DB
// (no mass-assignment of id/created_at/arbitrary columns).

// Keep only the allowed keys that are actually present in the body.
export function pickAllowed(body: Record<string, any> | null | undefined, keys: readonly string[]): Record<string, any> {
  const out: Record<string, any> = {}
  if (!body || typeof body !== 'object') return out
  for (const k of keys) if (k in body && body[k] !== undefined) out[k] = body[k]
  return out
}

// Real, writable columns per table (excludes id / created_at / updated_at).
export const LEAD_FIELDS = [
  'full_name', 'email', 'phone', 'client_type', 'source', 'status', 'pipeline_stage',
  'budget_min', 'budget_max', 'timeline', 'property_interest', 'financing_status',
  'message', 'notes', 'preferred_area', 'last_contact', 'next_followup', 'tags',
  'hot_score', 'deal_value', 'commission_rate', 'expected_close', 'close_probability',
  'closed_at', 'metadata', 'assigned_to',
] as const

export const PROPERTY_FIELDS = [
  'title', 'description', 'price', 'listing_type', 'bedrooms', 'bathrooms', 'sqft',
  'address', 'city', 'state', 'status', 'type', 'is_pre_construction', 'is_luxury',
  'featured', 'pool', 'waterfront', 'images', 'mls_number', 'hoa_fee', 'metadata',
] as const

export const APPOINTMENT_FIELDS = [
  'lead_id', 'title', 'type', 'starts_at', 'ends_at', 'location', 'notes', 'status',
] as const

export const TESTIMONIAL_FIELDS = [
  'client_name', 'client_role', 'location', 'rating', 'quote', 'featured', 'sort_order',
] as const

export const POST_FIELDS = [
  'slug', 'category', 'published', 'featured', 'sort_order', 'read_minutes', 'cover_image',
  'title_en', 'title_es', 'excerpt_en', 'excerpt_es', 'body_en', 'body_es',
] as const
