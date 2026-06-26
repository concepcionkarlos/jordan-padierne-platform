import SwiftUI

@MainActor
final class LeadDetailViewModel: ObservableObject {
    let lead: Lead
    @Published var stage: String
    @Published var nextFollowup: String?
    @Published var timeline: [TimelineItem] = []
    @Published var loadingTimeline = false
    @Published var working = false

    private let api: APIClient

    init(api: APIClient, lead: Lead) {
        self.api = api
        self.lead = lead
        self.stage = lead.pipelineStage
        self.nextFollowup = lead.nextFollowup
    }

    func load() async {
        loadingTimeline = true
        let notes = (try? await api.notes(leadId: lead.id)) ?? []
        let appts = (try? await api.appointments(leadId: lead.id)) ?? []
        timeline = TimelineBuilder.merge(notes: notes, appointments: appts)
        loadingTimeline = false
    }

    func insertNote(_ note: Note) {
        let item = TimelineItem(id: "note-\(note.id)", kind: .note, title: note.content,
                                subtitle: note.author, date: AppDate.parse(note.createdAt) ?? Date())
        timeline.insert(item, at: 0)
    }

    func setStage(_ newStage: String) async {
        guard newStage != stage else { return }
        working = true
        defer { working = false }
        do {
            try await api.updateStage(leadId: lead.id, stage: newStage)
            stage = newStage
        } catch {}
    }

    func setFollowup(daysFromNow days: Int) async {
        working = true
        defer { working = false }
        let date = Calendar.current.date(byAdding: .day, value: days, to: Date()) ?? Date()
        let iso = ISO8601DateFormatter().string(from: date)
        do {
            try await api.updateFollowup(leadId: lead.id, isoDate: iso)
            nextFollowup = iso
        } catch {}
    }
}

struct LeadDetailView: View {
    let api: APIClient
    @StateObject private var vm: LeadDetailViewModel

    init(api: APIClient, lead: Lead) {
        self.api = api
        _vm = StateObject(wrappedValue: LeadDetailViewModel(api: api, lead: lead))
    }

    var body: some View {
        List {
            headerSection
            actionsSection
            followupSection
            timelineSection
        }
        .listStyle(.insetGrouped)
        .navigationTitle(vm.lead.fullName)
        .navigationBarTitleDisplayMode(.inline)
        .task { await vm.load() }
        .refreshable { await vm.load() }
        .overlay {
            VoiceCaptureButton(api: api, lead: vm.lead) { note in vm.insertNote(note) }
        }
    }

    // Who is this person? Where are they in the pipeline?
    private var headerSection: some View {
        Section {
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 8) {
                    Text(vm.lead.fullName).font(.title2.bold())
                    if vm.lead.hotScore == 3 { Text("🔥") }
                }
                let meta = [vm.lead.clientType, vm.lead.preferredArea].compactMap { $0 }.joined(separator: " · ")
                if !meta.isEmpty {
                    Text(meta).font(.subheadline).foregroundStyle(.secondary)
                }
                HStack(spacing: 10) {
                    StageBadge(stage: vm.stage)
                    Text("Added \(AppDate.relative(vm.lead.createdAt))")
                        .font(.caption).foregroundStyle(.secondary)
                }
            }
            .padding(.vertical, 4)
        }
    }

    // What should I do next? — the first visible actions.
    private var actionsSection: some View {
        Section {
            HStack(spacing: 10) {
                linkAction("Call", "phone.fill", .green, url: PhoneLinks.tel(vm.lead.phone))
                linkAction("WhatsApp", "message.fill", .blue, url: PhoneLinks.whatsapp(vm.lead.phone, message: "Hi \(firstName)! 👋 Jordan here."))
                stageMenu
            }
            .frame(maxWidth: .infinity)
        }
    }

    private var stageMenu: some View {
        Menu {
            ForEach(LeadStage.allCases) { option in
                Button {
                    Task { await vm.setStage(option.rawValue) }
                } label: {
                    if option.rawValue == vm.stage {
                        Label(option.label, systemImage: "checkmark")
                    } else {
                        Text(option.label)
                    }
                }
            }
        } label: {
            actionLabel("Stage", "arrow.triangle.branch", .indigo)
        }
        .disabled(vm.working)
    }

    private var followupSection: some View {
        Section("Follow-up") {
            HStack {
                Image(systemName: "bell.fill").foregroundStyle(.secondary)
                Text(vm.nextFollowup != nil ? "Next: \(AppDate.shortDateTime(vm.nextFollowup))" : "No follow-up set")
                Spacer()
                Menu("Set") {
                    Button("Tomorrow") { Task { await vm.setFollowup(daysFromNow: 1) } }
                    Button("In 3 days") { Task { await vm.setFollowup(daysFromNow: 3) } }
                    Button("In 1 week") { Task { await vm.setFollowup(daysFromNow: 7) } }
                }
                .disabled(vm.working)
            }
        }
    }

    // What happened last?
    private var timelineSection: some View {
        Section("Activity") {
            if vm.loadingTimeline && vm.timeline.isEmpty {
                HStack { Spacer(); ProgressView(); Spacer() }
            } else if vm.timeline.isEmpty {
                Text("No activity yet.").font(.subheadline).foregroundStyle(.secondary)
            } else {
                ForEach(vm.timeline) { item in
                    HStack(alignment: .top, spacing: 12) {
                        Image(systemName: item.icon).foregroundStyle(.tint).frame(width: 22)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(item.title).font(.subheadline)
                            HStack(spacing: 4) {
                                if let sub = item.subtitle { Text(sub) }
                                if let date = item.date {
                                    Text("· \(date.formatted(.relative(presentation: .named)))")
                                }
                            }
                            .font(.caption).foregroundStyle(.secondary)
                        }
                    }
                    .padding(.vertical, 2)
                }
            }
        }
    }

    private var firstName: String {
        vm.lead.fullName.split(separator: " ").first.map(String.init) ?? "there"
    }

    // MARK: - Action chips (large, equal touch targets)

    @ViewBuilder
    private func linkAction(_ title: String, _ icon: String, _ color: Color, url: URL?) -> some View {
        if let url {
            Link(destination: url) { actionLabel(title, icon, color) }
        } else {
            actionLabel(title, icon, color).opacity(0.35)
        }
    }

    private func actionLabel(_ title: String, _ icon: String, _ color: Color) -> some View {
        VStack(spacing: 6) {
            Image(systemName: icon).font(.system(size: 20)).frame(height: 24)
            Text(title).font(.caption2)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(color.opacity(0.14), in: RoundedRectangle(cornerRadius: 12))
        .foregroundStyle(color)
    }
}
