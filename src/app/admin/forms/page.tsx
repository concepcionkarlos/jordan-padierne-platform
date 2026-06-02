export const dynamic = 'force-dynamic'
import { safeQuery } from '@/lib/db'
import { formatRelativeTime } from '@/lib/utils'
import { FileText } from 'lucide-react'

async function getFormSubmissions(): Promise<any[]> {
  return safeQuery(
    (db) => db.from('form_submissions').select('*').order('created_at', { ascending: false }).limit(100),
    []
  )
}

const typeLabels: Record<string, string> = {
  contact: 'Contact Form',
  buyer_qualification: 'Buyer Qualification',
  investor_inquiry: 'Investor Inquiry',
  pre_construction_interest: 'Pre-Construction',
  showing_request: 'Showing Request',
  open_house: 'Open House Check-In',
}

const typeColors: Record<string, string> = {
  contact: 'bg-sky-50 text-sky-600',
  buyer_qualification: 'bg-blue-50 text-blue-600',
  investor_inquiry: 'bg-purple-50 text-purple-600',
  pre_construction_interest: 'bg-red-50 text-red-700',
  showing_request: 'bg-orange-50 text-orange-600',
  open_house: 'bg-green-50 text-green-600',
}

export default async function FormsPage() {
  const submissions = await getFormSubmissions()

  const counts = (submissions as any[]).reduce((acc: Record<string, number>, s) => {
    acc[s.form_type] = (acc[s.form_type] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-navy-900">Form Submissions</h1>
        <p className="text-gray-500 text-sm mt-0.5">{submissions.length} total submissions</p>
      </div>

      {/* Counts by type */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {Object.entries(typeLabels).map(([type, label]) => (
          <div key={type} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="font-serif text-2xl font-bold text-navy-900">{counts[type] ?? 0}</p>
            <p className="text-gray-400 text-xs mt-1 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Form Type</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Email</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden lg:table-cell">Phone</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <FileText size={28} className="text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">No form submissions yet.</p>
                  </td>
                </tr>
              )}
              {(submissions as any[]).map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-navy-900 text-sm">{sub.data?.full_name ?? '—'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`badge text-xs ${typeColors[sub.form_type] ?? 'bg-gray-100 text-gray-600'}`}>
                      {typeLabels[sub.form_type] ?? sub.form_type}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="text-gray-500 text-xs">{sub.data?.email ?? '—'}</span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className="text-gray-500 text-xs">{sub.data?.phone ?? '—'}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-gray-400 text-xs">{formatRelativeTime(sub.created_at)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
