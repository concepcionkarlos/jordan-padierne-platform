import Foundation
import MapKit
import EventKit

// Opens Apple Maps with multi-stop driving directions through today's stops.
// Forward geocoding needs no location permission.
enum RoutePlanner {
    static func openRoute(_ addresses: [String]) {
        let queries = addresses.map { $0.trimmingCharacters(in: .whitespaces) }.filter { !$0.isEmpty }
        guard !queries.isEmpty else { return }
        Task {
            let geocoder = CLGeocoder()
            var items: [MKMapItem] = []
            for q in queries {
                if let pms = try? await geocoder.geocodeAddressString(q), let pm = pms.first {
                    items.append(MKMapItem(placemark: MKPlacemark(placemark: pm)))
                }
            }
            await MainActor.run {
                guard !items.isEmpty else { return }
                MKMapItem.openMaps(with: items, launchOptions: [MKLaunchOptionsDirectionsModeKey: MKLaunchOptionsDirectionsModeDriving])
            }
        }
    }
}

// Adds a showing to the iPhone's calendar (write-only access — least intrusive).
enum CalendarSync {
    static func add(title: String, startsAt: Date, location: String?) {
        let store = EKEventStore()
        store.requestWriteOnlyAccessToEvents { granted, _ in
            guard granted else { return }
            let event = EKEvent(eventStore: store)
            event.title = title
            event.startDate = startsAt
            event.endDate = startsAt.addingTimeInterval(3600)
            event.location = location
            event.calendar = store.defaultCalendarForNewEvents
            try? store.save(event, span: .thisEvent)
        }
    }
}
