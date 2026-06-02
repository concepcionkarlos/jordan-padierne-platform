import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Jordan Padierne | South Florida Realtor — eXp Realty',
    template: '%s | Jordan Padierne Realtor',
  },
  description:
    'Jordan Padierne — South Florida Realtor with eXp Realty. Helping buyers, investors, and international clients find real estate opportunities in Miami-Dade, Brickell, Doral, Coral Gables, Downtown, and Hialeah.',
  keywords: [
    'Jordan Padierne',
    'Realtor Miami',
    'eXp Realty',
    'Miami real estate',
    'Brickell condos',
    'pre-construction Miami',
    'luxury homes Miami',
    'international buyers Florida',
    'investment properties Miami',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://jordanpadierne.com',
    siteName: 'Jordan Padierne Real Estate',
    title: 'Jordan Padierne | South Florida Realtor',
    description:
      'Trusted guidance, strong negotiation, and a family-oriented real estate experience in South Florida.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jordan Padierne | South Florida Realtor',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} scroll-smooth`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
