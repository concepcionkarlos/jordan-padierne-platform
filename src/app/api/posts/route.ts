import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase'
import { slugify } from '@/lib/posts'

export async function GET(req: NextRequest) {
  try {
    const supabase = createServiceClient()
    const all = new URL(req.url).searchParams.get('all') === '1' // admin: include unpublished
    let query = supabase.from('posts').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false })
    if (!all) query = query.eq('published', true)
    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServiceClient()
    const body = await req.json()
    if (!body.title_en || !body.body_en) {
      return NextResponse.json({ success: false, error: 'Title and body (EN) are required' }, { status: 400 })
    }
    const slug = (body.slug && slugify(body.slug)) || slugify(body.title_en)

    const { data, error } = await supabase.from('posts').insert({
      slug,
      category: body.category || 'Market',
      cover_image: body.cover_image || null,
      read_minutes: body.read_minutes ? Number(body.read_minutes) : 3,
      published: body.published ?? true,
      featured: body.featured ?? false,
      sort_order: body.sort_order ? Number(body.sort_order) : 0,
      title_en: body.title_en,
      title_es: body.title_es || null,
      excerpt_en: body.excerpt_en || null,
      excerpt_es: body.excerpt_es || null,
      body_en: body.body_en,
      body_es: body.body_es || null,
    }).select().single()
    if (error) throw error

    revalidatePath('/insights')
    revalidatePath(`/insights/${slug}`)
    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { id, ...updates } = await req.json()
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    if (updates.slug) updates.slug = slugify(updates.slug)
    if (updates.read_minutes) updates.read_minutes = Number(updates.read_minutes)

    const { data, error } = await supabase.from('posts').update(updates).eq('id', id).select().single()
    if (error) throw error

    revalidatePath('/insights')
    if (data?.slug) revalidatePath(`/insights/${data.slug}`)
    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createServiceClient()
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/insights')
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
