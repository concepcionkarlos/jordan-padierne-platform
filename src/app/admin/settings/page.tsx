export const dynamic = 'force-dynamic'
import { Settings, Mail, Shield, Globe, MessageSquare, Phone, Bell, CheckCircle2, XCircle, Calendar, Video } from 'lucide-react'
import { isEmailConfigured } from '@/lib/email'
import { isSupabaseConfigured } from '@/lib/supabase'
import { getSetting } from '@/lib/settings'
import { googleOAuthConfigured, isGoogleMeetConfigured } from '@/lib/google-meet'
import ReviewLinkSetting from '@/components/admin/ReviewLinkSetting'
import EmailTestButton from '@/components/admin/EmailTestButton'
import AgentProfileForm from '@/components/admin/AgentProfileForm'

export default async function SettingsPage({ searchParams }: { searchParams: { google?: string } }) {
  const emailConnected = isEmailConfigured()
  const supabaseConnected = isSupabaseConfigured()

  // Load the saved agent profile (falls back to the brand defaults).
  const [name, license, phone, email, broker, languages] = await Promise.all([
    getSetting('profile_name'),
    getSetting('profile_license'),
    getSetting('profile_phone'),
    getSetting('profile_email'),
    getSetting('profile_broker'),
    getSetting('profile_languages'),
  ])
  const profile = {
    name: name ?? 'Jordan Padierne',
    license: license ?? 'SL3641062',
    phone: phone ?? '305-799-6973',
    email: email ?? 'info@jordanpadierne.com',
    broker: broker ?? 'eXp Realty',
    languages: languages ?? 'English, Spanish',
  }

  const googleConfigured = googleOAuthConfigured()
  const googleConnected = await isGoogleMeetConfigured()
  const googleMsg = searchParams?.google

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-navy-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Platform configuration and integrations.</p>
      </div>

      <div className="space-y-6">
        {/* Google Calendar & Meet */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center">
              <Video size={16} className="text-navy-700" />
            </div>
            <h2 className="font-semibold text-navy-900">Google Calendar &amp; Meet</h2>
            {googleConnected
              ? <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-green-600"><CheckCircle2 size={14} /> Connected</span>
              : <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-gray-400"><XCircle size={14} /> Not connected</span>}
          </div>
          <div className="p-6">
            {googleMsg === 'connected' && <p className="text-sm text-green-600 mb-3">✅ Connected — video appointments now create real Google Meet links.</p>}
            {googleMsg === 'denied' && <p className="text-sm text-wine mb-3">Authorization was cancelled.</p>}
            {(googleMsg === 'failed' || googleMsg === 'state') && <p className="text-sm text-wine mb-3">Could not complete the connection. Please try again.</p>}
            {googleMsg === 'missing_config' && <p className="text-sm text-wine mb-3">Add the OAuth env vars below first, then redeploy.</p>}
            <p className="text-gray-500 text-sm mb-4">Connect Jordan’s Google account so video appointments create real Google Meet links on his calendar and email native invites to clients.</p>
            {!googleConfigured ? (
              <div className="bg-light-gray rounded-lg p-3 text-xs font-mono text-gray-600 space-y-1">
                <p>GOOGLE_OAUTH_CLIENT_ID=…</p>
                <p>GOOGLE_OAUTH_CLIENT_SECRET=…</p>
                <p>GOOGLE_OAUTH_REDIRECT_URI=https://jordanpadierne.com/api/google/callback</p>
              </div>
            ) : (
              <a href="/api/google/connect" className="btn-primary text-sm px-5 py-2.5 inline-flex">
                <Calendar size={15} /> {googleConnected ? 'Reconnect Google Calendar' : 'Connect Google Calendar'}
              </a>
            )}
          </div>
        </div>

        {/* Agent Profile */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center">
              <Shield size={16} className="text-navy-700" />
            </div>
            <h2 className="font-semibold text-navy-900">Agent Profile</h2>
          </div>
          <AgentProfileForm initial={profile} />
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
              {emailConnected && <EmailTestButton />}
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
