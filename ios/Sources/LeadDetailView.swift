import SwiftUI

@MainActor
final class LeadDetailViewModel: ObservableObject {
    @Published var lead: Lead              // upgraded to the full record once detail loads
    @Published var score: Int?
    @Published var scorePercentile: Int?
    @Published var temperature: Int?
    @Published var freshness: Freshness?
    @Published var coach: LeadCoach?
    @Published var stage: String
    @Published var nextFollowup: String?
    @Published var timeline: [TimelineItem] = []
    @Published var loading = false
    @Published var working = false

    private let api: APIClient

    init(api: APIClient, lead: Lead) {
        self.api = api
        self.lead = lead
        self.score = lead.score
        self.temperature = lead.hotScore
        self.stage = lead.pipelineStage
        self.nextFollowup = lead.nextFollowup
    }

    // One call returns the full lead + Smart Score + percentile + freshness + Coach + timeline.
    func load() async {
        loading = true
        defer { loading = false }
        do {
            let d = try await api.leadDetail(id: lead.id)
            lead = d.lead
            score = d.score
            scorePercentile = d.scorePercentile
            temperature = d.temperature
            freshness = d.freshness
            coach = d.coach
            stage = d.lead.pipelineStage
            nextFollowup = d.lead.nextFollowup
            withAnimation(Motion.spring) {
                timeline = TimelineBuilder.merge(notes: d.notes, appointments: d.appointments)
            }
        } catch {
            // Keep the initial header from the passed-in lead; the Coach card just won't show.
        }
    }

    func insertNote(_ note: Note) {
        let item = TimelineItem(id: "note-\(note.id)", kind: .note, title: note.content,
                                subtitle: note.author, date: AppDate.parse(note.createdAt) ?? Date())
        timeline.insert(item, at: 0)
    }

    func setStage(_ newStage: String) async -> Bool {
        guard newStage != stage else { return false }
        working = true
        var ok = false
        do {
            try await api.updateStage(leadId: lead.id, stage: newStage)
            withAnimation(Motion.spring) { stage = newStage }
            ok = true
        } catch {}
        working = false
        await load()   // refresh the Coach move + score now that the stage changed
        return ok
    }

    func setFollowup(daysFromNow days: Int) async -> Bool {
        working = true
        var ok = false
        let date = Calendar.current.date(byAdding: .day, value: days, to: Date()) ?? Date()
        let iso = ISO8601DateFormatter().string(from: date)
        do {
            try await api.updateFollowup(leadId: lead.id, isoDate: iso)
            nextFollowup = iso
            ok = true
        } catch {}
        working = false
        await load()
        return ok
    }
}

// "I opened this client — what's the next right move?"
// Header (who + how engaged) → Smart Score (how close to buying) → Coach (what to do)
// → Quick Actions → Pipeline → Activity. Everything is a shared component.
struct LeadDetailView: View {
    let api: APIClient
    @StateObject private var vm: LeadDetailViewModel
    @State private var toast: String?

    init(api: APIClient, lead: Lead) {
        self.api = api
        _vm = StateObject(wrappedValue: LeadDetailViewModel(api: api, lead: lead))
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 14) {
                headerCard.cardEntrance(0)
                if let score = vm.score {
                    SmartScoreCard(score: score, percentile: vm.scorePercentile).cardEntrance(1)
                }
                if let c = vm.coach {
                    CoachCard(urgency: c.urgency, emoji: c.emoji, title: c.title, reason: c.reason) {
                        primaryButton(c)
                    }
                    .cardEntrance(2)
                }
                quickActions.cardEntrance(3)
                pipelineCard.cardEntrance(4)
                timelineCard.cardEntrance(5)
            }
            .padding(16)
            .padding(.bottom, 110)   // room above the floating mic
        }
        .background(Brand.groupedBg)
        .navigationTitle(vm.lead.fullName)
        .navigationBarTitleDisplayMode(.inline)
        .task { await vm.load() }
        .refreshable { await vm.load() }
        .overlay(alignment: .top) {
            if let toast { ConfirmationToast(text: toast).padding(.top, 6) }
        }
        .overlay {
            VoiceCaptureButton(api: api, lead: vm.lead) { note in
                withAnimation(Motion.spring) { vm.insertNote(note) }
                showToast("Voice note saved")
            }
        }
    }

    // MARK: - Header — who & how engaged.

    private var headerCard: some View {
        PremiumCard {
            VStack(alignment: .leading, spacing: 10) {
                Text(vm.lead.fullName).font(.largeTitle.weight(.bold)).foregroundStyle(Brand.navy)
                    .fixedSize(horizontal: false, vertical: true)
                let meta = [vm.lead.clientType, vm.lead.preferredArea].compactMap { $0 }.joined(separator: " · ")
                if !meta.isEmpty {
                    Text(meta).font(.subheadline).foregroundStyle(.secondary)
                }
                HStack(spacing: 10) {
                    StatusPill(text: activity.label, color: activity.color)
                    Text(lastInteraction).font(.caption).foregroundStyle(.secondary)
                    Spacer(minLength: 0)
                }
            }
        }
    }

    // MARK: - Coach primary (the recommended move → a concrete app action).

    @ViewBuilder
    private func primaryButton(_ c: LeadCoach) -> some View {
        if isStageAction(c) {
            ActionButton(title: c.actionLabel, icon: "arrow.right.circle.fill", style: .primary) {
                Task {
                    if await vm.setStage(c.stage ?? "QUALIFIED") {
                        Haptics.success(); showToast("Stage updated")
                    }
                }
            }
        } else {
            ActionButton(title: c.actionLabel, icon: primaryIcon(c), style: .primary, url: primaryURL(c))
        }
    }

    // MARK: - Quick Actions — the standard toolkit, minus whatever the Coach already promotes.

    private var quickActions: some View {
        VStack(alignment: .leading, spacing: 10) {
            SectionHeader(title: "Quick Actions")
            HStack(spacing: 10) {
                if !primaryIsCall {
                    ActionButton(title: "Call", icon: "phone.fill", style: .secondary, url: PhoneLinks.tel(vm.lead.phone))
                }
                if !primaryIsWhatsApp {
                    ActionButton(title: "WhatsApp", icon: "message.fill", style: .secondary, tint: .green,
                                 url: PhoneLinks.whatsapp(vm.lead.phone, message: "Hi \(firstName)! 👋 Jordan here."))
                }
                Menu {
                    Button("Tomorrow") { setFollowup(1) }
                    Button("In 3 days") { setFollowup(3) }
                    Button("In 1 week") { setFollowup(7) }
                } label: {
                    ActionTile(title: "Follow-up", icon: "bell.fill", enabled: !vm.working)
                }
                .disabled(vm.working)
            }
        }
    }

    // MARK: - Pipeline (demoted) — stage control + follow-up status.

    private var pipelineCard: some View {
        PremiumCard {
            VStack(alignment: .leading, spacing: 14) {
                HStack {
                    SectionHeader(title: "Pipeline")
                    Spacer()
                    stageMenu
                }
                HStack(spacing: 10) {
                    StageBadge(stage: vm.stage)
                    Spacer()
                    Label(followupText, systemImage: "bell.fill").font(.caption).foregroundStyle(.secondary)
                }
                .animation(Motion.spring, value: vm.stage)
            }
        }
    }

    private var stageMenu: some View {
        Menu {
            ForEach(LeadStage.allCases) { option in
                Button {
                    Task {
                        if await vm.setStage(option.rawValue) {
                            Haptics.success(); showToast("Moved to \(option.label)")
                        }
                    }
                } label: {
                    if option.rawValue == vm.stage {
                        Label(option.label, systemImage: "checkmark")
                    } else {
                        Text(option.label)
                    }
                }
            }
        } label: {
            HStack(spacing: 4) {
                Text("Change").font(.caption.weight(.semibold))
                Image(systemName: "chevron.up.chevron.down").font(.system(size: 10))
            }
            .foregroundStyle(Brand.primary)
        }
        .disabled(vm.working)
    }

    // MARK: - Activity (demoted) — what happened last; new notes animate in.

    private var timelineCard: some View {
        PremiumCard {
            VStack(alignment: .leading, spacing: 12) {
                SectionHeader(title: "Activity")
                if vm.loading && vm.timeline.isEmpty {
                    HStack { Spacer(); ProgressView(); Spacer() }.padding(.vertical, 8)
                } else if vm.timeline.isEmpty {
                    Text("No activity yet. Hold the mic to add a voice note.")
                        .font(.subheadline).foregroundStyle(.secondary)
                } else {
                    VStack(spacing: 0) {
                        ForEach(Array(vm.timeline.enumerated()), id: \.element.id) { index, item in
                            if index > 0 { Divider() }
                            timelineRow(item)
                                .transition(.asymmetric(
                                    insertion: .move(edge: .top).combined(with: .opacity),
                                    removal: .opacity))
                        }
                    }
                }
            }
        }
    }

    private func timelineRow(_ item: TimelineItem) -> some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: item.icon).foregroundStyle(Brand.primary).frame(width: 22)
            VStack(alignment: .leading, spacing: 2) {
                Text(item.title).font(.subheadline).foregroundStyle(Brand.navy)
                HStack(spacing: 4) {
                    if let sub = item.subtitle { Text(sub) }
                    if let date = item.date { Text("· \(date.formatted(.relative(presentation: .named)))") }
                }
                .font(.caption).foregroundStyle(.secondary)
            }
            Spacer(minLength: 0)
        }
        .padding(.vertical, 10)
    }

    // MARK: - Derived copy (answers a question, not raw data)

    private var activity: (label: String, color: Color) {
        if vm.lead.lastContact == nil { return ("New — not contacted yet", Brand.primary) }
        switch vm.freshness?.level {
        case "fresh": return ("Recently active", .green)
        case "aging": return ("Cooling off", .orange)
        case "stale": return ("Needs attention", .orange)
        case "cold":  return ("Going cold", Brand.wine)
        default:      return ("Active", Brand.primary)
        }
    }

    private var lastInteraction: String {
        if let lc = vm.lead.lastContact, let d = AppDate.parse(lc) {
            return "Last contact \(d.formatted(.relative(presentation: .named)))"
        }
        if !vm.lead.createdAt.isEmpty, let d = AppDate.parse(vm.lead.createdAt) {
            return "Added \(d.formatted(.relative(presentation: .named)))"
        }
        return ""
    }

    private var followupText: String {
        vm.nextFollowup != nil ? "Follow-up \(AppDate.shortDateTime(vm.nextFollowup))" : "No follow-up"
    }

    // MARK: - Coach action mapping

    private func isStageAction(_ c: LeadCoach) -> Bool {
        c.actionType == "advance" || c.actionType == "qualify"
    }
    private var primaryIsCall: Bool {
        guard let t = vm.coach?.actionType else { return false }
        return t == "call" || t == "schedule"
    }
    private var primaryIsWhatsApp: Bool {
        guard let t = vm.coach?.actionType else { return false }
        return t == "whatsapp" || t == "template"
    }
    private func primaryURL(_ c: LeadCoach) -> URL? {
        switch c.actionType {
        case "whatsapp", "template": return PhoneLinks.whatsapp(vm.lead.phone, message: "Hi \(firstName)! 👋 Jordan here.")
        case "call", "schedule":     return PhoneLinks.tel(vm.lead.phone)
        default:                     return nil
        }
    }
    private func primaryIcon(_ c: LeadCoach) -> String {
        switch c.actionType {
        case "whatsapp", "template": return "message.fill"
        case "call", "schedule":     return "phone.fill"
        default:                     return "arrow.right.circle.fill"
        }
    }

    private var firstName: String {
        vm.lead.fullName.split(separator: " ").first.map(String.init) ?? "there"
    }

    // MARK: - Helpers

    private func setFollowup(_ days: Int) {
        Task {
            if await vm.setFollowup(daysFromNow: days) { Haptics.success(); showToast("Follow-up set") }
        }
    }

    private func showToast(_ text: String) {
        withAnimation(Motion.spring) { toast = text }
        Task {
            try? await Task.sleep(nanoseconds: 1_500_000_000)
            withAnimation(Motion.gentle) { toast = nil }
        }
    }
}
