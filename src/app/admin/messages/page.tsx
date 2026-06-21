export const dynamic = 'force-dynamic'
import { safeQuery } from '@/lib/db'
import MessagesInbox from '@/components/admin/MessagesInbox'

async function getMessages(): Promise<any[]> {
  return safeQuery(
    (db) => db.from('messages').select('*').order('created_at', { ascending: false }).limit(100),
    []
  )
}

export default async function MessagesPage() {
  const messages = await getMessages()
  return <MessagesInbox initial={messages} />
}
