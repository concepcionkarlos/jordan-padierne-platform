import type { Metadata } from 'next'
import PublicLayout from '@/components/layout/PublicLayout'
import InvestorsContent from '@/components/investors/InvestorsContent'

export const metadata: Metadata = {
  alternates: { canonical: 'https://jordanpadierne.com/investors' },
  openGraph: { url: 'https://jordanpadierne.com/investors', images: ['/og-image.jpg'] },
  title: 'Miami Investment Properties',
  description:
    'Invest in Miami real estate with Jordan Padierne. High-ROI investment properties, pre-construction, Airbnb short-term & long-term rentals across Miami-Dade. Strategy for first-time & seasoned investors. Bilingual. Call 305-799-6973.',
}

export default function InvestorsPage() {
  return (
    <PublicLayout>
      <InvestorsContent />
    </PublicLayout>
  )
}
