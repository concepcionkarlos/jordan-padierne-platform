'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Menu, X, Search,
  LayoutDashboard,
  Users,
  MessageSquare,
  Building2,
  CheckSquare,
  GitBranch,
  Settings,
  LogOut,
  Phone,
  ChevronRight,
  CalendarDays,
  BarChart3,
  MessageSquareQuote,
  Youtube,
  Rocket,
  Newspaper,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSupabaseClient } from '@/lib/supabase'
import { useProfile } from '@/components/ProfileProvider'
import InstallPrompt from './InstallPrompt'
import CommandPalette from './CommandPalette'
import TrainingButton from './TrainingButton'
import PushToggle from './PushToggle'

type NavItem = { href: string; label: string; icon: any; exact?: boolean }

// Grouped navigation — Jordan should grasp the whole structure in under a minute.
const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Work',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { href: '/admin/leads', label: 'Leads', icon: Users },
      { href: '/admin/pipeline', label: 'Pipeline', icon: GitBranch },
      { href: '/admin/calendar', label: 'Calendar', icon: CalendarDays },
      { href: '/admin/tasks', label: 'Tasks', icon: CheckSquare },
      { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/properties', label: 'Properties', icon: Building2 },
      { href: '/admin/insights', label: 'Insights', icon: Newspaper },
      { href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
      { href: '/admin/videos', label: 'Videos', icon: Youtube },
    ],
  },
  {
    label: 'Growth',
    items: [
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/admin/automations', label: 'Growth Engine', icon: Rocket },
    ],
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const profile = useProfile()
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  // Close the drawer after navigating (mobile).
  useEffect(() => { setOpen(false) }, [pathname])

  // End the session for real — clears the Supabase auth cookie so the server
  // guards (middleware + route guards) treat the user as logged out.
  async function handleSignOut() {
    setSigningOut(true)
    try { await getSupabaseClient().auth.signOut() } catch { /* ignore */ }
    router.replace('/admin/login')
    router.refresh()
  }

  const isActive = (item: { href: string; exact?: boolean }) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href) && item.href !== '/admin'
  }

  const NavLink = ({ item }: { item: NavItem }) => {
    const Icon = item.icon
    const active = isActive(item)
    return (
      <Link href={item.href} className={cn(active ? 'sidebar-link-active' : 'sidebar-link')}>
        <Icon size={17} />
        {item.label}
        {active && <ChevronRight size={13} className="ml-auto text-sky/60" />}
      </Link>
    )
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-navy-900 px-4 h-14">
        <p className="font-serif text-white font-bold">Jordan Padierne</p>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => window.dispatchEvent(new Event('open-command-palette'))} className="p-2 text-white" aria-label="Search">
            <Search size={20} />
          </button>
          <button type="button" onClick={() => setOpen(true)} className="p-2 text-white" aria-label="Open menu">
            <Menu size={22} />
          </button>
        </div>
      </div>
      {/* Overlay */}
      {open && <div className="lg:hidden fixed inset-0 z-40 bg-navy-900/50 backdrop-blur-sm" onClick={() => setOpen(false)} />}

    <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky inset-y-0 left-0 top-0 z-50 w-64 shrink-0 bg-navy-900 flex flex-col h-screen transition-transform duration-200`}>
      <button type="button" onClick={() => setOpen(false)} className="lg:hidden absolute top-4 right-4 text-navy-400 hover:text-white" aria-label="Close menu"><X size={20} /></button>
      {/* Logo */}
      <div className="px-6 py-6 border-b border-navy-800">
        <p className="font-serif text-white font-bold text-lg leading-tight">Jordan Padierne</p>
        <p className="text-sky-400 text-xs font-medium tracking-wider mt-0.5">Admin Dashboard</p>
      </div>

      {/* Command palette search */}
      <div className="px-3 pt-3">
        <CommandPalette />
      </div>

      {/* Grouped nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5 scrollbar-thin">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-4 mb-1.5 text-[10px] font-bold text-navy-500 uppercase tracking-widest">{group.label}</p>
            <div className="space-y-1">
              {group.items.map((item) => <NavLink key={item.href} item={item} />)}
            </div>
          </div>
        ))}
      </nav>

      {/* Install prompt */}
      <InstallPrompt />

      {/* Bottom — Settings + Training, then utilities */}
      <div className="px-3 py-4 border-t border-navy-800 space-y-2">
        <NavLink item={{ href: '/admin/settings', label: 'Settings', icon: Settings }} />
        <TrainingButton />
        <PushToggle />
        {/* Quick contact */}
        <div className="px-4 py-3 rounded-xl bg-navy-800/50">
          <p className="text-navy-400 text-xs mb-1">Quick Contact</p>
          <a href={profile.phoneHref} className="flex items-center gap-2 text-sky-400 text-sm font-medium hover:text-sky-300">
            <Phone size={13} />
            {profile.phone}
          </a>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="sidebar-link w-full text-left text-navy-300 hover:text-white disabled:opacity-60"
        >
          <LogOut size={15} />
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
        <Link
          href="/"
          className="sidebar-link text-navy-400 text-xs"
        >
          <ExternalLink size={13} />
          Back to Website
        </Link>
      </div>
    </aside>
    </>
  )
}
