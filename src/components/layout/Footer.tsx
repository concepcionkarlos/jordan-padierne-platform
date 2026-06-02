import Link from 'next/link'
import { Phone, Mail, MapPin, Shield } from 'lucide-react'

const footerLinks = {
  Services: [
    { href: '/buy', label: 'Buy a Home' },
    { href: '/pre-construction', label: 'Pre-Construction' },
    { href: '/investors', label: 'Investment Properties' },
    { href: '/properties', label: 'Search Properties' },
  ],
  Company: [
    { href: '/about', label: 'About Jordan' },
    { href: '/contact', label: 'Contact' },
    { href: '/contact#consultation', label: 'Schedule Consultation' },
  ],
}

const areas = ['Miami-Dade', 'Brickell', 'Downtown', 'Doral', 'Coral Gables', 'Hialeah']

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-white">
      <div className="container-max section-padding pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <p className="font-serif text-2xl font-bold text-white">Jordan Padierne</p>
              <p className="text-sky-400 text-xs font-medium tracking-widest uppercase mt-0.5">
                Realtor · eXp Realty
              </p>
            </div>
            <p className="text-navy-200 text-sm leading-relaxed mb-6">
              Helping buyers, investors, and international clients find the right real estate
              opportunities in South Florida.
            </p>
            <div className="space-y-3">
              <a
                href="tel:+13057996973"
                className="flex items-center gap-2.5 text-sm text-navy-200 hover:text-white transition-colors group"
              >
                <Phone size={14} className="text-sky-400 group-hover:text-sky-300" />
                305-799-6973
              </a>
              <a
                href="mailto:info@jordanpadierne.com"
                className="flex items-center gap-2.5 text-sm text-navy-200 hover:text-white transition-colors group"
              >
                <Mail size={14} className="text-sky-400 group-hover:text-sky-300" />
                info@jordanpadierne.com
              </a>
              <div className="flex items-start gap-2.5 text-sm text-navy-200">
                <MapPin size={14} className="text-sky-400 mt-0.5 shrink-0" />
                Miami-Dade County, Florida
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Services
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.Services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-navy-300 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.Company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-navy-300 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Areas Served
            </h4>
            <ul className="space-y-2.5">
              {areas.map((area) => (
                <li key={area} className="text-navy-300 text-sm">
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-navy-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-navy-400 text-xs text-center sm:text-left">
            <p>© {new Date().getFullYear()} Jordan Padierne. All rights reserved.</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Shield size={11} className="text-sky-500" />
              <span>License: SL3641062 · eXp Realty · English / Español</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-navy-500 hover:text-navy-300 text-xs transition-colors">
              Admin
            </Link>
            <span className="text-navy-600 text-xs">Privacy · Terms</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
