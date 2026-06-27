import SwiftUI

@MainActor
final class AppointmentsViewModel: ObservableObject {
    @Published var items: [Appointment] = []
    @Published var isLoading = false
    @Published var failed = false

    private let api: APIClient
    init(api: APIClient) { self.api = api }

    func load() async {
        isLoading = true; failed = false
        do { items = try await api.allAppointments() }
        catch { failed = true }
        isLoading = false
    }

    // Today and the future only — the field needs "what's next", not history.
    private var visible: [Appointment] {
        let startOfToday = Calendar.current.startOfDay(for: Date())
        return items.filter { a in
            guard let d = AppDate.parse(a.startsAt) else { return false }
            return d >= startOfToday
        }
    }

    var todays: [Appointment] {
        visible.filter { a in
            guard let d = AppDate.parse(a.startsAt) else { return false }
            return Calendar.current.isDateInToday(d)
        }
    }

    var upcoming: [Appointment] {
        visible.filter { a in
            guard let d = AppDate.parse(a.startsAt) else { return false }
            return !Calendar.current.isDateInToday(d)
        }
    }

    func setStatus(_ id: String, _ status: String) async {
        try? await api.updateAppointment(id: id, fields: ["status": status])
        await load()
    }

    func reschedule(_ id: String, to iso: String) async {
        try? await api.updateAppointment(id: id, fields: ["starts_at": iso])
        await load()
    }
}

// "Agenda" — today's calendar + upcoming showings, with confirm / reschedule /
// cancel / call. Reuses the existing appointments CRUD; no new business logic.
struct AppointmentsView: View {
    let api: APIClient
    @StateObject private var vm: AppointmentsViewModel
    @State private var rescheduling: Appointment?
    @State private var creating = false
    @State private var pickedLead: Lead?

    init(api: APIClient) {
        self.api = api
        _vm = StateObject(wrappedValue: AppointmentsViewModel(api: api))
    }

    var body: some View {
        NavigationStack {
            Group {
                if vm.isLoading && vm.items.isEmpty {
                    LeadsSkeleton()
                } else if vm.failed && vm.items.isEmpty {
                    errorState
                } else if vm.todays.isEmpty && vm.upcoming.isEmpty {
                    emptyState
                } else {
                    list
                }
            }
            .navigationTitle("Agenda")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button { creating = true } label: { Image(systemName: "plus") }
                }
            }
            .refreshable { await vm.load() }
            .task { if vm.items.isEmpty { await vm.load() } }
            .sheet(item: $rescheduling) { appt in
                AppointmentSheet(api: api, existing: appt) { Task { await vm.load() } }
            }
            .sheet(isPresented: $creating) {
                LeadPickerView(api: api) { picked in
                    pickedLead = picked
                    creating = false
                }
            }
            .sheet(item: $pickedLead) { lead in
                AppointmentSheet(api: api, lead: lead) { Task { await vm.load() } }
            }
        }
    }

    private var list: some View {
        List {
            if !vm.todays.isEmpty {
                Section { ForEach(vm.todays) { row($0) } } header: { sectionHeader("Today") }
            }
            if !vm.upcoming.isEmpty {
                Section { ForEach(vm.upcoming) { row($0) } } header: { sectionHeader("Upcoming") }
            }
        }
        .listStyle(.plain)
        .scrollContentBackground(.hidden)
        .background(Brand.groupedBg)
    }

    private func sectionHeader(_ t: String) -> some View {
        Text(t).font(Typography.sectionLabel).foregroundStyle(.secondary).textCase(nil).padding(.leading, Space.xs)
    }

    private func row(_ a: Appointment) -> some View {
        AppointmentRow(appointment: a)
            .listRowSeparator(.hidden)
            .listRowBackground(Color.clear)
            .listRowInsets(EdgeInsets(top: Space.xs, leading: Layout.screenMargin, bottom: Space.xs, trailing: Layout.screenMargin))
            .swipeActions(edge: .leading, allowsFullSwipe: true) {
                Button { Task { await vm.setStatus(a.id, "confirmed") } } label: { Label("Confirm", systemImage: "checkmark.circle.fill") }.tint(.green)
            }
            .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                Button(role: .destructive) { Task { await vm.setStatus(a.id, "cancelled") } } label: { Label("Cancel", systemImage: "xmark.circle.fill") }
                if let url = PhoneLinks.tel(a.lead?.phone) {
                    Link(destination: url) { Label("Call", systemImage: "phone.fill") }.tint(Brand.primary)
                }
            }
            .contextMenu {
                Button { rescheduling = a } label: { Label("Reschedule", systemImage: "calendar") }
                Button { Task { await vm.setStatus(a.id, "confirmed") } } label: { Label("Confirm", systemImage: "checkmark.circle") }
                Button(role: .destructive) { Task { await vm.setStatus(a.id, "cancelled") } } label: { Label("Cancel", systemImage: "xmark.circle") }
                if let url = PhoneLinks.tel(a.lead?.phone) {
                    Link(destination: url) { Label("Call", systemImage: "phone") }
                }
            }
    }

    private var emptyState: some View {
        ZStack {
            Brand.groupedBg.ignoresSafeArea()
            EmptyState(icon: "calendar",
                       title: "No appointments",
                       message: "Schedule a showing or call from a client, and it shows up here.",
                       hint: "Tap + to schedule one.")
        }
    }

    private var errorState: some View {
        ZStack {
            Brand.groupedBg.ignoresSafeArea()
            VStack(spacing: Space.md) {
                Image(systemName: "wifi.exclamationmark").font(.system(size: 34)).foregroundStyle(.secondary)
                Text("Couldn't load your agenda").font(.headline).foregroundStyle(Brand.navy)
                Button("Try Again") { Task { await vm.load() } }.buttonStyle(.borderedProminent).tint(Brand.primary)
            }
        }
    }
}

struct AppointmentRow: View {
    let appointment: Appointment

    var body: some View {
        HStack(spacing: Space.md) {
            VStack(spacing: 0) {
                Text(timeText).font(.subheadline.weight(.bold)).foregroundStyle(Brand.navy)
                if !dayText.isEmpty { Text(dayText).font(.caption2).foregroundStyle(.secondary) }
            }
            .frame(width: 58)

            Rectangle().fill(statusColor).frame(width: 3).clipShape(Capsule())

            VStack(alignment: .leading, spacing: 3) {
                Text(appointment.title).font(.body.weight(.semibold)).foregroundStyle(Brand.navy).lineLimit(1)
                HStack(spacing: Space.xs) {
                    if let name = appointment.lead?.fullName { Text(name).lineLimit(1) }
                    if let loc = appointment.location, !loc.isEmpty { Text("· \(loc)").lineLimit(1) }
                }
                .font(.footnote).foregroundStyle(.secondary)
            }
            Spacer(minLength: Space.sm)
            StatusPill(text: statusLabel, color: statusColor)
        }
        .padding(.vertical, Space.sm)
        .padding(.horizontal, Space.md)
        .background(Brand.cardBg, in: RoundedRectangle(cornerRadius: Radius.card, style: .continuous))
    }

    private var date: Date? { AppDate.parse(appointment.startsAt) }
    private var timeText: String { date?.formatted(date: .omitted, time: .shortened) ?? "—" }
    private var dayText: String {
        guard let d = date, !Calendar.current.isDateInToday(d) else { return "" }
        return d.formatted(.dateTime.month(.abbreviated).day())
    }
    private var statusLabel: String {
        switch appointment.status {
        case "confirmed": return "Confirmed"
        case "cancelled": return "Cancelled"
        case "completed": return "Done"
        default: return "Scheduled"
        }
    }
    private var statusColor: Color {
        switch appointment.status {
        case "confirmed": return .green
        case "cancelled": return .gray
        case "completed": return .gray
        default: return Brand.sky
        }
    }
}

// Create (needs a lead) or reschedule/edit (an existing appointment). Reuses the
// appointments POST/PATCH; the server applies all rules.
struct AppointmentSheet: View {
    let api: APIClient
    var lead: Lead? = nil
    var existing: Appointment? = nil
    var onSaved: () -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var title = ""
    @State private var type = "showing"
    @State private var date = Date()
    @State private var location = ""
    @State private var saving = false

    private let types = ["showing", "call", "meeting", "other"]

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Title", text: $title)
                    Picker("Type", selection: $type) {
                        ForEach(types, id: \.self) { Text($0.capitalized).tag($0) }
                    }
                    DatePicker("When", selection: $date, displayedComponents: [.date, .hourAndMinute])
                    TextField("Location (optional)", text: $location)
                }
                if let name = clientName {
                    Section("Client") { Text(name).foregroundStyle(.secondary) }
                }
            }
            .navigationTitle(existing == nil ? "New appointment" : "Reschedule")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { Task { await save() } }.disabled(!canSave || saving)
                }
            }
            .onAppear(perform: prefill)
        }
    }

    private var clientName: String? { existing?.lead?.fullName ?? lead?.fullName }
    private var canSave: Bool { !title.trimmingCharacters(in: .whitespaces).isEmpty }

    private func prefill() {
        if let e = existing {
            title = e.title
            type = e.type ?? "showing"
            location = e.location ?? ""
            if let d = AppDate.parse(e.startsAt) { date = d }
        } else if title.isEmpty {
            title = "Showing"
        }
    }

    private func save() async {
        saving = true
        defer { saving = false }
        let iso = ISO8601DateFormatter().string(from: date)
        do {
            if let e = existing {
                try await api.updateAppointment(id: e.id, fields: [
                    "title": title, "type": type, "starts_at": iso, "location": location,
                ])
            } else if let lead {
                _ = try await api.createAppointment(leadId: lead.id, title: title, type: type, startsAt: iso, location: location)
            }
            Haptics.success()
            onSaved()
            dismiss()
        } catch {}
    }
}
