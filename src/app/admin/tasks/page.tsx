export const dynamic = 'force-dynamic'
import { safeQuery } from '@/lib/db'
import TasksBoard from '@/components/admin/TasksBoard'

async function getTasks(): Promise<any[]> {
  return safeQuery(
    (db) => db.from('tasks').select('*').order('due_date', { ascending: true }).limit(100),
    []
  )
}

export default async function TasksPage() {
  const tasks = await getTasks()
  return <TasksBoard initial={tasks} />
}
