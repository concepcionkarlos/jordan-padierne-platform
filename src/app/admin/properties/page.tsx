export const dynamic = 'force-dynamic'
import { safeQuery } from '@/lib/db'
import PropertyManager from '@/components/admin/PropertyManager'

async function getProperties(): Promise<any[]> {
  return safeQuery((db) => db.from('properties').select('*').order('created_at', { ascending: false }).limit(100), [])
}

export default async function AdminPropertiesPage() {
  const properties = await getProperties()
  return (
    <div className="p-6 lg:p-8">
      <PropertyManager initial={properties} />
    </div>
  )
}
