import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Phone } from 'lucide-react'
import SocialIcons from '@/components/ui/SocialIcons'
import Reveal from '@/components/ui/Reveal'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-navy-900">
      {/* Background Image with slow Ken Burns zoom */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 animate-ken-burns">
          <Image
            src="/images/jordan-hero.png"
            alt="Jordan Padierne — South Florida Realtor"
            fill
            priority
            quality={90}
            className="object-cover object-center"
            style={{ objectPosition: '60% center' }}
          />
        </div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/90 via-navy-900/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 via-transparent to-navy-900/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 container-max section-padding pt-28 pb-20 lg:pt-36 lg:pb-28">
        <div className="max-w-2xl">
          {/* Badge */}
          <Reveal variant="fade">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span className="text-white/90 text-sm font-medium">eXp Realty · Miami-Dade County</span>
            </div>
          </Reveal>

          {/* Headline */}
          <Reveal delay={100}>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 text-balance">
              Helping Families, Investors, and International Buyers Find the Right{' '}
              <span className="text-gradient-animate">Real Estate Opportunities</span>{' '}
              in South Florida.
            </h1>
          </Reveal>

          {/* Subheadline */}
          <Reveal delay={220}>
            <p className="text-white/75 text-lg leading-relaxed mb-10 max-w-xl">
              Trusted guidance, strong negotiation, and a family-oriented real estate experience
              in Miami-Dade, Brickell, Doral, Coral Gables, Downtown, and Hialeah.
            </p>
          </Reveal>

          {/* CTAs */}
          <Reveal delay={340}>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact#consultation" className="btn-wine cta-shine pulse-glow text-base px-8 py-4 shadow-premium">
                Schedule a Consultation
                <ArrowRight size={18} />
              </Link>
              <Link href="/properties" className="btn-outline-white text-base px-8 py-4">
                Explore Properties
              </Link>
            </div>
          </Reveal>

          {/* Trust badges */}
          <Reveal delay={460}>
            <div className="flex flex-wrap items-center gap-6 mt-12 pt-8 border-t border-white/15">
              <div className="text-center">
                <p className="text-white font-bold text-2xl font-serif">English</p>
                <p className="text-white/60 text-xs mt-0.5">Español</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <p className="text-white font-semibold text-sm">Pre-Construction</p>
                <p className="text-white/60 text-xs">Specialist</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <p className="text-white font-semibold text-sm">6 Key Areas</p>
                <p className="text-white/60 text-xs">South Florida</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <a
                href="tel:+13057996973"
                className="flex items-center gap-2 text-white hover:text-sky-300 transition-colors"
              >
                <Phone size={16} className="text-sky-400" />
                <span className="font-semibold text-sm">305-799-6973</span>
              </a>
              <div className="w-px h-10 bg-white/20" />
              <SocialIcons variant="light" />
            </div>
          </Reveal>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 animate-bounce">
        <div className="w-px h-8 bg-white/30" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
      </div>
    </section>
  )
}
