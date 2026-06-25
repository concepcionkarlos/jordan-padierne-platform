'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import {
  Search, LayoutDashboard, Users, GitBranch, CalendarDays, CheckSquare,
  BarChart3, MessageSquare, Building2, Settings, UserCircle, Phone, Command,
  FileText, MessageSquareQuote, Youtube, Newspaper, Rocket, GraduationCap,
} from 'lucide-react'

const PAGES = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Leads', href: '/admin/leads', icon: Users },
  { label: 'Pipeline', href: '/admin/pipeline', icon: GitBranch },
  { label: 'Calendar', href: '/admin/calendar', icon: CalendarDays },
  { label: 'Tasks', href: '/admin/tasks', icon: CheckSquare },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { label: 'Contacts', href: '/admin/contacts', icon: UserCircle },
  { label: 'Forms', href: '/admin/forms', icon: FileText },
  { label: 'Properties', href: '/admin/properties', icon: Building2 },
  { label: 'Testimonials', href: '/admin/testimonials', icon: MessageSquareQuote },
  { label: 'Videos', href: '/admin/videos', icon: Youtube },
  { label: 'Insights', href: '/admin/insights', icon: Newspaper },
  { label: 'Growth Engine', href: '/admin/automations', icon: Rocket },
  { label: 'Training', href: '/admin/training', icon: GraduationCap },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

interface Lead { id: string; full_name: string; phone: string; client_type: string; pipeline_stage: string }

export default function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [leads, setLeads] = useState<Lead[]>([])
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Toggle on Cmd/Ctrl+K, or when the mobile top-bar search button fires the event.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('open-command-palette', onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('open-command-palette', onOpen)
    }
  }, [])

  // Load leads once when opened
  useEffect(() => {
    if (open) {
      setQuery(''); setActive(0)
      setTimeout(() => inputRef.current?.focus(), 50)
      if (leads.length === 0) {
        fetch('/api/leads?limit=500').then((r) => r.json()).then((j) => { if (j.success) setLeads(j.data ?? []) })
      }
    }
  }, [open, leads.length])

  const q = query.toLowerCase().trim()
  const matchedPages = q ? PAGES.filter((p) => p.label.toLowerCase().includes(q)) : PAGES
  const matchedLeads = q
    ? leads.filter((l) => `${l.full_name} ${l.phone} ${l.client_type}`.toLowerCase().includes(q)).slice(0, 6)
    : []

  const results = [
    ...matchedPages.map((p) => ({ type: 'page' as const, ...p })),
    ...matchedLeads.map((l) => ({ type: 'lead' as const, ...l })),
  ]

  const go = useCallback((r: any) => {
    setOpen(false)
    router.push(r.type === 'lead' ? `/admin/leads/${r.id}` : r.href)
  }, [router])

  useEffect(() => { setActive(0) }, [query])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
    if (e.key === 'Enter' && results[active]) { e.preventDefault(); go(results[active]) }
  }

  return (
    <>
      {/* Trigger hint button (mobile + discoverability) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-navy-300 hover:text-white text-xs bg-navy-800/60 rounded-lg px-3 py-2 w-full transition-colors"
      >
        <Search size={13} />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="hidden lg:flex items-center gap-0.5 text-[10px] text-navy-400 border border-navy-700 rounded px-1.5 py-0.5">
          <Command size={9} />K
        </kbd>
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[70] flex items-start justify-center pt-[12vh] px-4">
          <div className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-premium overflow-hidden animate-modal-pop">
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
              <Search size={18} className="text-gray-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search leads or jump to a page…"
                className="flex-1 outline-none text-navy-900 text-sm placeholder-gray-400"
              />
              <kbd className="text-[10px] text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">ESC</kbd>
            </div>

            <div className="max-h-80 overflow-y-auto scrollbar-thin py-2">
              {results.length === 0 && <p className="px-4 py-6 text-center text-gray-400 text-sm">No results for &ldquo;{query}&rdquo;</p>}

              {matchedPages.length > 0 && (
                <div>
                  <p className="px-4 py-1 text-[10px] font-bold text-gray-300 uppercase tracking-widest">Pages</p>
                  {results.filter((r) => r.type === 'page').map((r: any, i) => {
                    const Icon = r.icon
                    const idx = results.indexOf(r)
                    return (
                      <button key={r.href} type="button" onClick={() => go(r)} onMouseEnter={() => setActive(idx)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${active === idx ? 'bg-sky-50 text-navy-900' : 'text-navy-700'}`}>
                        <Icon size={16} className="text-navy-400" />{r.label}
                      </button>
                    )
                  })}
                </div>
              )}

              {matchedLeads.length > 0 && (
                <div>
                  <p className="px-4 py-1 mt-1 text-[10px] font-bold text-gray-300 uppercase tracking-widest">Leads</p>
                  {results.filter((r) => r.type === 'lead').map((r: any) => {
                    const idx = results.indexOf(r)
                    return (
                      <button key={r.id} type="button" onClick={() => go(r)} onMouseEnter={() => setActive(idx)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${active === idx ? 'bg-sky-50' : ''}`}>
                        <div className="w-7 h-7 rounded-full bg-navy-50 flex items-center justify-center shrink-0"><UserCircle size={15} className="text-navy-600" /></div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-semibold text-navy-900 truncate">{r.full_name}</p>
                          <p className="text-gray-400 text-xs">{r.client_type}</p>
                        </div>
                        {r.phone && <Phone size={13} className="text-gray-300" />}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
