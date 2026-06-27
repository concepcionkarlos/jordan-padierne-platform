import ActivityKit
import Foundation

// Starts/ends the "recording voice note" Live Activity (Dynamic Island + lock
// screen). A safe no-op when the user has Live Activities disabled.
@MainActor
enum VoiceActivityController {
    private static var current: Activity<VoiceNoteAttributes>?

    static func start(clientName: String) {
        guard ActivityAuthorizationInfo().areActivitiesEnabled else { return }
        end()
        do {
            current = try Activity.request(
                attributes: VoiceNoteAttributes(startedAt: Date()),
                content: .init(state: .init(clientName: clientName), staleDate: nil)
            )
        } catch {
            current = nil
        }
    }

    static func end() {
        guard let activity = current else { return }
        current = nil
        Task { await activity.end(nil, dismissalPolicy: .immediate) }
    }
}
