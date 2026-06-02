import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Home, TrendingUp, Globe, Building2, Star } from 'lucide-react'

const services = [
  {
    icon: Home,
    title: 'Buyers',
    tagline: 'Find Your Perfect Home',
    description:
      'Whether it\'s your first home or your forever home, Jordan guides you through every step — from search to closing — with patience and expertise.',
    href: '/buy',
    image: '/images/jordan-house.png',
    color: 'from-sky-500/20 to-sky-500/5',
  },
  {
    icon: TrendingUp,
    title: 'Investors',
    tagline: 'Build Your Portfolio',
    description:
      'Jordan helps investors identify high-potential properties, analyze ROI, and position themselves for long-term growth in South Florida real estate.',
    href: '/investors',
    image: '/images/jordan-terrace.png',
    color: 'from-navy-500/20 to-navy-500/5',
  },
  {
    icon: Globe,
    title: 'International Clients',
    tagline: 'Your Gateway to Miami',
    description:
      'Bilingual and experienced with international transactions, Jordan makes buying in South Florida simple, secure, and strategic for global clients.',
    href: '/contact',
    image: '/images/jordan-phone.png',
    color: 'from-wine/20 to-wine/5',
  },
  {
    icon: Building2,
    title: 'Pre-Construction',
    tagline: 'Enter Early. Win Big.',
    description:
      'Get access to the best pre-construction projects in Miami at the right stage — before prices rise and units sell out.',
    href: '/pre-construction',
    image: '/images/jordan-modern.png',
    color: 'from-sky-400/20 to-sky-400/5',
  },
  {
    icon: Star,
    title: 'Luxury Properties',
    tagline: 'Premium Real Estate',
    description:
      'From Brickell penthouses to waterfront estates in Coral Gables, Jordan has the expertise and network to serve luxury buyers with discretion.',
    href: '/properties',
    image: '/images/jordan-luxury.png',
    color: 'from-navy-600/20 to-navy-600/5',
  },
]

export default function ServicesSection() {
  return (
    <section className="py-20 lg:py-28 bg-light-gray">
      <div className="container-max section-padding">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-3">
            What I Do
          </p>
          <h2 className="section-title mb-4">
            Services Tailored{' '}
            <span className="text-sky-500">to Every Client</span>
          </h2>
          <p className="section-subtitle">
            From first-time buyers to seasoned investors — Jordan has the expertise and
            dedication to guide every type of client toward the right decision.
          </p>
        </div>

        {/* Top 3 cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {services.slice(0, 3).map((service) => {
            const Icon = service.icon
            return (
              <Link
                key={service.title}
                href={service.href}
                className="group card relative overflow-hidden"
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-b ${service.color}`} />
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
                    <Icon size={18} className="text-navy-700" />
                  </div>
                </div>
                {/* Content */}
                <div className="p-6">
                  <p className="text-sky-500 text-xs font-bold uppercase tracking-widest mb-1">
                    {service.tagline}
                  </p>
                  <h3 className="font-serif text-xl font-bold text-navy-900 mb-2 group-hover:text-navy-700">
                    {service.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{service.description}</p>
                  <span className="flex items-center gap-1.5 text-navy-700 font-semibold text-sm group-hover:gap-2.5 transition-all">
                    Learn More <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Bottom 2 wide cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.slice(3).map((service) => {
            const Icon = service.icon
            return (
              <Link
                key={service.title}
                href={service.href}
                className="group card relative overflow-hidden flex flex-col sm:flex-row"
              >
                {/* Image */}
                <div className="relative h-48 sm:h-auto sm:w-48 shrink-0 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                {/* Content */}
                <div className="p-6 flex flex-col justify-center">
                  <div className="w-9 h-9 rounded-xl bg-navy-50 flex items-center justify-center mb-3">
                    <Icon size={16} className="text-navy-700" />
                  </div>
                  <p className="text-sky-500 text-xs font-bold uppercase tracking-widest mb-1">
                    {service.tagline}
                  </p>
                  <h3 className="font-serif text-xl font-bold text-navy-900 mb-2">{service.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-3">{service.description}</p>
                  <span className="flex items-center gap-1.5 text-navy-700 font-semibold text-sm group-hover:gap-2.5 transition-all">
                    Learn More <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
