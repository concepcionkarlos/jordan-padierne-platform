import Foundation
import Network

// Saves voice notes with offline durability. Tries the server immediately; on
// failure the note is queued locally and retried automatically when connectivity
// returns (NWPathMonitor) or the app is foregrounded.
@MainActor
final class NoteSyncService: ObservableObject {
    @Published var pendingCount = 0

    private let api: APIClient
    private let store = PendingNotesStore()
    private let monitor = NWPathMonitor()

    init(api: APIClient) {
        self.api = api
        pendingCount = store.all().count
        monitor.pathUpdateHandler = { [weak self] path in
            guard path.status == .satisfied else { return }
            Task { await self?.flush() }
        }
        monitor.start(queue: DispatchQueue(label: "note-sync.monitor"))
    }

    /// Save now; returns the saved Note on success, or nil if it was queued offline.
    func save(leadId: String, content: String) async -> Note? {
        do {
            return try await api.addNote(leadId: leadId, content: content)
        } catch {
            store.add(PendingNote(id: UUID().uuidString, leadId: leadId, content: content,
                                  createdAt: ISO8601DateFormatter().string(from: Date())))
            pendingCount = store.all().count
            return nil
        }
    }

    /// Flush queued notes (best-effort, stops on the first failure to retry later).
    func flush() async {
        for pending in store.all() {
            do {
                _ = try await api.addNote(leadId: pending.leadId, content: pending.content)
                store.remove(pending.id)
            } catch {
                break
            }
        }
        pendingCount = store.all().count
    }
}
