'use client'

import { useState } from 'react'
import { CheckSquare, Calendar, AlertCircle, Plus, X, Trash2, ArrowRight, RotateCcw } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import PageHeader from '@/components/ui/PageHeader'

type Task = {
  id: string
  title: string
  description?: string | null
  status: 'todo' | 'in_progress' | 'done'
  priority?: string | null
  due_date?: string | null
  completed_at?: string | null
}

const priorityColors: Record<string, string> = {
  high: 'text-wine',
  medium: 'text-orange-500',
  low: 'text-gray-400',
}

export default function TasksBoard({ initial }: { initial: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initial)
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)

  const todo = tasks.filter((t) => t.status === 'todo')
  const inProgress = tasks.filter((t) => t.status === 'in_progress')
  const done = tasks.filter((t) => t.status === 'done')
  const overdue = todo.filter((t) => t.due_date && new Date(t.due_date) < new Date())

  async function createTask(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          priority,
          status: 'todo',
          due_date: dueDate || null,
        }),
      })
      const d = await res.json().catch(() => ({ success: false }))
      if (res.ok && d.success && d.data) {
        setTasks((ts) => [d.data, ...ts])
        setTitle(''); setPriority('medium'); setDueDate(''); setAdding(false)
      }
    } finally {
      setSaving(false)
    }
  }

  async function move(task: Task, status: Task['status']) {
    const completed_at = status === 'done' ? new Date().toISOString() : null
    const prev = tasks
    setTasks((ts) => ts.map((t) => (t.id === task.id ? { ...t, status, completed_at } : t)))
    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, status, completed_at }),
      })
      const d = await res.json().catch(() => ({ success: false }))
      if (!res.ok || !d.success) setTasks(prev)
    } catch {
      setTasks(prev)
    }
  }

  async function remove(task: Task) {
    const prev = tasks
    setTasks((ts) => ts.filter((t) => t.id !== task.id))
    try {
      const res = await fetch(`/api/tasks?id=${task.id}`, { method: 'DELETE' })
      const d = await res.json().catch(() => ({ success: false }))
      if (!res.ok || !d.success) setTasks(prev)
    } catch {
      setTasks(prev)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Tasks"
        subtitle={<>
          {todo.length} pending · {inProgress.length} in progress · {done.length} done
          {overdue.length > 0 && (
            <span className="text-wine font-semibold ml-2">· {overdue.length} overdue</span>
          )}
        </>}
        action={
          <button type="button" onClick={() => setAdding((v) => !v)} className="btn-primary text-sm px-4 py-2.5">
            {adding ? <><X size={15} /> Cancel</> : <><Plus size={15} /> New Task</>}
          </button>
        }
      />

      {/* New task form */}
      {adding && (
        <form onSubmit={createTask} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
          <div className="flex-1">
            <label className="label">Task</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Call back the Brickell buyer"
              className="input-field"
            />
          </div>
          <div className="w-full sm:w-40">
            <label className="label">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="input-field">
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="w-full sm:w-44">
            <label className="label">Due date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="input-field" />
          </div>
          <button type="submit" disabled={saving || !title.trim()} className="btn-wine justify-center px-5 py-3 disabled:opacity-60">
            {saving ? 'Adding…' : 'Add'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* To Do */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-navy-900 text-sm">To Do</h2>
            <span className="bg-red-50 text-red-500 text-xs font-bold px-2 py-0.5 rounded-full">{todo.length}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {todo.length === 0 && <p className="px-5 py-8 text-center text-gray-300 text-sm">No pending tasks</p>}
            {todo.map((task) => (
              <div key={task.id} className="px-5 py-4 group">
                <div className="flex items-start gap-3">
                  <CheckSquare size={16} className="text-gray-300 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-navy-900 text-sm font-medium">{task.title}</p>
                    {task.description && <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">{task.description}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      {task.due_date && (
                        <span className={`flex items-center gap-1 text-xs ${new Date(task.due_date) < new Date() ? 'text-wine' : 'text-gray-400'}`}>
                          <Calendar size={11} />{formatDate(task.due_date)}
                        </span>
                      )}
                      {task.priority === 'high' && (
                        <span className="flex items-center gap-1 text-xs text-wine"><AlertCircle size={11} />High</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2.5">
                      <button type="button" onClick={() => move(task, 'in_progress')} className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700">
                        Start <ArrowRight size={11} />
                      </button>
                      <button type="button" onClick={() => remove(task)} className="text-gray-300 hover:text-wine transition-colors" aria-label="Delete task">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <span className={`text-xs font-bold ${priorityColors[task.priority ?? ''] ?? 'text-gray-400'}`}>
                    {task.priority === 'high' ? '!!!' : task.priority === 'medium' ? '!!' : '!'}
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
            {inProgress.length === 0 && <p className="px-5 py-8 text-center text-gray-300 text-sm">Nothing in progress</p>}
            {inProgress.map((task) => (
              <div key={task.id} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded border-2 border-blue-400 flex items-center justify-center mt-0.5 shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-navy-900 text-sm font-medium">{task.title}</p>
                    {task.due_date && (
                      <span className="text-gray-400 text-xs flex items-center gap-1 mt-1"><Calendar size={11} />{formatDate(task.due_date)}</span>
                    )}
                    <div className="flex items-center gap-3 mt-2.5">
                      <button type="button" onClick={() => move(task, 'todo')} className="text-xs font-medium text-gray-400 hover:text-gray-600">← To Do</button>
                      <button type="button" onClick={() => move(task, 'done')} className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700">
                        Done <ArrowRight size={11} />
                      </button>
                      <button type="button" onClick={() => remove(task)} className="text-gray-300 hover:text-wine transition-colors" aria-label="Delete task">
                        <Trash2 size={13} />
                      </button>
                    </div>
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
            {done.length === 0 && <p className="px-5 py-8 text-center text-gray-300 text-sm">No completed tasks</p>}
            {done.slice(0, 15).map((task) => (
              <div key={task.id} className="px-5 py-4 group">
                <div className="flex items-start gap-3">
                  <CheckSquare size={16} className="text-green-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-400 text-sm line-through">{task.title}</p>
                    {task.completed_at && <p className="text-gray-300 text-xs mt-0.5">{formatDate(task.completed_at)}</p>}
                    <div className="flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="button" onClick={() => move(task, 'todo')} className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600">
                        <RotateCcw size={11} /> Reopen
                      </button>
                      <button type="button" onClick={() => remove(task)} className="text-gray-300 hover:text-wine transition-colors" aria-label="Delete task">
                        <Trash2 size={13} />
                      </button>
                    </div>
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
