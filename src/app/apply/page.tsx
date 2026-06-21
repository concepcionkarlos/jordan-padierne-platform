import type { Metadata } from 'next'
import ApplyContent from '@/components/apply/ApplyContent'

export const metadata: Metadata = {
  title: 'Rental Application — Jordan Padierne, Miami Realtor',
  description:
    'Apply to rent with Miami Realtor Jordan Padierne. A fast, secure online rental application — applicant info, employment, references. Hablamos Español. Call 305-799-6973.',
  alternates: { canonical: 'https://jordanpadierne.com/apply' },
}

export default function ApplyPage() {
  return <ApplyContent />
}
