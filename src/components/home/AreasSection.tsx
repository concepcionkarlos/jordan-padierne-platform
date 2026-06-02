import { MapPin } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'

const areas = [
  {
    name: 'Brickell',
    description: 'Miami\'s financial district — luxury high-rises, waterfront living, and world-class dining.',
    highlight: 'Urban Luxury',
    gradient: 'from-navy-900 to-navy-700',
  },
  {
    name: 'Downtown Miami',
    description: 'The heart of the Magic City — vibrant energy, stunning bay views, and modern condos.',
    highlight: 'City Living',
    gradient: 'from-sky-700 to-sky-500',
  },
  {
    name: 'Doral',
    description: 'Family-friendly community with excellent schools, parks, and a growing business hub.',
    highlight: 'Family Favorite',
    gradient: 'from-navy-800 to-navy-600',
  },
  {
    name: 'Coral Gables',
    description: 'Elegant tree-lined streets, Mediterranean architecture, and top-ranked schools.',
    highlight: 'Classic Elegance',
    gradient: 'from-wine-700 to-wine-500',
  },
  {
    name: 'Hialeah',
    description: 'Authentic Miami culture, affordable entry points, and a strong rental market.',
    highlight: 'Value & Culture',
    gradient: 'from-navy-700 to-sky-600',
  },
  {
    name: 'Miami-Dade',
    description: 'The broader county — diverse communities, from luxury estates to investment opportunities.',
    highlight: 'All of South Florida',
    gradient: 'from-sky-600 to-navy-700',
  },
]

export default function AreasSection() {
  return (
    <section className="py-20 lg:py-28 bg-light-gray">
      <div className="container-max section-padding">
        {/* Header */}
        <Reveal className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-3">
            Where I Work
          </p>
          <h2 className="section-title mb-4">
            6 Key Areas of{' '}
            <span className="text-sky-500">South Florida</span>
          </h2>
          <p className="section-subtitle">
            Deep local knowledge across Miami-Dade County — from luxury urban living in
            Brickell to family communities in Doral and cultural roots in Hialeah.
          </p>
        </Reveal>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {areas.map((area, i) => (
            <Reveal
              key={area.name}
              variant="scale"
              delay={(i % 3) * 100}
              className="group relative rounded-2xl overflow-hidden cursor-default hover-lift"
            >
              {/* Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${area.gradient}`} />

              {/* Pattern overlay */}
              <div className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />

              <div className="relative p-7">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                    <MapPin size={18} className="text-white" />
                  </div>
                  <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {area.highlight}
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-white mb-2">{area.name}</h3>
                <p className="text-white/75 text-sm leading-relaxed">{area.description}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm mb-4">
            Not sure which area is right for you? Let&apos;s talk.
          </p>
          <a href="tel:+13057996973" className="btn-primary inline-flex">
            <MapPin size={16} />
            Call Jordan — 305-799-6973
          </a>
        </div>
      </div>
    </section>
  )
}
