import Foundation
import Supabase

// The real auth backend. This is the ONLY file that imports the Supabase SPM
// package, so it is compiled by Xcode once the dependency resolves. The supabase-swift
// Auth client persists the session in the iOS Keychain by default (secure).
final class SupabaseAuthService: AuthService {
    private let client = SupabaseClient(
        supabaseURL: AppConfig.supabaseURL,
        supabaseKey: AppConfig.supabaseAnonKey
    )

    func restoreSession() async -> Bool {
        do {
            _ = try await client.auth.session
            return true
        } catch {
            return false
        }
    }

    func signIn(email: String, password: String) async throws {
        _ = try await client.auth.signIn(email: email, password: password)
    }

    func signOut() async {
        try? await client.auth.signOut()
    }

    func accessToken() async -> String? {
        try? await client.auth.session.accessToken
    }
}
