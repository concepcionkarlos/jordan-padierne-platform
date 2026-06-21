import type { Metadata } from 'next'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { Toaster } from '@/lib/toast'
import WelcomeTour from '@/components/admin/WelcomeTour'

export const metadata: Metadata = {
  title: {
    default: 'Admin Dashboard',
    template: '%s | Jordan Padierne Admin',
  },
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto scrollbar-thin pt-14 lg:pt-0">
        {children}
      </main>
      <Toaster />
      <WelcomeTour />
    </div>
  )
}
