import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Temporarily Unavailable',
  robots: { index: false, follow: false },
}

export default function LockedPage() {
  return (
    <main className="min-h-screen bg-navy-900 flex items-center justify-center p-6 text-center">
      <div className="max-w-md">
        <p className="font-serif text-3xl font-bold text-white">Jordan Padierne</p>
        <p className="text-sky-400 text-xs font-medium tracking-widest uppercase mt-1">Real Estate · South Florida</p>

        <div className="mt-10">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-7 h-7 text-sky-300">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl font-bold text-white mb-3">We&apos;ll be right back</h1>
          <p className="text-navy-200 leading-relaxed">
            The site is temporarily offline for scheduled maintenance. Please check back soon.
          </p>
        </div>

        <p className="text-navy-400 text-xs mt-10">© Jordan Padierne · eXp Realty</p>
      </div>
    </main>
  )
}
