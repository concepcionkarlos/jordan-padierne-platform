import { safeQuery } from '@/lib/db'
import { youTubeEmbed } from '@/lib/youtube'
import { SOCIAL_LINKS } from '@/lib/social'
import Reveal from '@/components/ui/Reveal'

async function getVideos(): Promise<any[]> {
  return safeQuery((db) => db.from('videos').select('*').eq('featured', true).order('sort_order', { ascending: true }).limit(6), [])
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

export default async function VideosSection() {
  const videos = await getVideos()

  return (
    <section className="py-20 lg:py-28 bg-light-gray">
      <div className="container-max section-padding">
        <Reveal className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-3">Watch & Learn</p>
          <h2 className="section-title mb-4">
            Get to Know Jordan on{' '}
            <span className="text-sky-500">Video</span>
          </h2>
          <p className="section-subtitle">
            Market updates, property tours, and real estate tips — straight from Jordan.
          </p>
        </Reveal>

        {videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {videos.map((v, i) => (
              <Reveal key={v.id} variant="up" delay={(i % 3) * 110} className="card overflow-hidden hover-lift">
                <div className="relative aspect-video bg-navy-900">
                  <iframe
                    src={youTubeEmbed(v.youtube_id)}
                    title={v.title || 'Jordan Padierne video'}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
                {v.title && <div className="p-4"><p className="font-semibold text-navy-900 text-sm">{v.title}</p></div>}
              </Reveal>
            ))}
          </div>
        ) : (
          /* No videos yet → prominent subscribe CTA so the section never looks empty */
          <Reveal className="max-w-2xl mx-auto bg-white rounded-3xl shadow-card p-10 text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5 text-red-600">
              <YouTubeIcon />
            </div>
            <h3 className="font-serif text-2xl font-bold text-navy-900 mb-2">New videos coming soon</h3>
            <p className="text-gray-500 mb-6">Subscribe to Jordan&apos;s channel for market updates, property tours, and tips.</p>
          </Reveal>
        )}

        {/* Connect CTAs — YouTube + Instagram */}
        <Reveal className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={SOCIAL_LINKS.youtube.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-premium"
          >
            <YouTubeIcon /> Subscribe on YouTube
          </a>
          <a
            href={SOCIAL_LINKS.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-premium"
            style={{ background: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)' }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
            Follow on Instagram
          </a>
        </Reveal>
      </div>
    </section>
  )
}
