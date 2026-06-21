import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { requireUser } from '@/lib/auth'

// Bulk import leads from a parsed CSV (array of row objects already mapped client-side).
export async function POST(req: NextRequest) {
  const denied = await requireUser(); if (denied) return denied
  try {
    const supabase = createServiceClient()
    const { rows } = await req.json()

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ success: false, error: 'No rows provided' }, { status: 400 })
    }

    const cleaned = rows
      .filter((r: any) => (r.full_name && r.full_name.trim()) || (r.email && r.email.trim()) || (r.phone && r.phone.trim()))
      .map((r: any) => ({
        full_name: (r.full_name ?? '').trim() || 'Unknown',
        email: (r.email ?? '').trim() || 'no-email@placeholder.com',
        phone: (r.phone ?? '').trim() || '',
        client_type: r.client_type?.trim() || 'Buyer',
        source: r.source?.trim() || 'Import',
        status: 'new',
        pipeline_stage: 'NEW',
        preferred_area: r.preferred_area?.trim() || null,
        message: r.notes?.trim() || null,
      }))

    if (cleaned.length === 0) {
      return NextResponse.json({ success: false, error: 'No valid rows (need at least a name, email, or phone)' }, { status: 400 })
    }

    // Insert in chunks of 100
    let inserted = 0
    for (let i = 0; i < cleaned.length; i += 100) {
      const chunk = cleaned.slice(i, i + 100)
      const { error, count } = await supabase.from('leads').insert(chunk, { count: 'exact' })
      if (error) throw error
      inserted += count ?? chunk.length
    }

    return NextResponse.json({ success: true, inserted })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
