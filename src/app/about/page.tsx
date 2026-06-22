import type { Metadata } from 'next'
import PublicLayout from '@/components/layout/PublicLayout'
import AboutContent from '@/components/about/AboutContent'

export const metadata: Metadata = {
  alternates: { canonical: 'https://jordanpadierne.com/about' },
  openGraph: { url: 'https://jordanpadierne.com/about', images: ['/og-image.jpg'] },
  title: 'About Jordan Padierne — Miami Realtor',
  description:
    'Meet Jordan Padierne, a trusted Miami Realtor with eXp Realty. Born in Cuba, based in Miami, bilingual (English/Español). Family-oriented real estate expert helping buyers, investors & international clients across Miami-Dade.',
}

export default function AboutPage() {
  return (
    <PublicLayout>
      <AboutContent />
    </PublicLayout>
  )
}
