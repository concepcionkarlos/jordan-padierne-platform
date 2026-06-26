import Foundation

// Date parsing/formatting helpers (formatting only — no business logic).
enum AppDate {
    static func parse(_ iso: String?) -> Date? {
        guard let iso else { return nil }
        let withFrac = ISO8601DateFormatter()
        withFrac.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        let plain = ISO8601DateFormatter()
        plain.formatOptions = [.withInternetDateTime]
        return withFrac.date(from: iso) ?? plain.date(from: iso)
    }

    static func shortDateTime(_ iso: String?) -> String {
        guard let date = parse(iso) else { return "—" }
        return date.formatted(date: .abbreviated, time: .shortened)
    }

    static func relative(_ iso: String?) -> String {
        guard let date = parse(iso) else { return "" }
        return date.formatted(.relative(presentation: .named))
    }
}
