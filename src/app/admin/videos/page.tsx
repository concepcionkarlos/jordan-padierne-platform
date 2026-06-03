export const dynamic = 'force-dynamic'
import { safeQuery } from '@/lib/db'
import VideosManager from '@/components/admin/VideosManager'

async function getVideos(): Promise<any[]> {
  return safeQuery((db) => db.from('videos').select('*').order('created_at', { ascending: false }).limit(100), [])
}

export default async function AdminVideosPage() {
  const videos = await getVideos()
  return (
    <div className="p-6 lg:p-8">
      <VideosManager initial={videos} />
    </div>
  )
}
