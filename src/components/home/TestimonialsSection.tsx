import { Star, Quote } from 'lucide-react'
import { safeQuery } from '@/lib/db'
import Reveal from '@/components/ui/Reveal'
import SectionHeader from '@/components/home/SectionHeader'

async function getTestimonials(): Promise<any[]> {
  return safeQuery((db) => db.from('testimonials').select('*').eq('featured', true).order('sort_order', { ascending: true }).limit(9), [])
}

export default async function TestimonialsSection() {
  const testimonials = await getTestimonials()

  // Hide the whole section until Jordan adds real reviews — no fake testimonials.
  if (testimonials.length === 0) return null

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="container-max section-padding">
        <SectionHeader eyebrowKey="testimonials.eyebrow" titleKey="testimonials.title" highlightKey="testimonials.highlight" subtitleKey="testimonials.subtitle" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <Reveal key={t.id} variant="up" delay={(i % 3) * 110} className="relative p-7 rounded-2xl bg-light-gray border border-gray-100 hover-lift">
              <Quote size={32} className="text-sky-200 mb-4" />
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} size={15} className={s < t.rating ? 'text-amber-400' : 'text-gray-200'} fill="currentColor" />
                ))}
              </div>
              <p className="text-navy-700 text-sm leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-navy-900 flex items-center justify-center text-white font-serif font-bold text-sm">
                  {t.client_name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-navy-900 text-sm">{t.client_name}</p>
                  <p className="text-gray-400 text-xs">{t.client_role}{t.location ? ` · ${t.location}` : ''}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
