export const dynamic = 'force-dynamic'
import { safeQuery } from '@/lib/db'
import CalendarView from '@/components/admin/CalendarView'
import TipBanner from '@/components/admin/TipBanner'

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
      <TipBanner id="calendar">
        💡 Link each appointment to a lead so it shows up on their profile and in your Coach. Today&apos;s appointments automatically appear on your Dashboard plan.
      </TipBanner>
      <CalendarView initial={appointments} leads={leads} />
    </div>
  )
}
