// Branded full-screen loader for public route transitions/suspense.
// Admin routes have their own lighter loading.tsx so they don't flash this.
export default function Loading() {
  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-sky-400/30 border-t-sky-400 rounded-full animate-spin mx-auto mb-4" />
        <p className="font-serif text-white font-bold">Jordan Padierne</p>
        <p className="text-sky-400 text-xs tracking-widest uppercase mt-1">Loading…</p>
      </div>
    </div>
  )
}
