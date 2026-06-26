import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { getLeadsPage, type LeadSort } from '@/lib/leads-query'

// Server-side, paginated, scored leads list. The admin Leads table calls this
// (debounced) so the browser only ever holds one page.
export async function GET(req: NextRequest) {
  const denied = await requireUser(); if (denied) return denied
  try {
    const { searchParams } = new URL(req.url)
    const sortParam = searchParams.get('sort')
    const sort: LeadSort = sortParam === 'recent' || sortParam === 'stale' ? sortParam : 'score'
    const result = await getLeadsPage({
      search: searchParams.get('search') ?? '',
      stage: searchParams.get('stage') ?? 'ALL',
      type: searchParams.get('type') ?? 'All Types',
      tag: searchParams.get('tag') || null,
      sort,
      page: parseInt(searchParams.get('page') ?? '1', 10),
      pageSize: parseInt(searchParams.get('pageSize') ?? '25', 10),
    })
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    console.error('[leads/search] GET', err)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}
