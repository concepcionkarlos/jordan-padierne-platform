import { Settings, Phone, Mail, Shield, Globe, MessageSquare, Bell } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-navy-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your platform configuration and integrations.</p>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center">
              <Shield size={16} className="text-navy-700" />
            </div>
            <h2 className="font-semibold text-navy-900">Agent Profile</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input className="input-field" defaultValue="Jordan Padierne" />
              </div>
              <div>
                <label className="label">License Number</label>
                <input className="input-field" defaultValue="SL3641062" />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input-field" defaultValue="305-799-6973" />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input-field" defaultValue="info@jordanpadierne.com" />
              </div>
              <div>
                <label className="label">Broker</label>
                <input className="input-field" defaultValue="eXp Realty" />
              </div>
              <div>
                <label className="label">Languages</label>
                <input className="input-field" defaultValue="English, Spanish" />
              </div>
            </div>
            <button className="btn-primary text-sm">Save Profile</button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center">
              <Bell size={16} className="text-navy-700" />
            </div>
            <h2 className="font-semibold text-navy-900">Notifications</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-navy-900 text-sm font-medium">New Lead Notifications</p>
                <p className="text-gray-400 text-xs">Get notified when a new form is submitted</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-sky-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-navy-900 text-sm font-medium">Daily Summary</p>
                <p className="text-gray-400 text-xs">Daily email with new leads and pending tasks</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-sky-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
              </label>
            </div>
          </div>
        </div>

        {/* Integrations */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center">
              <Globe size={16} className="text-navy-700" />
            </div>
            <h2 className="font-semibold text-navy-900">Integrations</h2>
          </div>
          <div className="p-6 space-y-5">
            {/* Email */}
            <div className="p-4 rounded-xl border border-dashed border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-gray-400" />
                  <div>
                    <p className="text-navy-900 text-sm font-medium">Email Integration</p>
                    <p className="text-gray-400 text-xs">SendGrid / SMTP for transactional emails</p>
                  </div>
                </div>
                <span className="badge bg-gray-100 text-gray-400 text-xs">Coming Soon</span>
              </div>
              <p className="text-gray-400 text-xs">
                Architecture is prepared. Add your SendGrid API key in .env.local when ready.
              </p>
            </div>

            {/* WhatsApp */}
            <div className="p-4 rounded-xl border border-dashed border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <MessageSquare size={18} className="text-gray-400" />
                  <div>
                    <p className="text-navy-900 text-sm font-medium">WhatsApp Integration</p>
                    <p className="text-gray-400 text-xs">WhatsApp Business API via Meta</p>
                  </div>
                </div>
                <span className="badge bg-gray-100 text-gray-400 text-xs">Coming Soon</span>
              </div>
              <p className="text-gray-400 text-xs">
                Architecture is prepared. Add Meta API credentials in .env.local when ready.
              </p>
            </div>

            {/* iOS App */}
            <div className="p-4 rounded-xl border border-dashed border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-gray-400" />
                  <div>
                    <p className="text-navy-900 text-sm font-medium">iOS Mobile App</p>
                    <p className="text-gray-400 text-xs">Native iOS app for Jordan</p>
                  </div>
                </div>
                <span className="badge bg-gray-100 text-gray-400 text-xs">Future</span>
              </div>
              <p className="text-gray-400 text-xs">
                The API and database architecture is ready to support a future iOS app.
              </p>
            </div>
          </div>
        </div>

        {/* Supabase Info */}
        <div className="bg-navy-900 rounded-2xl p-6">
          <h3 className="text-white font-semibold text-sm mb-4">Database Status</h3>
          <div className="space-y-3">
            {['leads', 'contacts', 'messages', 'properties', 'tasks', 'notes', 'pipeline_entries', 'form_submissions', 'settings'].map((table) => (
              <div key={table} className="flex items-center justify-between">
                <span className="text-navy-200 text-xs font-mono">{table}</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-green-400 text-xs">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
