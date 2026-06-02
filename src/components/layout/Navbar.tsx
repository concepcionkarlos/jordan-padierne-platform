'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Phone, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  {
    label: 'Services',
    children: [
      { href: '/buy', label: 'Buy a Home' },
      { href: '/pre-construction', label: 'Pre-Construction' },
      { href: '/investors', label: 'Investors' },
      { href: '/home-value', label: 'Sell — Home Value' },
    ],
  },
  { href: '/properties', label: 'Properties' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const pathname = usePathname()

  const isHome = pathname === '/'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navBg = isHome && !scrolled
    ? 'bg-transparent'
    : 'bg-white/95 backdrop-blur-md shadow-card border-b border-gray-100'

  const textColor = isHome && !scrolled ? 'text-white' : 'text-navy-900'
  const logoColor = isHome && !scrolled ? 'text-white' : 'text-navy-900'
  const logoSub = isHome && !scrolled ? 'text-white/70' : 'text-sky-500'

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        navBg
      )}
    >
      <div className="container-max section-padding">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex flex-col leading-tight group">
            <span className={cn('font-serif text-xl font-bold tracking-tight transition-colors', logoColor)}>
              Jordan Padierne
            </span>
            <span className={cn('text-xs font-medium tracking-widest uppercase transition-colors', logoSub)}>
              Realtor · eXp Realty
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.children ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  <button
                    className={cn(
                      'flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                      textColor,
                      'hover:bg-sky/10'
                    )}
                  >
                    {link.label}
                    <ChevronDown
                      size={14}
                      className={cn('transition-transform duration-200', servicesOpen && 'rotate-180')}
                    />
                  </button>
                  {servicesOpen && (
                    <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-premium border border-gray-100 overflow-hidden animate-fade-in">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-3 text-sm font-medium text-navy-700 hover:bg-sky-50 hover:text-navy-900 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href!}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                    textColor,
                    'hover:bg-sky/10',
                    pathname === link.href && 'font-semibold'
                  )}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* CTA + Phone */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="tel:+13057996973"
              className={cn(
                'flex items-center gap-1.5 text-sm font-medium transition-colors',
                isHome && !scrolled ? 'text-white/80 hover:text-white' : 'text-navy-600 hover:text-navy-900'
              )}
            >
              <Phone size={14} />
              305-799-6973
            </a>
            <Link
              href="/contact"
              className="btn-wine text-xs px-5 py-2.5"
            >
              Schedule Consultation
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={cn('lg:hidden p-2 rounded-lg transition-colors', textColor, 'hover:bg-white/10')}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl animate-slide-up">
          <div className="section-padding py-4 space-y-1">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label}>
                  <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {link.label}
                  </div>
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-6 py-2.5 text-sm font-medium text-navy-700 hover:bg-sky-50 rounded-lg"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href!}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'block px-4 py-2.5 text-sm font-medium rounded-lg text-navy-700 hover:bg-sky-50',
                    pathname === link.href && 'bg-sky-50 text-navy-900 font-semibold'
                  )}
                >
                  {link.label}
                </Link>
              )
            )}
            <div className="pt-4 border-t border-gray-100 space-y-2">
              <a
                href="tel:+13057996973"
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-navy-700"
              >
                <Phone size={14} />
                305-799-6973
              </a>
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="btn-wine w-full text-center text-sm"
              >
                Schedule Consultation
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
