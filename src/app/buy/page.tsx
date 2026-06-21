import type { Metadata } from 'next'
import BuyContent from '@/components/buy/BuyContent'

export const metadata: Metadata = {
  alternates: { canonical: 'https://jordanpadierne.com/buy' },
  openGraph: { url: 'https://jordanpadierne.com/buy', images: ['/og-image.jpg'] },
  title: 'Buy a Home in Miami',
  description:
    'Buy a home or condo in Miami with Realtor Jordan Padierne. Expert buyer guidance in Brickell, Doral, Coral Gables, Downtown Miami & Hialeah. First-time buyers, luxury & international clients welcome. Bilingual. Call 305-799-6973.',
}

export default function BuyPage() {
  return <BuyContent />
}
