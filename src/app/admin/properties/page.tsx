export const dynamic = 'force-dynamic'
import { createServiceClient } from '@/lib/supabase'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import { Building2, Plus } from 'lucide-react'

async function getProperties() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)
  return data ?? []
}

const statusColors: Record<string, string> = {
  available: 'bg-green-50 text-green-600',
  pending: 'bg-orange-50 text-orange-600',
  sold: 'bg-gray-100 text-gray-500',
  'off-market': 'bg-navy-50 text-navy-500',
}

export default async function AdminPropertiesPage() {
  const properties = await getProperties()

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy-900">Properties</h1>
          <p className="text-gray-500 text-sm mt-0.5">{properties.length} listings</p>
        </div>
        <button className="btn-primary text-sm px-4 py-2.5">
          <Plus size={15} /> Add Property
        </button>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Building2 size={40} className="text-gray-200 mx-auto mb-4" />
          <h3 className="font-serif text-lg font-bold text-navy-900 mb-2">No Properties Yet</h3>
          <p className="text-gray-400 text-sm mb-6">Add your first property listing to start showcasing to clients.</p>
          <button className="btn-primary">
            <Plus size={16} /> Add First Property
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Property</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Price</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Details</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden lg:table-cell">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {properties.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-navy-900 text-sm">{p.title}</p>
                      <p className="text-gray-400 text-xs">{p.city}, {p.state} · {p.type}</p>
                      <div className="flex gap-2 mt-1">
                        {p.is_pre_construction && (
                          <span className="badge bg-wine-50 text-wine text-xs">Pre-Construction</span>
                        )}
                        {p.featured && (
                          <span className="badge bg-yellow-50 text-yellow-600 text-xs">Featured</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-navy-900">{formatCurrency(p.price)}</p>
                      {p.hoa_fee && <p className="text-gray-400 text-xs">HOA: {formatCurrency(p.hoa_fee)}/mo</p>}
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <p className="text-gray-500 text-xs">
                        {p.bedrooms && `${p.bedrooms} bd`}{p.bathrooms && ` · ${p.bathrooms} ba`}
                        {p.sqft && ` · ${p.sqft.toLocaleString()} sqft`}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge text-xs ${statusColors[p.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-gray-400 text-xs">{formatRelativeTime(p.created_at)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
