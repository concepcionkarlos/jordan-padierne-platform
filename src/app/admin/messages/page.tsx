export const dynamic = 'force-dynamic'
import { safeQuery } from '@/lib/db'
import MessagesInbox from '@/components/admin/MessagesInbox'

async function getMessages(): Promise<any[]> {
  // Embed the linked lead (if any) so the inbox can show "which lead" + deep-link.
  return safeQuery(
    (db) => db.from('messages').select('*, leads(id, full_name, pipeline_stage)').order('created_at', { ascending: false }).limit(100),
    []
  )
}

export default async function MessagesPage() {
  const messages = await getMessages()
  return <MessagesInbox initial={messages} />
}
