export const dynamic = 'force-dynamic'
import { safeQuery } from '@/lib/db'
import { formatRelativeTime, formatPhone } from '@/lib/utils'
import { UserCircle, Phone, Mail, Plus } from 'lucide-react'

async function getContacts(): Promise<any[]> {
  return safeQuery(
    (db) => db.from('contacts').select('*').order('created_at', { ascending: false }).limit(200),
    []
  )
}

export default async function ContactsPage() {
  const contacts = await getContacts()

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy-900">Contacts</h1>
          <p className="text-gray-500 text-sm mt-0.5">{contacts.length} contacts</p>
        </div>
        <button type="button" className="btn-primary text-sm px-4 py-2.5">
          <Plus size={15} /> Add Contact
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <UserCircle size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No contacts yet.</p>
            <p className="text-gray-300 text-xs mt-1">Contacts are created from leads.</p>
          </div>
        )}
        {(contacts as any[]).map((contact) => (
          <div key={contact.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-card hover:border-sky-200 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-navy-50 flex items-center justify-center">
                <UserCircle size={20} className="text-navy-600" />
              </div>
              <div>
                <p className="font-semibold text-navy-900 text-sm">{contact.full_name}</p>
                <p className="text-gray-400 text-xs">{contact.client_type ?? 'Client'}</p>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-gray-500 hover:text-navy-900 transition-colors">
                <Phone size={12} className="text-sky-400" />{formatPhone(contact.phone)}
              </a>
              <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-gray-500 hover:text-navy-900 transition-colors">
                <Mail size={12} className="text-sky-400" />{contact.email}
              </a>
              {contact.preferred_area && (
                <p className="text-gray-400">{contact.preferred_area}</p>
              )}
            </div>
            {contact.notes && (
              <p className="text-gray-400 text-xs mt-3 pt-3 border-t border-gray-50 line-clamp-2">{contact.notes}</p>
            )}
            <p className="text-gray-300 text-xs mt-3">{formatRelativeTime(contact.created_at)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
