import type { Metadata } from 'next'
import PublicLayout from '@/components/layout/PublicLayout'
import AuroraBackground from '@/components/ui/AuroraBackground'
import BookingWizard from '@/components/booking/BookingWizard'

export const metadata: Metadata = {
  title: 'Book a Free Consultation — Jordan Padierne, Miami Realtor',
  description:
    'Schedule a free 30-minute consultation with Miami Realtor Jordan Padierne. Pick a time that works for you — buying, selling, or investing in South Florida. Hablamos Español. Call 305-799-6973.',
  alternates: { canonical: 'https://jordanpadierne.com/book' },
}

export default function BookPage() {
  return (
    <PublicLayout>
      <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden">
        <AuroraBackground />
        <div className="container-max section-padding relative z-10">
          <BookingWizard />
        </div>
      </section>
    </PublicLayout>
  )
}
