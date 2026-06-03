import Navbar from './Navbar'
import Footer from './Footer'
import FloatingActions from '@/components/ui/FloatingActions'
import StickyCTA from '@/components/ui/StickyCTA'
import LeadCaptureModal from '@/components/ui/LeadCaptureModal'
import { LanguageProvider } from '@/components/LanguageProvider'

export default function PublicLayout({
  children,
  showLeadModal = false,
}: {
  children: React.ReactNode
  showLeadModal?: boolean
}) {
  return (
    <LanguageProvider>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <FloatingActions />
      <StickyCTA />
      {showLeadModal && <LeadCaptureModal />}
    </LanguageProvider>
  )
}
