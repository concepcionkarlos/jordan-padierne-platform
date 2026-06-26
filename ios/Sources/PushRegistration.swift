import Foundation
import UIKit
import UserNotifications

// Owns the push-registration lifecycle: ask permission → register with APNs →
// capture the device token → upload it to the backend (Bearer-authenticated).
// Graceful if permission is denied — the app works fully without push.
@MainActor
final class PushRegistration: ObservableObject {
    static let shared = PushRegistration()

    @Published private(set) var status: UNAuthorizationStatus = .notDetermined

    private var deviceToken: String?
    private var api: APIClient?

    private init() {}

    /// Provide the authenticated API client (after sign-in) so the token can upload.
    func attach(api: APIClient) {
        self.api = api
        Task { await uploadIfPossible() }
    }

    /// Ask for notification permission and, if granted, register with APNs.
    func requestAndRegister() async {
        let center = UNUserNotificationCenter.current()
        let granted = (try? await center.requestAuthorization(options: [.alert, .badge, .sound])) ?? false
        status = await center.notificationSettings().authorizationStatus
        guard granted else { return }                 // denied → graceful no-op
        UIApplication.shared.registerForRemoteNotifications()
    }

    /// APNs returned a token (from the AppDelegate). Store + upload.
    func setDeviceToken(_ data: Data) {
        deviceToken = data.map { String(format: "%02x", $0) }.joined()
        Task { await uploadIfPossible() }
    }

    /// APNs registration failed — leave us without a token this session; no crash.
    func registrationFailed(_ error: Error) { }

    private func uploadIfPossible() async {
        guard let api, let token = deviceToken else { return }
        try? await api.registerPushToken(token)
    }
}
