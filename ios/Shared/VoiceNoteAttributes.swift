import ActivityKit
import Foundation

// Shared between the app (which starts/ends the activity) and the widget
// extension (which renders the Dynamic Island + lock-screen UI).
struct VoiceNoteAttributes: ActivityAttributes {
    struct ContentState: Codable, Hashable {
        var clientName: String
    }
    var startedAt: Date
}
