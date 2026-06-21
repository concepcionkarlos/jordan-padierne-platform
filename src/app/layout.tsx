import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'

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
  metadataBase: new URL('https://jordanpadierne.com'),
  title: {
    default: 'Jordan Padierne | Miami Realtor — Homes, Condos & Pre-Construction',
    template: '%s | Jordan Padierne — Miami Realtor',
  },
  description:
    'Jordan Padierne is a top Miami Realtor with eXp Realty. Buy, sell, or invest in real estate across Brickell, Doral, Coral Gables, Downtown Miami & Hialeah. Pre-construction & luxury specialist. Bilingual (English/Español). Call 305-799-6973.',
  keywords: [
    'Miami realtor', 'realtor in Miami', 'Jordan Padierne', 'Miami real estate agent',
    'Brickell condos for sale', 'homes for sale Miami', 'Doral real estate',
    'Coral Gables homes', 'Hialeah real estate agent', 'Downtown Miami condos',
    'pre-construction Miami', 'Miami pre-construction condos', 'luxury homes Miami',
    'Miami investment properties', 'international real estate Miami', 'eXp Realty Miami',
    'Spanish speaking realtor Miami', 'realtor que habla español Miami',
    'sell my house Miami', 'Miami home valuation', 'Miami-Dade realtor',
  ],
  authors: [{ name: 'Jordan Padierne' }],
  creator: 'Jordan Padierne',
  alternates: { canonical: 'https://jordanpadierne.com' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'es_ES',
    url: 'https://jordanpadierne.com',
    siteName: 'Jordan Padierne Real Estate',
    title: 'Jordan Padierne | Miami Realtor — Homes, Condos & Pre-Construction',
    description:
      'Top Miami Realtor with eXp Realty. Buy, sell & invest in Brickell, Doral, Coral Gables & more. Pre-construction & luxury specialist. Bilingual. 305-799-6973.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Jordan Padierne — Miami Realtor' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jordan Padierne | Miami Realtor — eXp Realty',
    description: 'Buy, sell & invest in South Florida real estate. Pre-construction & luxury specialist. Bilingual. 305-799-6973.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Jordan Padierne',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0A1628',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover', // extend under the notch / Dynamic Island on iPhone
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} scroll-smooth`}>
      <body className="antialiased">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
