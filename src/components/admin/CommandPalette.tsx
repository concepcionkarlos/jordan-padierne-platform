'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import {
  Search, LayoutDashboard, Users, GitBranch, CalendarDays, CheckSquare,
  BarChart3, MessageSquare, Building2, Settings, UserCircle, Phone, Command,
  FileText, MessageSquareQuote, Youtube, Newspaper, Rocket, GraduationCap,
  Plus, Flame, StickyNote, CalendarPlus,
} from 'lucide-react'

// Order mirrors the sidebar grouping (Work → Content → Grow → bottom) so the
// palette and the nav teach the same map. "Clients" and "Submission log" are
// the same destinations as the retired Contacts/Forms nav items.
const PAGES = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Leads', href: '/admin/leads', icon: Users },
  { label: 'Clients', href: '/admin/leads?stage=CLOSED', icon: UserCircle },
  { label: 'Pipeline', href: '/admin/pipeline', icon: GitBranch },
  { label: 'Calendar', href: '/admin/calendar', icon: CalendarDays },
  { label: 'Tasks', href: '/admin/tasks', icon: CheckSquare },
  { label: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { label: 'Properties', href: '/admin/properties', icon: Building2 },
  { label: 'Insights', href: '/admin/insights', icon: Newspaper },
  { label: 'Testimonials', href: '/admin/testimonials', icon: MessageSquareQuote },
  { label: 'Videos', href: '/admin/videos', icon: Youtube },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Growth Engine', href: '/admin/automations', icon: Rocket },
  { label: 'Submission log', href: '/admin/forms', icon: FileText },
  { label: 'Training', href: '/admin/training', icon: GraduationCap },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

// High-value quick actions (Raycast-style). Each is just a deep link; the target
// page auto-opens the relevant form via a query param.
const ACTIONS = [
  { label: 'Add property', icon: Building2, href: '/admin/properties?add=1' },
  { label: 'Add lead', icon: Plus, href: '/admin/leads?add=1' },
  { label: 'Hot leads', icon: Flame, href: '/admin/leads?tag=hot' },
  { label: "Today's tasks", icon: CheckSquare, href: '/admin/tasks' },
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
  const matchedActions = q ? ACTIONS.filter((a) => a.label.toLowerCase().includes(q)) : ACTIONS
  const matchedPages = q ? PAGES.filter((p) => p.label.toLowerCase().includes(q)) : PAGES
  const matchedLeads = q
    ? leads.filter((l) => `${l.full_name} ${l.phone} ${l.client_type}`.toLowerCase().includes(q)).slice(0, 6)
    : []

  const results = [
    ...matchedActions.map((a) => ({ type: 'action' as const, ...a })),
    ...matchedPages.map((p) => ({ type: 'page' as const, ...p })),
    ...matchedLeads.map((l) => ({ type: 'lead' as const, ...l })),
  ]

  const go = useCallback((r: any, sub?: 'note' | 'schedule') => {
    setOpen(false)
    if (r.type === 'lead') router.push(`/admin/leads/${r.id}${sub ? `?focus=${sub}` : ''}`)
    else router.push(r.href)
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

              {matchedActions.length > 0 && (
                <div>
                  <p className="px-4 py-1 text-[10px] font-bold text-gray-300 uppercase tracking-widest">Quick Actions</p>
                  {results.filter((r) => r.type === 'action').map((r: any) => {
                    const Icon = r.icon
                    const idx = results.indexOf(r)
                    return (
                      <button key={r.href} type="button" onClick={() => go(r)} onMouseEnter={() => setActive(idx)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${active === idx ? 'bg-sky-50 text-navy-900' : 'text-navy-700'}`}>
                        <Icon size={16} className="text-wine" />{r.label}
                      </button>
                    )
                  })}
                </div>
              )}

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
                      <div key={r.id} onMouseEnter={() => setActive(idx)}
                        className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${active === idx ? 'bg-sky-50' : ''}`}>
                        <button type="button" onClick={() => go(r)} className="flex items-center gap-3 flex-1 text-left min-w-0">
                          <div className="w-7 h-7 rounded-full bg-navy-50 flex items-center justify-center shrink-0"><UserCircle size={15} className="text-navy-600" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-navy-900 truncate">{r.full_name}</p>
                            <p className="text-gray-400 text-xs">{r.client_type}</p>
                          </div>
                        </button>
                        <button type="button" onClick={() => go(r, 'note')} className="px-2 py-1 rounded-md text-[11px] font-semibold text-navy-600 hover:bg-navy-100 inline-flex items-center gap-1 shrink-0" aria-label={`Log note on ${r.full_name}`}><StickyNote size={12} /> Note</button>
                        <button type="button" onClick={() => go(r, 'schedule')} className="px-2 py-1 rounded-md text-[11px] font-semibold text-wine hover:bg-wine-50 inline-flex items-center gap-1 shrink-0" aria-label={`Schedule with ${r.full_name}`}><CalendarPlus size={12} /> Schedule</button>
                      </div>
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
