import { Settings, Phone, Mail, Shield, Globe, MessageSquare, Bell, CheckCircle2, XCircle } from 'lucide-react'
import { isEmailConfigured } from '@/lib/email'
import { isSupabaseConfigured } from '@/lib/supabase'
import ReviewLinkSetting from '@/components/admin/ReviewLinkSetting'

export default function SettingsPage() {
  const emailConnected = isEmailConfigured()
  const supabaseConnected = isSupabaseConfigured()

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-navy-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Platform configuration and integrations.</p>
      </div>

      <div className="space-y-6">
        {/* Agent Profile */}
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
                <label htmlFor="s-name" className="label">Full Name</label>
                <input id="s-name" className="input-field" defaultValue="Jordan Padierne" readOnly title="Full Name" />
              </div>
              <div>
                <label htmlFor="s-license" className="label">License Number</label>
                <input id="s-license" className="input-field" defaultValue="SL3641062" readOnly title="License Number" />
              </div>
              <div>
                <label htmlFor="s-phone" className="label">Phone</label>
                <input id="s-phone" className="input-field" defaultValue="305-799-6973" readOnly title="Phone" />
              </div>
              <div>
                <label htmlFor="s-email" className="label">Email</label>
                <input id="s-email" className="input-field" defaultValue="info@jordanpadierne.com" readOnly title="Email" />
              </div>
              <div>
                <label htmlFor="s-broker" className="label">Broker</label>
                <input id="s-broker" className="input-field" defaultValue="eXp Realty" readOnly title="Broker" />
              </div>
              <div>
                <label htmlFor="s-langs" className="label">Languages</label>
                <input id="s-langs" className="input-field" defaultValue="English, Spanish" readOnly title="Languages" />
              </div>
            </div>
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
                <p className="text-gray-400 text-xs">Email alert when a form is submitted</p>
              </div>
              <div className="flex items-center gap-2">
                {emailConnected
                  ? <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600"><CheckCircle2 size={14} /> Active</span>
                  : <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400"><XCircle size={14} /> Not configured</span>
                }
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-navy-900 text-sm font-medium">Client Auto-Reply</p>
                <p className="text-gray-400 text-xs">Automatic thank-you email to each new lead</p>
              </div>
              <div className="flex items-center gap-2">
                {emailConnected
                  ? <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600"><CheckCircle2 size={14} /> Active</span>
                  : <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400"><XCircle size={14} /> Not configured</span>
                }
              </div>
            </div>
          </div>
        </div>

        {/* Google Reviews auto-request */}
        <ReviewLinkSetting />

        {/* Integrations */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center">
              <Globe size={16} className="text-navy-700" />
            </div>
            <h2 className="font-semibold text-navy-900">Integrations</h2>
          </div>
          <div className="p-6 space-y-4">

            {/* Email */}
            <div className={`p-4 rounded-xl border ${emailConnected ? 'border-green-200 bg-green-50' : 'border-dashed border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Mail size={18} className={emailConnected ? 'text-green-600' : 'text-gray-400'} />
                  <div>
                    <p className="text-navy-900 text-sm font-medium">Email — Google Workspace SMTP</p>
                    <p className="text-gray-400 text-xs">
                      {emailConnected
                        ? `Sending from ${process.env.SMTP_FROM || 'info@jordanpadierne.com'}`
                        : 'Configure SMTP_USER and SMTP_PASSWORD in environment variables'}
                    </p>
                  </div>
                </div>
                {emailConnected
                  ? <span className="badge bg-green-100 text-green-700 text-xs font-bold">● Connected</span>
                  : <span className="badge bg-gray-100 text-gray-400 text-xs">Not Set Up</span>
                }
              </div>
              {!emailConnected && (
                <div className="mt-3 bg-white rounded-lg p-3 border border-gray-200 text-xs font-mono text-gray-600 space-y-1">
                  <p>SMTP_HOST=smtp.gmail.com</p>
                  <p>SMTP_PORT=587</p>
                  <p>SMTP_USER=info@jordanpadierne.com</p>
                  <p>SMTP_PASSWORD=<span className="text-gray-400">[Google App Password]</span></p>
                  <p>SMTP_FROM=info@jordanpadierne.com</p>
                  <p>ADMIN_NOTIFICATION_EMAIL=info@jordanpadierne.com</p>
                  <p>SUPPORT_NOTIFICATION_EMAIL=support@jordanpadierne.com</p>
                </div>
              )}
            </div>

            {/* WhatsApp */}
            <div className="p-4 rounded-xl border border-dashed border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <MessageSquare size={18} className="text-gray-400" />
                  <div>
                    <p className="text-navy-900 text-sm font-medium">WhatsApp Business API</p>
                    <p className="text-gray-400 text-xs">Meta WhatsApp Business API for automated messages</p>
                  </div>
                </div>
                <span className="badge bg-gray-100 text-gray-400 text-xs">Coming Soon</span>
              </div>
            </div>

            {/* iOS App */}
            <div className="p-4 rounded-xl border border-dashed border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-gray-400" />
                  <div>
                    <p className="text-navy-900 text-sm font-medium">iOS Mobile App</p>
                    <p className="text-gray-400 text-xs">API and database ready — pending development</p>
                  </div>
                </div>
                <span className="badge bg-gray-100 text-gray-400 text-xs">Future</span>
              </div>
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div className="bg-navy-900 rounded-2xl p-6">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <Settings size={14} className="text-sky-400" />
            Database Status
          </h3>
          <div className="space-y-2.5">
            {[
              { table: 'leads', label: 'Leads' },
              { table: 'contacts', label: 'Contacts' },
              { table: 'messages', label: 'Messages' },
              { table: 'properties', label: 'Properties' },
              { table: 'tasks', label: 'Tasks' },
              { table: 'notes', label: 'Notes' },
              { table: 'pipeline_entries', label: 'Pipeline' },
              { table: 'form_submissions', label: 'Form Submissions' },
              { table: 'settings', label: 'Settings' },
            ].map(({ table, label }) => (
              <div key={table} className="flex items-center justify-between">
                <span className="text-navy-300 text-xs font-mono">{table}</span>
                <div className="flex items-center gap-2">
                  {supabaseConnected
                    ? <><div className="w-2 h-2 rounded-full bg-green-400" /><span className="text-green-400 text-xs">Active</span></>
                    : <><div className="w-2 h-2 rounded-full bg-gray-600" /><span className="text-gray-500 text-xs">Not connected</span></>
                  }
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-navy-800">
            <p className="text-navy-400 text-xs">
              Supabase Project: <span className="text-sky-400 font-mono">fwikhedmtouggqpiymrc</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
