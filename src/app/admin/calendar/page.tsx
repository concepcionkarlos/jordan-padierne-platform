export const dynamic = 'force-dynamic'
import { safeQuery } from '@/lib/db'
import CalendarView from '@/components/admin/CalendarView'

async function getAppointments(): Promise<any[]> {
  return safeQuery((db) => db.from('appointments').select('*, leads(full_name, phone)').order('starts_at', { ascending: true }).limit(300), [])
}
async function getLeads(): Promise<any[]> {
  return safeQuery((db) => db.from('leads').select('id, full_name').order('created_at', { ascending: false }).limit(300), [])
}

export default async function CalendarPage() {
  const [appointments, leads] = await Promise.all([getAppointments(), getLeads()])
  return (
    <div className="p-6 lg:p-8">
      <CalendarView initial={appointments} leads={leads} />
    </div>
  )
}
