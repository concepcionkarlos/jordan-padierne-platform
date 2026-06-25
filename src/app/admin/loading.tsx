// Light loader shown inside the admin shell during page transitions — keeps the
// sidebar visible and avoids flashing the full-screen public loader.
export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Loading…</p>
      </div>
    </div>
  )
}
