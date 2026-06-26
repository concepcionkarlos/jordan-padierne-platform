import { redirect } from 'next/navigation'

// "Contacts" is no longer a separate mental model. Everyone is captured as a
// Lead, and "Clients" is simply the closed-won slice of that one list. Old
// bookmarks to /admin/contacts keep working — they land on the filtered view.
export default function ContactsPage() {
  redirect('/admin/leads?stage=CLOSED')
}
