'use client'

import { usePathname } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { Toaster } from '@/lib/toast'
import WelcomeTour from '@/components/admin/WelcomeTour'

// The login screen is standalone — it must NOT render the admin sidebar/chrome
// (showing the nav to a logged-out visitor looks broken and leaks structure).
const STANDALONE_ROUTES = ['/admin/login']

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (STANDALONE_ROUTES.includes(pathname)) {
    return <>{children}</>
  }

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
