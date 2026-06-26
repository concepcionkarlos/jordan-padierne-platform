import Skeleton from '@/components/ui/Skeleton'

// 7.5 — Lead Workspace skeleton: back-link + name header, full-width coach, then
// the sticky context rail + main column layout the workspace itself uses.
export default function WorkspaceLoading() {
  return (
    <div className="p-6 lg:p-8">
      <Skeleton className="h-4 w-28 mb-6" />
      <div className="mb-8 space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="h-24 w-full rounded-2xl mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
