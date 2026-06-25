import Link from 'next/link'

// Branded 404 — replaces Next's default not-found page.
export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <p className="font-serif text-2xl font-bold text-white">Jordan Padierne</p>
        <p className="text-sky-400 text-xs font-medium tracking-widest uppercase mt-1 mb-6">Realtor · South Florida</p>
        <div className="bg-white rounded-3xl shadow-premium p-8">
          <p className="font-serif text-5xl font-bold text-navy-900 mb-1">404</p>
          <h1 className="font-serif text-xl font-bold text-navy-900 mb-2">Page not found</h1>
          <p className="text-gray-500 text-sm mb-6">That page doesn’t exist or has moved.</p>
          <Link href="/" className="btn-primary w-full justify-center">Back to home</Link>
        </div>
      </div>
    </div>
  )
}
