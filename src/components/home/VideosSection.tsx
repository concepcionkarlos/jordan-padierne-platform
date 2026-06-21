import { safeQuery } from '@/lib/db'
import { youTubeEmbed } from '@/lib/youtube'
import Reveal from '@/components/ui/Reveal'
import SectionHeader from '@/components/home/SectionHeader'
import VideosConnect from '@/components/home/VideosConnect'

async function getVideos(): Promise<any[]> {
  return safeQuery((db) => db.from('videos').select('*').eq('featured', true).order('sort_order', { ascending: true }).limit(6), [])
}

export default async function VideosSection() {
  const videos = await getVideos()

  return (
    <section className="py-20 lg:py-28 bg-light-gray">
      <div className="container-max section-padding">
        <SectionHeader eyebrowKey="videos.eyebrow" titleKey="videos.title" highlightKey="videos.highlight" subtitleKey="videos.subtitle" />

        {videos.length > 0 && (
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
        )}

        <VideosConnect hasVideos={videos.length > 0} />
      </div>
    </section>
  )
}
