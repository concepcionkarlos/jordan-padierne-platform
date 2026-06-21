export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import PublicLayout from '@/components/layout/PublicLayout'
import { safeQuery } from '@/lib/db'
import PropertiesHero from '@/components/properties/PropertiesHero'
import PropertiesListings from '@/components/properties/PropertiesListings'
import PropertiesMlsCta from '@/components/properties/PropertiesMlsCta'

export const metadata: Metadata = {
  alternates: { canonical: 'https://jordanpadierne.com/properties' },
  openGraph: { url: 'https://jordanpadierne.com/properties', images: ['/og-image.jpg'] },
  title: 'Homes & Condos for Sale in Miami',
  description:
    'Browse homes, condos & properties for sale and rent in Miami with Realtor Jordan Padierne. Brickell, Doral, Coral Gables, Downtown & more — for sale, rentals & investment listings. Bilingual service. Call 305-799-6973.',
}

async function getProperties(): Promise<any[]> {
  return safeQuery((db) => db.from('properties').select('*').neq('status', 'off-market').order('featured', { ascending: false }).order('created_at', { ascending: false }).limit(60), [])
}

export default async function PropertiesPage() {
  const properties = await getProperties()

  return (
    <PublicLayout>
      <PropertiesHero />
      <PropertiesListings properties={properties} />
      <PropertiesMlsCta />
    </PublicLayout>
  )
}
