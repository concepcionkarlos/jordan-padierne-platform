import { createServiceClient } from '@/lib/supabase'
import { formatDate, getStatusColor } from '@/lib/utils'
import { CheckSquare, Calendar, AlertCircle, Plus } from 'lucide-react'

async function getTasks() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .order('due_date', { ascending: true })
    .limit(100)
  return data ?? []
}

const priorityColors: Record<string, string> = {
  high: 'text-wine',
  medium: 'text-orange-500',
  low: 'text-gray-400',
}

const priorityIcons: Record<string, string> = {
  high: '!!!',
  medium: '!!',
  low: '!',
}

export default async function TasksPage() {
  const tasks = await getTasks()

  const todo = tasks.filter((t) => t.status === 'todo')
  const inProgress = tasks.filter((t) => t.status === 'in_progress')
  const done = tasks.filter((t) => t.status === 'done')

  const overdue = todo.filter((t) => t.due_date && new Date(t.due_date) < new Date())

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy-900">Tasks</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {todo.length} pending · {inProgress.length} in progress · {done.length} done
            {overdue.length > 0 && (
              <span className="text-wine font-semibold ml-2">· {overdue.length} overdue</span>
            )}
          </p>
        </div>
        <button className="btn-primary text-sm px-4 py-2.5">
          <Plus size={15} /> New Task
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* To Do */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-navy-900 text-sm">To Do</h2>
            <span className="bg-wine-50 text-wine text-xs font-bold px-2 py-0.5 rounded-full">{todo.length}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {todo.length === 0 && (
              <p className="px-5 py-8 text-center text-gray-300 text-sm">No pending tasks</p>
            )}
            {todo.map((task) => (
              <div key={task.id} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <CheckSquare size={16} className="text-gray-300 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-navy-900 text-sm font-medium">{task.title}</p>
                    {task.description && (
                      <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {task.due_date && (
                        <span className={`flex items-center gap-1 text-xs ${
                          new Date(task.due_date) < new Date() ? 'text-wine' : 'text-gray-400'
                        }`}>
                          <Calendar size={11} />
                          {formatDate(task.due_date)}
                        </span>
                      )}
                      {task.priority === 'high' && (
                        <span className="flex items-center gap-1 text-xs text-wine">
                          <AlertCircle size={11} />
                          High Priority
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs font-bold ${priorityColors[task.priority]}`}>
                    {priorityIcons[task.priority]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-navy-900 text-sm">In Progress</h2>
            <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">{inProgress.length}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {inProgress.length === 0 && (
              <p className="px-5 py-8 text-center text-gray-300 text-sm">Nothing in progress</p>
            )}
            {inProgress.map((task) => (
              <div key={task.id} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded border-2 border-blue-400 flex items-center justify-center mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  </div>
                  <div>
                    <p className="text-navy-900 text-sm font-medium">{task.title}</p>
                    {task.due_date && (
                      <span className="text-gray-400 text-xs flex items-center gap-1 mt-1">
                        <Calendar size={11} />{formatDate(task.due_date)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Done */}
        <div className="bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-navy-900 text-sm">Done</h2>
            <span className="bg-green-50 text-green-600 text-xs font-bold px-2 py-0.5 rounded-full">{done.length}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {done.length === 0 && (
              <p className="px-5 py-8 text-center text-gray-300 text-sm">No completed tasks</p>
            )}
            {done.slice(0, 10).map((task) => (
              <div key={task.id} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <CheckSquare size={16} className="text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-400 text-sm line-through">{task.title}</p>
                    {task.completed_at && (
                      <p className="text-gray-300 text-xs mt-0.5">{formatDate(task.completed_at)}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
