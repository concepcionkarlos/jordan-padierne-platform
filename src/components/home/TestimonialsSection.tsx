import { Star, Quote } from 'lucide-react'
import { safeQuery } from '@/lib/db'
import Reveal from '@/components/ui/Reveal'

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
        <Reveal className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-3">Client Stories</p>
          <h2 className="section-title mb-4">
            What Clients Say About{' '}
            <span className="text-sky-500">Working With Jordan</span>
          </h2>
          <p className="section-subtitle">Real experiences from buyers, investors, and families across South Florida.</p>
        </Reveal>

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
