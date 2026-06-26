import Foundation

// Observable auth state for the app. Drives the root router: loading → signedOut
// (Login) → signedIn (Today). Depends only on the AuthService protocol.
@MainActor
final class AppSession: ObservableObject {
    enum State {
        case loading
        case signedOut
        case signedIn
    }

    @Published var state: State = .loading
    @Published var isWorking = false
    @Published var errorMessage: String?

    private let auth: AuthService

    init(auth: AuthService) {
        self.auth = auth
    }

    /// Called once on launch to restore any persisted session.
    func bootstrap() async {
        let ok = await auth.restoreSession()
        state = ok ? .signedIn : .signedOut
    }

    func signIn(email: String, password: String) async {
        errorMessage = nil
        isWorking = true
        defer { isWorking = false }
        do {
            try await auth.signIn(email: email, password: password)
            state = .signedIn
        } catch {
            errorMessage = "Couldn’t sign in. Check your email and password, then try again."
        }
    }

    func signOut() async {
        await auth.signOut()
        state = .signedOut
    }
}
