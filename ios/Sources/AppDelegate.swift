import UIKit

// SwiftUI's App lifecycle doesn't deliver the APNs token callbacks, so we bridge
// them through a minimal UIApplicationDelegate (wired via @UIApplicationDelegateAdaptor).
final class AppDelegate: NSObject, UIApplicationDelegate {
    func application(_ application: UIApplication,
                     didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        Task { @MainActor in PushRegistration.shared.setDeviceToken(deviceToken) }
    }

    func application(_ application: UIApplication,
                     didFailToRegisterForRemoteNotificationsWithError error: Error) {
        Task { @MainActor in PushRegistration.shared.registrationFailed(error) }
    }
}
