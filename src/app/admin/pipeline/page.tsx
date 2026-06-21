export const dynamic = 'force-dynamic'
import { safeQuery } from '@/lib/db'
import TipBanner from '@/components/admin/TipBanner'
import PipelineBoard from '@/components/admin/PipelineBoard'

async function getLeadsByStage(): Promise<any[]> {
  return safeQuery(
    (db) => db.from('leads').select('*').order('created_at', { ascending: false }),
    []
  )
}

export default async function PipelinePage() {
  const leads = await getLeadsByStage()

  return (
    <div>
      <div className="px-6 lg:px-8 pt-6 lg:pt-8">
        <TipBanner id="pipeline">
          💡 <strong>Drag a card</strong> between columns to move a deal — or use the stage dropdown on each card. When you mark a deal <strong>Closed</strong>, it counts toward your monthly goal &amp; commission and asks the client for a Google review.
        </TipBanner>
      </div>
      <PipelineBoard initial={leads} />
    </div>
  )
}
