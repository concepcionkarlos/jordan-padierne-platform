'use client'

import Link from 'next/link'
import { Phone, Mail, MapPin, Shield } from 'lucide-react'
import { SOCIAL_LINKS, CONTACT_INFO } from '@/lib/social'
import SocialIcons from '@/components/ui/SocialIcons'
import { useT } from '@/components/LanguageProvider'

const footerLinks = {
  Services: [
    { href: '/buy', k: 'nav.buy' },
    { href: '/home-value', k: 'nav.sell' },
    { href: '/pre-construction', k: 'nav.preconstruction' },
    { href: '/investors', k: 'nav.investors' },
    { href: '/properties', k: 'nav.properties' },
  ],
  Company: [
    { href: '/about', k: 'nav.about' },
    { href: '/contact', k: 'nav.contact' },
    { href: '/contact#consultation', k: 'nav.schedule' },
  ],
}

const areas = ['Miami-Dade', 'Brickell', 'Downtown', 'Doral', 'Coral Gables', 'Hialeah']

export default function Footer() {
  const { t } = useT()
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
            <p className="text-navy-200 text-sm leading-relaxed mb-5">
              {t('footer.tagline')}
            </p>
            <div className="space-y-3 mb-6">
              <a
                href={CONTACT_INFO.phoneHref}
                className="flex items-center gap-2.5 text-sm text-navy-200 hover:text-white transition-colors group"
              >
                <Phone size={14} className="text-sky-400 group-hover:text-sky-300" />
                {CONTACT_INFO.phone}
              </a>
              <a
                href={CONTACT_INFO.emailHref}
                className="flex items-center gap-2.5 text-sm text-navy-200 hover:text-white transition-colors group"
              >
                <Mail size={14} className="text-sky-400 group-hover:text-sky-300" />
                {CONTACT_INFO.email}
              </a>
              <div className="flex items-start gap-2.5 text-sm text-navy-200">
                <MapPin size={14} className="text-sky-400 mt-0.5 shrink-0" />
                Miami-Dade County, Florida
              </div>
            </div>

            {/* Social Icons */}
            <SocialIcons variant="footer" />
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">{t('footer.services')}</h4>
            <ul className="space-y-2.5">
              {footerLinks.Services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-navy-300 hover:text-white text-sm transition-colors"
                  >
                    {t(link.k)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">{t('footer.company')}</h4>
            <ul className="space-y-2.5">
              {footerLinks.Company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-navy-300 hover:text-white text-sm transition-colors"
                  >
                    {t(link.k)}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Instagram highlight */}
            <div className="mt-8">
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">{t('footer.followJordan')}</h4>
              <a
                href={SOCIAL_LINKS.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 group"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <InstagramIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white text-xs font-semibold group-hover:text-sky-300 transition-colors">
                    @jordanpadiernerealtor
                  </p>
                  <p className="text-navy-400 text-xs">Instagram</p>
                </div>
              </a>
            </div>
          </div>

          {/* Areas */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">{t('footer.areasServed')}</h4>
            <ul className="space-y-2.5">
              {areas.map((area) => (
                <li key={area} className="text-navy-300 text-sm">
                  {area}
                </li>
              ))}
            </ul>

            {/* WhatsApp CTA */}
            <div className="mt-8">
              <a
                href={CONTACT_INFO.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4" />
                {t('footer.whatsappCta')}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-navy-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-navy-400 text-xs text-center sm:text-left">
            <p>© {new Date().getFullYear()} Jordan Padierne. {t('footer.rights')}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Shield size={11} className="text-sky-500" />
              <span>License: SL3641062 · eXp Realty · English / Español</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <SocialIcons variant="minimal" />
          </div>
        </div>
      </div>
    </footer>
  )
}

// Inline SVG icons (no extra deps)
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}
