import type { Metadata } from 'next'
import PublicLayout from '@/components/layout/PublicLayout'
import PreConstructionContent from '@/components/preconstruction/PreConstructionContent'

export const metadata: Metadata = {
  alternates: { canonical: 'https://jordanpadierne.com/pre-construction' },
  openGraph: { url: 'https://jordanpadierne.com/pre-construction', images: ['/og-image.jpg'] },
  title: 'Pre-Construction Condos in Miami',
  description:
    'Miami pre-construction condos & new developments with Jordan Padierne. Get early access to exclusive pre-launch projects in Brickell, Downtown Miami, Doral & Edgewater at the best pricing. Pre-construction specialist. Call 305-799-6973.',
}

export default function PreConstructionPage() {
  return (
    <PublicLayout>
      <PreConstructionContent />
    </PublicLayout>
  )
}
