import PublicLayout from '@/components/layout/PublicLayout'
import HeroSection from '@/components/home/HeroSection'
import QuickLeadForm from '@/components/home/QuickLeadForm'
import WhyJordanSection from '@/components/home/WhyJordanSection'
import ServicesSection from '@/components/home/ServicesSection'
import PreConstructionSection from '@/components/home/PreConstructionSection'
import AreasSection from '@/components/home/AreasSection'
import VideosSection from '@/components/home/VideosSection'
import HomeInsightsSection from '@/components/home/HomeInsightsSection'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import ContactCTASection from '@/components/home/ContactCTASection'
import StructuredData from '@/components/StructuredData'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: 'https://jordanpadierne.com' },
}

// Refresh periodically so new testimonials appear without a redeploy.
export const revalidate = 120

export default function HomePage() {
  return (
    <PublicLayout showLeadModal>
      <StructuredData />
      <HeroSection />
      <QuickLeadForm />
      <WhyJordanSection />
      <ServicesSection />
      <PreConstructionSection />
      <AreasSection />
      <VideosSection />
      <HomeInsightsSection />
      <TestimonialsSection />
      <ContactCTASection />
    </PublicLayout>
  )
}
