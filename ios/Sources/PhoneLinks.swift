import Foundation

// Builds tel: and WhatsApp deep links from a stored phone number (formatting only).
enum PhoneLinks {
    /// Digits only, prefixed with the US country code for a bare 10-digit number.
    static func e164Digits(_ phone: String?) -> String? {
        guard let phone else { return nil }
        let digits = phone.filter(\.isNumber)
        guard digits.count >= 10 else { return nil }
        return digits.count == 10 ? "1\(digits)" : digits
    }

    static func tel(_ phone: String?) -> URL? {
        guard let d = e164Digits(phone) else { return nil }
        return URL(string: "tel:+\(d)")
    }

    static func whatsapp(_ phone: String?, message: String? = nil) -> URL? {
        guard let d = e164Digits(phone) else { return nil }
        var string = "https://wa.me/\(d)"
        if let message, let encoded = message.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) {
            string += "?text=\(encoded)"
        }
        return URL(string: string)
    }
}

// Opens Apple Maps for a place query (a client's area / a property). Formatting only.
enum MapsLinks {
    static func directions(query: String?) -> URL? {
        guard let q = query?.trimmingCharacters(in: .whitespacesAndNewlines), !q.isEmpty,
              let enc = q.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) else { return nil }
        return URL(string: "http://maps.apple.com/?daddr=\(enc)")
    }
}
