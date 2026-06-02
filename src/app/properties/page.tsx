import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import PublicLayout from '@/components/layout/PublicLayout'
import { Search, Phone, ArrowRight, Building2, Home, DollarSign } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Properties',
  description:
    'Search properties in South Florida with Jordan Padierne — condos, luxury homes, pre-construction, and investment opportunities in Miami-Dade.',
}

// Sample featured properties (replace with Supabase data in production)
const featuredProperties = [
  {
    id: '1',
    title: 'Luxury Waterfront Condo',
    city: 'Brickell',
    price: 1250000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1800,
    type: 'condo',
    status: 'available',
    is_pre_construction: false,
    image: '/images/jordan-luxury.png',
  },
  {
    id: '2',
    title: 'Modern Pre-Construction Unit',
    city: 'Downtown Miami',
    price: 680000,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1200,
    type: 'pre-construction',
    status: 'available',
    is_pre_construction: true,
    image: '/images/jordan-modern.png',
  },
  {
    id: '3',
    title: 'Single Family Home',
    city: 'Doral',
    price: 895000,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2800,
    type: 'house',
    status: 'available',
    is_pre_construction: false,
    image: '/images/jordan-house.png',
  },
]

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n)
}

export default function PropertiesPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-navy-900 pt-28 pb-16">
        <div className="container-max section-padding">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sky-400 font-semibold text-sm uppercase tracking-widest mb-4">Listings</p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-6">
              Find Your Property in{' '}
              <span className="text-sky-400">South Florida</span>
            </h1>
            <p className="text-navy-200 text-lg mb-10">
              Condos, luxury homes, investment properties, and pre-construction opportunities
              across Miami-Dade County.
            </p>
            {/* Search hint */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-4 max-w-lg mx-auto">
              <Search size={18} className="text-white/60" />
              <p className="text-white/60 text-sm">
                Contact Jordan for the latest available listings and off-market opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-20 bg-white">
        <div className="container-max section-padding">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-serif text-2xl font-bold text-navy-900">Featured Properties</h2>
            <span className="text-sm text-gray-400">Showing sample listings · Contact for full MLS access</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((p) => (
              <div key={p.id} className="card group">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    {p.is_pre_construction && (
                      <span className="bg-wine text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        Pre-Construction
                      </span>
                    )}
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      p.status === 'available' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                    }`}>
                      {p.status === 'available' ? 'Available' : p.status}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sky-500 text-xs font-semibold uppercase tracking-wider mb-1">{p.city}</p>
                  <h3 className="font-serif text-lg font-bold text-navy-900 mb-3">{p.title}</h3>
                  <p className="font-bold text-2xl text-navy-900 mb-4">{formatCurrency(p.price)}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 pb-4 border-b border-gray-100">
                    <span className="flex items-center gap-1"><Home size={13} />{p.bedrooms} bd</span>
                    <span>{p.bathrooms} ba</span>
                    <span>{p.sqft.toLocaleString()} sqft</span>
                  </div>
                  <Link href="/contact" className="mt-4 flex items-center gap-1.5 text-navy-700 font-semibold text-sm hover:text-wine transition-colors">
                    Request Info <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full MLS access CTA */}
      <section className="py-20 bg-light-gray">
        <div className="container-max section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-3">Full MLS Access</p>
              <h2 className="font-serif text-3xl font-bold text-navy-900 mb-6">
                Thousands More Listings Available
              </h2>
              <p className="text-gray-500 text-base leading-relaxed mb-6">
                Jordan has access to the full South Florida MLS, including properties not
                listed on Zillow or Realtor.com. Contact him for a personalized search
                based on your specific criteria.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/contact" className="btn-primary">
                  <Search size={16} /> Start Your Search
                </Link>
                <a href="tel:+13057996973" className="btn-secondary">
                  <Phone size={16} /> Call Jordan
                </a>
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
