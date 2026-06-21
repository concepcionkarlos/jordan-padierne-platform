import type { Metadata } from 'next'
import UnsubscribeConfirm from '@/components/UnsubscribeConfirm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Unsubscribe — Jordan Padierne',
  robots: { index: false, follow: false },
}

export default function UnsubscribePage({ searchParams }: { searchParams: { token?: string } }) {
  return (
    <main className="min-h-screen bg-navy-900 flex items-center justify-center p-6 text-center">
      <div className="max-w-md">
        <p className="font-serif text-2xl font-bold text-white">Jordan Padierne</p>
        <p className="text-sky-400 text-xs font-medium tracking-widest uppercase mt-1 mb-10">Real Estate · South Florida</p>
        <UnsubscribeConfirm token={searchParams.token ?? ''} />
      </div>
    </main>
  )
}
