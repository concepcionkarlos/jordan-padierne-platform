import type { Metadata } from 'next'
import PublicLayout from '@/components/layout/PublicLayout'
import ContactContent from '@/components/contact/ContactContent'

export const metadata: Metadata = {
  alternates: { canonical: 'https://jordanpadierne.com/contact' },
  openGraph: { url: 'https://jordanpadierne.com/contact', images: ['/og-image.jpg'] },
  title: 'Contact Jordan Padierne — Miami Realtor',
  description:
    'Contact Miami Realtor Jordan Padierne. Schedule a free consultation, request a showing, or get expert real estate guidance in Brickell, Doral, Coral Gables & Miami-Dade. Call or text 305-799-6973. Hablamos Español.',
}

export default function ContactPage() {
  return (
    <PublicLayout>
      <ContactContent />
    </PublicLayout>
  )
}
