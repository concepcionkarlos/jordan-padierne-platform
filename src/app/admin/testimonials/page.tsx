export const dynamic = 'force-dynamic'
import { safeQuery } from '@/lib/db'
import TestimonialsManager from '@/components/admin/TestimonialsManager'

async function getTestimonials(): Promise<any[]> {
  return safeQuery((db) => db.from('testimonials').select('*').order('created_at', { ascending: false }).limit(100), [])
}

export default async function AdminTestimonialsPage() {
  const items = await getTestimonials()
  return (
    <div className="p-6 lg:p-8">
      <TestimonialsManager initial={items} />
    </div>
  )
}
