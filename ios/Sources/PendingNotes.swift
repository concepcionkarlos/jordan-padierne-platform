import Foundation

// A voice note captured but not yet confirmed by the server. Persisted locally so
// nothing is ever lost if Jordan saves while offline (in the car / dead zone).
struct PendingNote: Codable, Identifiable {
    let id: String
    let leadId: String
    let content: String
    let createdAt: String
}

final class PendingNotesStore {
    private let key = "pending_notes_v1"

    func all() -> [PendingNote] {
        guard let data = UserDefaults.standard.data(forKey: key) else { return [] }
        return (try? JSONDecoder().decode([PendingNote].self, from: data)) ?? []
    }

    func add(_ note: PendingNote) { persist(all() + [note]) }

    func remove(_ id: String) { persist(all().filter { $0.id != id }) }

    private func persist(_ items: [PendingNote]) {
        if let data = try? JSONEncoder().encode(items) {
            UserDefaults.standard.set(data, forKey: key)
        }
    }
}
