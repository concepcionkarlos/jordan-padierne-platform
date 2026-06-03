'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Building2, Home, Search } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Props {
  properties: any[]
}

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'sale', label: '🏷️ For Sale' },
  { id: 'rent', label: '🔑 For Rent' },
  { id: 'investment', label: '📈 Investment' },
]

const listingBadge: Record<string, { label: string; className: string }> = {
  sale: { label: 'For Sale', className: 'bg-green-500 text-white' },
  rent: { label: 'For Rent', className: 'bg-sky-500 text-white' },
  investment: { label: 'Investment', className: 'bg-purple-500 text-white' },
}

export default function PropertiesGrid({ properties }: Props) {
  const [cat, setCat] = useState('all')
  const [area, setArea] = useState('All Areas')

  const areas = useMemo(() => ['All Areas', ...Array.from(new Set(properties.map((p) => p.city).filter(Boolean)))], [properties])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: properties.length, sale: 0, rent: 0, investment: 0 }
    properties.forEach((p) => { const t = p.listing_type ?? 'sale'; c[t] = (c[t] ?? 0) + 1 })
    return c
  }, [properties])

  const filtered = properties.filter((p) => {
    if (cat !== 'all' && (p.listing_type ?? 'sale') !== cat) return false
    if (area !== 'All Areas' && p.city !== area) return false
    return true
  })

  return (
    <div>
      {/* Category tabs + area filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCat(c.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                cat === c.id ? 'bg-navy-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-navy-300'
              }`}
            >
              {c.label} <span className={cat === c.id ? 'text-white/60' : 'text-gray-400'}>({counts[c.id] ?? 0})</span>
            </button>
          ))}
        </div>
        <select value={area} onChange={(e) => setArea(e.target.value)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-navy-700 bg-white" title="Filter by area">
          {areas.map((a) => <option key={a}>{a}</option>)}
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Search size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No properties in this category yet. Contact Jordan for current options.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => {
            const lt = p.listing_type ?? 'sale'
            const badge = listingBadge[lt] ?? listingBadge.sale
            return (
              <div key={p.id} className="card group hover-lift">
                <div className="relative h-56 overflow-hidden bg-gray-100">
                  {p.images?.[0]
                    ? <Image src={p.images[0]} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center"><Building2 size={36} className="text-gray-200" /></div>}
                  <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badge.className}`}>{badge.label}</span>
                    {p.is_pre_construction && <span className="bg-wine text-white text-xs font-bold px-2.5 py-1 rounded-full">Pre-Construction</span>}
                  </div>
                  {p.status !== 'available' && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-gray-700 text-white text-xs font-bold px-2.5 py-1 rounded-full capitalize">{p.status}</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <p className="text-sky-500 text-xs font-semibold uppercase tracking-wider mb-1">{p.city}</p>
                  <h3 className="font-serif text-lg font-bold text-navy-900 mb-3 truncate">{p.title}</h3>
                  <p className="font-bold text-2xl text-navy-900 mb-4">
                    {formatCurrency(Number(p.price))}
                    {lt === 'rent' && <span className="text-gray-400 text-base font-normal">/mo</span>}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 pb-4 border-b border-gray-100">
                    {p.bedrooms && <span className="flex items-center gap-1"><Home size={13} />{p.bedrooms} bd</span>}
                    {p.bathrooms && <span>{p.bathrooms} ba</span>}
                    {p.sqft && <span>{Number(p.sqft).toLocaleString()} sqft</span>}
                  </div>
                  <Link href="/contact" className="mt-4 flex items-center gap-1.5 text-navy-700 font-semibold text-sm hover:text-wine transition-colors">
                    Request Info <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
