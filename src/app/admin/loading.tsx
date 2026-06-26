import Skeleton from '@/components/ui/Skeleton'

// 7.5 — replaces the old spinner. Generic admin content skeleton: serves the
// Dashboard and is the graceful fallback for any admin route without its own
// loading.tsx. The sidebar layout persists; only the content region is replaced
// while the server component fetches.
export default function AdminLoading() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
