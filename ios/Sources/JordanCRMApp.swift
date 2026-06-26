import SwiftUI

// Native iOS companion for the Jordan Padierne CRM. One shared Supabase auth
// instance backs the session, the API client, and the offline note-sync service.
@main
struct JordanCRMApp: App {
    @StateObject private var session: AppSession
    @StateObject private var sync: NoteSyncService
    private let api: APIClient

    init() {
        let auth = SupabaseAuthService()
        let client = APIClient(baseURL: AppConfig.apiBaseURL, auth: auth)
        _session = StateObject(wrappedValue: AppSession(auth: auth))
        _sync = StateObject(wrappedValue: NoteSyncService(api: client))
        api = client
    }

    var body: some Scene {
        WindowGroup {
            RootView(api: api)
                .environmentObject(session)
                .environmentObject(sync)
        }
    }
}
