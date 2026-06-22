import type { Metadata } from 'next'
import PublicLayout from '@/components/layout/PublicLayout'
import HomeValueContent from '@/components/homevalue/HomeValueContent'

export const metadata: Metadata = {
  alternates: { canonical: 'https://jordanpadierne.com/home-value' },
  openGraph: { url: 'https://jordanpadierne.com/home-value', images: ['/og-image.jpg'] },
  title: 'What\'s My Miami Home Worth? Free Valuation',
  description:
    'Sell your Miami home with confidence. Get a FREE, no-obligation home valuation from Realtor Jordan Padierne. Find out what your property in Brickell, Doral, Coral Gables, Hialeah or Miami-Dade is worth today. Call 305-799-6973.',
}

export default function HomeValuePage() {
  return (
    <PublicLayout>
      <HomeValueContent />
    </PublicLayout>
  )
}
