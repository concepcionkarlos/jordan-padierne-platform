export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/layout/PublicLayout'
import { Search, Phone, Building2, Home, DollarSign } from 'lucide-react'
import { safeQuery } from '@/lib/db'
import PropertiesGrid from '@/components/PropertiesGrid'

export const metadata: Metadata = {
  title: 'Homes & Condos for Sale in Miami',
  description:
    'Browse homes, condos & properties for sale and rent in Miami with Realtor Jordan Padierne. Brickell, Doral, Coral Gables, Downtown & more — for sale, rentals & investment listings. Bilingual service. Call 305-799-6973.',
}

async function getProperties(): Promise<any[]> {
  return safeQuery((db) => db.from('properties').select('*').neq('status', 'off-market').order('featured', { ascending: false }).order('created_at', { ascending: false }).limit(60), [])
}

export default async function PropertiesPage() {
  const properties = await getProperties()
  const hasListings = properties.length > 0

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-navy-900 pt-28 pb-16">
        <div className="container-max section-padding">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sky-400 font-semibold text-sm uppercase tracking-widest mb-4">Listings</p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-6">
              Find Your Property in <span className="text-sky-400">South Florida</span>
            </h1>
            <p className="text-navy-200 text-lg mb-10">
              Condos, luxury homes, investment properties, and pre-construction opportunities across Miami-Dade County.
            </p>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-4 max-w-lg mx-auto">
              <Search size={18} className="text-white/60" />
              <p className="text-white/60 text-sm">Contact Jordan for the latest available listings and off-market opportunities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="py-20 bg-white">
        <div className="container-max section-padding">
          {hasListings ? (
            <>
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-serif text-2xl font-bold text-navy-900">Available Properties</h2>
                <span className="text-sm text-gray-400">{properties.length} listings</span>
              </div>
              <PropertiesGrid properties={properties} />
            </>
          ) : (
            <div className="max-w-xl mx-auto text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-navy-50 flex items-center justify-center mx-auto mb-6">
                <Building2 size={28} className="text-navy-600" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-navy-900 mb-3">Let&apos;s Find Your Perfect Property</h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                Jordan has full access to the South Florida MLS — including off-market and
                pre-construction opportunities not listed publicly. Tell him what you&apos;re
                looking for and he&apos;ll send you a personalized list of matches.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact" className="btn-wine cta-shine"><Search size={16} /> Start Your Search</Link>
                <a href="tel:+13057996973" className="btn-secondary"><Phone size={16} /> Call Jordan</a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Full MLS CTA */}
      <section className="py-20 bg-light-gray">
        <div className="container-max section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-3">Full MLS Access</p>
              <h2 className="font-serif text-3xl font-bold text-navy-900 mb-6">Thousands More Listings Available</h2>
              <p className="text-gray-500 text-base leading-relaxed mb-6">
                Jordan has access to the full South Florida MLS, including properties not listed on Zillow or Realtor.com.
                Contact him for a personalized search based on your specific criteria.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/contact" className="btn-primary"><Search size={16} /> Start Your Search</Link>
                <a href="tel:+13057996973" className="btn-secondary"><Phone size={16} /> Call Jordan</a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Condos & High-Rises', icon: Building2, desc: 'Brickell, Downtown, Edgewater' },
                { label: 'Single Family Homes', icon: Home, desc: 'Doral, Coral Gables, Hialeah' },
                { label: 'Pre-Construction', icon: DollarSign, desc: "Miami's newest projects" },
                { label: 'Luxury Properties', icon: Building2, desc: '$1M+ waterfront & penthouses' },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <Icon size={20} className="text-navy-600 mb-3" />
                    <p className="font-semibold text-navy-900 text-sm mb-1">{item.label}</p>
                    <p className="text-gray-400 text-xs">{item.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
