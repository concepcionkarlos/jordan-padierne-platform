import SwiftUI

// Native iOS companion for the Jordan Padierne CRM (Milestone 1 — authenticated
// shell). One shared Supabase auth instance backs both the session and the API
// client (so the same access token authenticates the user and the API calls).
@main
struct JordanCRMApp: App {
    @StateObject private var session: AppSession
    private let api: APIClient

    init() {
        let auth = SupabaseAuthService()
        _session = StateObject(wrappedValue: AppSession(auth: auth))
        api = APIClient(baseURL: AppConfig.apiBaseURL, auth: auth)
    }

    var body: some Scene {
        WindowGroup {
            RootView(api: api)
                .environmentObject(session)
        }
    }
}
