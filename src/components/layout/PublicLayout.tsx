import Navbar from './Navbar'
import Footer from './Footer'
import FloatingActions from '@/components/ui/FloatingActions'
import StickyCTA from '@/components/ui/StickyCTA'
import LeadCaptureModal from '@/components/ui/LeadCaptureModal'
import { LanguageProvider } from '@/components/LanguageProvider'
import { ProfileProvider } from '@/components/ProfileProvider'
import { getProfile } from '@/lib/profile'

export default async function PublicLayout({
  children,
  showLeadModal = false,
}: {
  children: React.ReactNode
  showLeadModal?: boolean
}) {
  const profile = await getProfile()
  return (
    <ProfileProvider value={profile}>
      <LanguageProvider>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <FloatingActions />
        <StickyCTA />
        {showLeadModal && <LeadCaptureModal />}
      </LanguageProvider>
    </ProfileProvider>
  )
}
