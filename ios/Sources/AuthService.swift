import Foundation

// Abstraction over the auth backend. Keeping the Supabase SPM package behind this
// protocol means the app's state machine and all SwiftUI views type-check without
// the package resolved; only SupabaseAuthService (the real implementation) imports
// Supabase and is compiled by Xcode.
protocol AuthService {
    /// Restore a persisted session on launch. Returns true if a valid session exists.
    func restoreSession() async -> Bool
    /// Email/password sign-in. Throws on failure.
    func signIn(email: String, password: String) async throws
    /// Clear the session.
    func signOut() async
    /// Current Supabase access token (JWT) for Bearer-authenticating API calls.
    func accessToken() async -> String?
}

#if DEBUG
/// No-op implementation for SwiftUI previews (no Supabase, always "signed in").
final class PreviewAuthService: AuthService {
    func restoreSession() async -> Bool { true }
    func signIn(email: String, password: String) async throws {}
    func signOut() async {}
    func accessToken() async -> String? { nil }
}
#endif
