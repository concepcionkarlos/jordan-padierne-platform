'use client'

import { useEffect } from 'react'

// Branded fallback for any unhandled error in a route segment — replaces Next's
// unstyled default error page on this luxury brand site.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <p className="font-serif text-2xl font-bold text-white">Jordan Padierne</p>
        <p className="text-sky-400 text-xs font-medium tracking-widest uppercase mt-1 mb-6">Realtor · South Florida</p>
        <div className="bg-white rounded-3xl shadow-premium p-8">
          <p className="text-4xl mb-3">⚠️</p>
          <h1 className="font-serif text-xl font-bold text-navy-900 mb-2">Something went wrong</h1>
          <p className="text-gray-500 text-sm mb-6">We hit an unexpected error. Try again, or reach Jordan directly and he’ll help you right away.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="button" onClick={reset} className="btn-primary flex-1 justify-center">Try again</button>
            <a href="tel:+13057996973" className="btn-wine flex-1 justify-center">Call Jordan</a>
          </div>
        </div>
      </div>
    </div>
  )
}
