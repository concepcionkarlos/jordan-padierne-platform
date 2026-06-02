export const dynamic = 'force-dynamic'
import { createServiceClient } from '@/lib/supabase'
import { formatRelativeTime, getStatusColor } from '@/lib/utils'
import { MessageSquare, Phone, Mail } from 'lucide-react'

async function getMessages() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)
  return data ?? []
}

const typeLabels: Record<string, string> = {
  contact: 'General Contact',
  buyer_qualification: 'Buyer Form',
  investor_inquiry: 'Investor',
  pre_construction_interest: 'Pre-Construction',
  showing_request: 'Showing Request',
  open_house: 'Open House',
}

const typeColors: Record<string, string> = {
  contact: 'bg-sky-50 text-sky-600',
  buyer_qualification: 'bg-blue-50 text-blue-600',
  investor_inquiry: 'bg-purple-50 text-purple-600',
  pre_construction_interest: 'bg-wine-50 text-wine',
  showing_request: 'bg-orange-50 text-orange-600',
  open_house: 'bg-green-50 text-green-600',
}

export default async function MessagesPage() {
  const messages = await getMessages()
  const unread = messages.filter((m) => m.status === 'unread').length

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-navy-900">Messages</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {unread > 0 ? (
            <span className="text-wine font-semibold">{unread} unread</span>
          ) : 'All messages read'} · {messages.length} total
        </p>
      </div>

      {/* Filter tabs (visual only — filter via Supabase in production) */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {['All', 'Unread', 'Contact', 'Buyer Form', 'Investor', 'Pre-Construction', 'Showing'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              tab === 'All' ? 'bg-navy-900 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-navy-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Messages list */}
      <div className="space-y-3">
        {messages.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <MessageSquare size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No messages yet. They will appear here when website forms are submitted.</p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
              msg.status === 'unread' ? 'border-wine-100 shadow-wine-50/50' : 'border-gray-100'
            }`}
          >
            <div className="p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  {msg.status === 'unread' && (
                    <div className="w-2 h-2 rounded-full bg-wine shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-navy-900 text-sm">{msg.full_name}</p>
                      <span className={`badge text-xs ${typeColors[msg.type] ?? 'bg-gray-100 text-gray-600'}`}>
                        {typeLabels[msg.type] ?? msg.type}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5">{msg.subject}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`badge text-xs ${getStatusColor(msg.status)}`}>{msg.status}</span>
                  <span className="text-gray-300 text-xs">{formatRelativeTime(msg.created_at)}</span>
                </div>
              </div>

              {/* Contact */}
              <div className="flex gap-4 mb-3">
                {msg.phone && (
                  <a href={`tel:${msg.phone}`} className="flex items-center gap-1.5 text-xs text-sky-500 hover:text-sky-600">
                    <Phone size={11} />{msg.phone}
                  </a>
                )}
                <a href={`mailto:${msg.email}`} className="flex items-center gap-1.5 text-xs text-sky-500 hover:text-sky-600">
                  <Mail size={11} />{msg.email}
                </a>
              </div>

              {/* Body */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-600 text-xs leading-relaxed whitespace-pre-wrap">{msg.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
