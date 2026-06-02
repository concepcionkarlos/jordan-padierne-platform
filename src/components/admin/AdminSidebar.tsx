'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  UserCircle,
  MessageSquare,
  FileText,
  Building2,
  CheckSquare,
  GitBranch,
  Settings,
  LogOut,
  Phone,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/leads', label: 'Leads', icon: Users },
  { href: '/admin/contacts', label: 'Contacts', icon: UserCircle },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/forms', label: 'Forms', icon: FileText },
  { href: '/admin/pipeline', label: 'Pipeline', icon: GitBranch },
  { href: '/admin/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/admin/properties', label: 'Properties', icon: Building2 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (item: { href: string; exact?: boolean }) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href) && item.href !== '/admin'
  }

  return (
    <aside className="w-64 shrink-0 bg-navy-900 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-navy-800">
        <p className="font-serif text-white font-bold text-lg leading-tight">Jordan Padierne</p>
        <p className="text-sky-400 text-xs font-medium tracking-wider mt-0.5">Admin Dashboard</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                active ? 'sidebar-link-active' : 'sidebar-link'
              )}
            >
              <Icon size={17} />
              {item.label}
              {active && <ChevronRight size={13} className="ml-auto text-sky/60" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-navy-800 space-y-2">
        {/* Quick contact */}
        <div className="px-4 py-3 rounded-xl bg-navy-800/50">
          <p className="text-navy-400 text-xs mb-1">Quick Contact</p>
          <a href="tel:+13057996973" className="flex items-center gap-2 text-sky-400 text-sm font-medium hover:text-sky-300">
            <Phone size={13} />
            305-799-6973
          </a>
        </div>
        <Link
          href="/"
          className="sidebar-link text-navy-400 text-xs"
        >
          <LogOut size={15} />
          Back to Website
        </Link>
      </div>
    </aside>
  )
}
