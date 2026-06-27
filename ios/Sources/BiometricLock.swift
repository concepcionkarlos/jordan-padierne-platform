import SwiftUI
import LocalAuthentication

// Face ID / Touch ID (with device-passcode fallback) app lock. Locks on launch and
// re-locks whenever the app goes to the background, so the CRM never sits unlocked
// in a pocket. If no biometrics/passcode are set up, it doesn't lock the user out.
@MainActor
final class BiometricLock: ObservableObject {
    @Published var isUnlocked = false

    func relock() { isUnlocked = false }

    func authenticate() {
        let context = LAContext()
        var error: NSError?
        let policy: LAPolicy = .deviceOwnerAuthentication  // biometrics, falling back to passcode

        guard context.canEvaluatePolicy(policy, error: &error) else {
            // No biometrics or passcode configured — don't hard-lock Jordan out.
            isUnlocked = true
            return
        }

        context.evaluatePolicy(policy, localizedReason: "Unlock Jordan CRM") { success, _ in
            Task { @MainActor in self.isUnlocked = success }
        }
    }
}

// Wraps signed-in content behind the lock. Shows the lock screen until Face ID
// succeeds; re-locks on background.
struct LockedGate<Content: View>: View {
    @StateObject private var lock = BiometricLock()
    @Environment(\.scenePhase) private var scenePhase
    @ViewBuilder let content: () -> Content

    var body: some View {
        Group {
            if lock.isUnlocked {
                content()
            } else {
                LockedView { lock.authenticate() }
                    .onAppear { lock.authenticate() }
            }
        }
        .onChange(of: scenePhase) { _, newPhase in
            if newPhase == .background { lock.relock() }
        }
    }
}

private struct LockedView: View {
    let onUnlock: () -> Void

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "lock.fill")
                .font(.system(size: 40))
                .foregroundStyle(.tint)
            Text("Jordan CRM").font(.title2.bold()).foregroundStyle(Brand.navy)
            Text("Locked").font(.subheadline).foregroundStyle(.secondary)
            Button("Unlock with Face ID", action: onUnlock)
                .buttonStyle(.borderedProminent)
                .padding(.top, 4)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
