export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { safeQuery } from '@/lib/db'
import { formatRelativeTime, formatPhone, getPipelineStageLabel, getPipelineStageColor } from '@/lib/utils'
import { UserCircle, Phone, Mail, MapPin } from 'lucide-react'

// Contacts = your full address book: everyone who's ever reached out, sourced
// straight from your leads (the single place people are captured). The Leads tab
// is your active working pipeline; this is the rolodex for quick lookup + call.
async function getContacts(): Promise<any[]> {
  return safeQuery(
    (db) => db
      .from('leads')
      .select('id, full_name, email, phone, client_type, preferred_area, pipeline_stage, status, created_at')
      .order('created_at', { ascending: false })
      .limit(500),
    []
  )
}

export default async function ContactsPage() {
  const contacts = await getContacts()
  const clients = contacts.filter((c) => c.status === 'closed').length

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-navy-900">Contacts</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'} from your leads
          {clients > 0 && <> · {clients} {clients === 1 ? 'client' : 'clients'}</>}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <UserCircle size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No contacts yet.</p>
            <p className="text-gray-300 text-xs mt-1">Everyone who contacts you through your site appears here automatically.</p>
          </div>
        )}
        {contacts.map((contact) => {
          const isClient = contact.status === 'closed'
          return (
            <div key={contact.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-card hover:border-sky-200 transition-all">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-navy-50 flex items-center justify-center shrink-0">
                  <UserCircle size={20} className="text-navy-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/admin/leads/${contact.id}`} className="font-semibold text-navy-900 text-sm hover:text-wine transition-colors truncate block">
                    {contact.full_name}
                  </Link>
                  <p className="text-gray-400 text-xs">{contact.client_type ?? 'Client'}</p>
                </div>
                <span className={`badge text-xs shrink-0 ${isClient ? 'bg-green-50 text-green-600' : getPipelineStageColor(contact.pipeline_stage)}`}>
                  {isClient ? '✓ Client' : getPipelineStageLabel(contact.pipeline_stage)}
                </span>
              </div>
              <div className="space-y-2 text-xs">
                {contact.phone && (
                  <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-gray-500 hover:text-navy-900 transition-colors">
                    <Phone size={12} className="text-sky-400" />{formatPhone(contact.phone)}
                  </a>
                )}
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-gray-500 hover:text-navy-900 transition-colors break-all">
                    <Mail size={12} className="text-sky-400 shrink-0" />{contact.email}
                  </a>
                )}
                {contact.preferred_area && (
                  <p className="flex items-center gap-2 text-gray-400">
                    <MapPin size={12} className="text-sky-400 shrink-0" />{contact.preferred_area}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <p className="text-gray-300 text-xs">{formatRelativeTime(contact.created_at)}</p>
                <Link href={`/admin/leads/${contact.id}`} className="text-sky-500 text-xs font-semibold hover:text-sky-600">Open →</Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
