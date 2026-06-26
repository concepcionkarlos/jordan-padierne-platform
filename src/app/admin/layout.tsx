import type { Metadata } from 'next'
import AdminShell from '@/components/admin/AdminShell'
import { ProfileProvider } from '@/components/ProfileProvider'
import { getProfile } from '@/lib/profile'

export const metadata: Metadata = {
  title: {
    default: 'Admin Dashboard',
    template: '%s | Jordan Padierne Admin',
  },
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Seed the live agent profile so admin client components (WhatsApp share text,
  // quick-contact, etc.) always use Jordan's current editable contact info.
  const profile = await getProfile()
  return (
    <ProfileProvider value={profile}>
      <AdminShell>{children}</AdminShell>
    </ProfileProvider>
  )
}
