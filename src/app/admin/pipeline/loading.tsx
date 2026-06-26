import Skeleton from '@/components/ui/Skeleton'

// 7.5 — Pipeline board skeleton: header + value cards, then columns of deal cards.
export default function PipelineLoading() {
  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-52" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-14 w-36 rounded-xl" />
          <Skeleton className="h-14 w-36 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, c) => (
          <div key={c} className="space-y-3">
            <Skeleton className="h-5 w-24" />
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
        ))}
      </div>
    </div>
  )
}
