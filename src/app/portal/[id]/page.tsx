export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import { safeQuery } from '@/lib/db'
import { getProfile } from '@/lib/profile'
import { formatCurrency } from '@/lib/utils'
import ExpLogo from '@/components/ui/ExpLogo'
import { Phone, Mail, MapPin, Calendar, Home, CheckCircle2, Video } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Your Home Search · Jordan Padierne',
  robots: { index: false, follow: false },
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function fmtWhen(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  }) + ' ET'
}

export default async function PortalPage({ params }: { params: { id: string } }) {
  const profile = await getProfile()
  const lead = UUID_RE.test(params.id)
    ? await safeQuery((db) => db.from('leads')
        .select('id, full_name, email, phone, preferred_area, budget_min, budget_max, timeline, financing_status, client_type, metadata')
        .eq('id', params.id).single(), null)
    : null

  // Branded header used in both states.
  const Header = (
    <div className="text-center mb-8">
      <p className="font-serif text-2xl font-bold text-white">Jordan Padierne</p>
      <p className="text-sky-400 text-xs font-medium tracking-widest uppercase mt-1 mb-3">Realtor · South Florida</p>
      <ExpLogo className="h-6 mx-auto" />
    </div>
  )

  if (!lead) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          {Header}
          <div className="bg-white rounded-3xl shadow-premium p-8">
            <p className="text-navy-900 font-semibold mb-2">This link isn’t active.</p>
            <p className="text-gray-500 text-sm mb-5">Reach Jordan directly and he’ll help you right away.</p>
            <a href={profile.phoneHref} className="btn-wine w-full justify-center"><Phone size={16} /> Call Jordan</a>
          </div>
        </div>
      </div>
    )
  }

  const meta = (lead.metadata ?? {}) as Record<string, any>
  const firstName = (lead.full_name || '').trim().split(' ')[0] || 'there'

  const appts = await safeQuery((db) => db.from('appointments')
    .select('id, title, type, starts_at, location, status')
    .eq('lead_id', lead.id)
    .gte('starts_at', new Date().toISOString())
    .neq('status', 'cancelled')
    .order('starts_at', { ascending: true }).limit(5), [])

  const sentIds: string[] = Array.isArray(meta.sent_property_ids) ? meta.sent_property_ids : []
  const props = sentIds.length
    ? await safeQuery((db) => db.from('properties')
        .select('id, title, city, price, listing_type, bedrooms, bathrooms, sqft, images')
        .in('id', sentIds).limit(24), [])
    : []

  // NOTE: this page is public (anyone with the per-lead URL can open it), so it
  // intentionally does NOT show financial PII — budget and financing status stay
  // private to the CRM. Only non-sensitive search preferences are shown here.
  const wants = [
    { label: 'Looking to', value: meta.intent ?? lead.client_type },
    { label: 'Area', value: lead.preferred_area ?? meta.preferred_area },
    { label: 'Property type', value: meta.property_type },
    { label: 'Bedrooms', value: meta.bedrooms },
    { label: 'Timeline', value: lead.timeline ?? meta.timeline },
  ].filter((w) => w.value !== null && w.value !== undefined && w.value !== '')

  return (
    <div className="min-h-screen bg-navy-900">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {Header}

        {/* Hero / greeting */}
        <div className="bg-white rounded-3xl shadow-premium p-7 lg:p-8 mb-5">
          <h1 className="font-serif text-2xl lg:text-3xl font-bold text-navy-900 mb-1">Hi {firstName} 👋</h1>
          <p className="text-gray-500">This is your private home-search hub with Jordan. Everything in one place.</p>
        </div>

        {/* Upcoming appointments */}
        {appts.length > 0 && (
          <div className="bg-white rounded-3xl shadow-premium p-6 lg:p-7 mb-5">
            <h2 className="font-serif text-lg font-bold text-navy-900 mb-4 flex items-center gap-2"><Calendar size={18} className="text-wine" /> Your appointments</h2>
            <div className="space-y-3">
              {appts.map((a: any) => {
                const isVideo = a.type === 'video' || /jit\.si|meet\.google/.test(a.location ?? '')
                return (
                  <div key={a.id} className="flex items-start gap-3 p-4 rounded-2xl bg-light-gray">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0">{isVideo ? <Video size={16} className="text-wine" /> : <MapPin size={16} className="text-wine" />}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy-900 text-sm">{a.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{fmtWhen(a.starts_at)}</p>
                      {isVideo && /^https?:/.test(a.location ?? '') && (
                        <a href={a.location} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sky-600 text-xs font-semibold mt-1">Join video call →</a>
                      )}
                      {!isVideo && a.location && <p className="text-gray-400 text-xs mt-0.5">{a.location}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Homes Jordan picked */}
        {props.length > 0 && (
          <div className="bg-white rounded-3xl shadow-premium p-6 lg:p-7 mb-5">
            <h2 className="font-serif text-lg font-bold text-navy-900 mb-1 flex items-center gap-2"><Home size={18} className="text-wine" /> Homes Jordan picked for you</h2>
            <p className="text-gray-400 text-sm mb-5">Tell Jordan which ones you’d like to see.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {props.map((p: any) => (
                <div key={p.id} className="rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="h-40 bg-gray-100 bg-cover bg-center" style={p.images?.[0] ? { backgroundImage: `url(${p.images[0]})` } : undefined} />
                  <div className="p-4">
                    <p className="text-sky-500 text-[11px] font-semibold uppercase tracking-wide">{p.city}</p>
                    <p className="font-serif font-bold text-navy-900 text-base leading-tight truncate">{p.title}</p>
                    <p className="font-bold text-navy-900 mt-1">{formatCurrency(Number(p.price))}{p.listing_type === 'rent' ? '/mo' : ''}</p>
                    <p className="text-gray-400 text-xs mt-1">{[p.bedrooms ? `${p.bedrooms} bd` : '', p.bathrooms ? `${p.bathrooms} ba` : '', p.sqft ? `${Number(p.sqft).toLocaleString()} sqft` : ''].filter(Boolean).join(' · ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* What you're looking for */}
        {wants.length > 0 && (
          <div className="bg-white rounded-3xl shadow-premium p-6 lg:p-7 mb-5">
            <h2 className="font-serif text-lg font-bold text-navy-900 mb-4 flex items-center gap-2"><CheckCircle2 size={18} className="text-wine" /> What you’re looking for</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-4">
              {wants.map((w) => (
                <div key={w.label}>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{w.label}</p>
                  <p className="text-navy-900 text-sm font-semibold mt-0.5">{String(w.value)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Jordan */}
        <div className="bg-gradient-to-br from-navy-900 to-navy-700 rounded-3xl shadow-premium p-7 text-center">
          <p className="text-white font-serif text-xl font-bold mb-1">Questions? Jordan’s here.</p>
          <p className="text-navy-200 text-sm mb-5">Call, text, or message him anytime.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={profile.phoneHref} className="btn-wine justify-center"><Phone size={16} /> Call</a>
            <a href={profile.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors">WhatsApp</a>
            <a href={profile.emailHref} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"><Mail size={16} /> Email</a>
          </div>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">Jordan Padierne · eXp Realty · {profile.phone}</p>
      </div>
    </div>
  )
}
