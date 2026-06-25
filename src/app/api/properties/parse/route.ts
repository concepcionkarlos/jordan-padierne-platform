import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { aiParseProperty } from '@/lib/ai-parse-property'

// Admin-only: paste raw listing text → structured fields for the Add Property form.
export async function POST(req: NextRequest) {
  const denied = await requireUser(); if (denied) return denied
  try {
    const { text } = await req.json()
    if (typeof text !== 'string' || text.trim().length < 8) {
      return NextResponse.json({ success: false, error: 'Paste a bit more listing text to read.' }, { status: 400 })
    }
    const parsed = await aiParseProperty(text)
    if (!parsed) {
      return NextResponse.json({ success: false, error: 'AI is not configured or could not read that. Fill the form manually.' }, { status: 422 })
    }
    return NextResponse.json({ success: true, parsed })
  } catch (err) {
    console.error('[properties/parse] error', err)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}
