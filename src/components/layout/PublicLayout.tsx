import Navbar from './Navbar'
import Footer from './Footer'
import FloatingActions from '@/components/ui/FloatingActions'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <FloatingActions />
    </>
  )
}
