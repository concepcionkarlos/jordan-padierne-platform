import PublicLayout from '@/components/layout/PublicLayout'
import HeroSection from '@/components/home/HeroSection'
import WhyJordanSection from '@/components/home/WhyJordanSection'
import ServicesSection from '@/components/home/ServicesSection'
import PreConstructionSection from '@/components/home/PreConstructionSection'
import AreasSection from '@/components/home/AreasSection'
import ContactCTASection from '@/components/home/ContactCTASection'

export default function HomePage() {
  return (
    <PublicLayout>
      <HeroSection />
      <WhyJordanSection />
      <ServicesSection />
      <PreConstructionSection />
      <AreasSection />
      <ContactCTASection />
    </PublicLayout>
  )
}
