import SwiftUI

@MainActor
final class LeadDetailViewModel: ObservableObject {
    @Published var lead: Lead
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
            withAnimation(Anim.standard) {
                timeline = TimelineBuilder.merge(notes: d.notes, appointments: d.appointments)
            }
        } catch {
            // Keep the initial header; the Coach card simply won't appear.
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
            withAnimation(Anim.standard) { stage = newStage }
            ok = true
        } catch {}
        working = false
        await load()
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

// Lead Detail as an Apple-grade contact screen: a Contacts/Health-style header
// (monogram, name, status, circular actions) over grouped sections that keep ALL
// the CRM information — readiness, the Coach's move, pipeline progress, activity.
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
            VStack(spacing: Layout.cardSpacing) {
                header
                if let score = vm.score {
                    SmartScoreCard(score: score, percentile: vm.scorePercentile)
                }
                coachSection
                pipelineCard
                timelineCard
            }
            .padding(.horizontal, Layout.screenMargin)
            .padding(.top, Space.sm)
            .padding(.bottom, Layout.bottomInset)
        }
        .background(Brand.groupedBg)
        .navigationTitle(vm.lead.fullName)
        .navigationBarTitleDisplayMode(.inline)
        .task { await vm.load() }
        .refreshable { await vm.load() }
        .overlay(alignment: .bottom) {
            if let toast { ConfirmationToast(text: toast).padding(.bottom, Layout.bottomInset + Space.lg) }
        }
        .overlay {
            VoiceCaptureButton(api: api, lead: vm.lead) { note in
                withAnimation(Anim.standard) { vm.insertNote(note) }
                showToast("Captured — before it slipped away")
            }
        }
    }

    // MARK: - Header (Contacts-style: monogram, name, status, circular actions)

    private var header: some View {
        VStack(spacing: Space.md) {
            Monogram(name: vm.lead.fullName, size: 76)
            VStack(spacing: Space.xs) {
                Text(vm.lead.fullName).font(.title2.weight(.bold)).foregroundStyle(Brand.navy)
                    .multilineTextAlignment(.center).fixedSize(horizontal: false, vertical: true)
                if !meta.isEmpty {
                    Text(meta).font(.subheadline).foregroundStyle(.secondary).multilineTextAlignment(.center)
                }
                HStack(spacing: Space.sm) {
                    StatusPill(text: activity.label, color: activity.color)
                    Text(lastInteraction).font(.footnote).foregroundStyle(.secondary)
                }
            }
            contactActionRow
        }
        .frame(maxWidth: .infinity)
        .padding(.top, Space.sm)
    }

    private var contactActionRow: some View {
        HStack(spacing: Space.md) {
            ContactAction(title: "Call", icon: "phone.fill",
                          url: PhoneLinks.tel(vm.lead.phone))
            ContactAction(title: "WhatsApp", icon: "message.fill", tint: .green,
                          url: PhoneLinks.whatsapp(vm.lead.phone, message: "Hi \(firstName)! 👋 Jordan here."))
            if let dir = MapsLinks.directions(query: vm.lead.preferredArea) {
                ContactAction(title: "Directions", icon: "map.fill", tint: Brand.sky, url: dir)
            }
        }
        .padding(.horizontal, Space.lg)
        .padding(.top, Space.xs)
    }

    // MARK: - Coach (network-gated → skeleton while it loads)

    @ViewBuilder private var coachSection: some View {
        if let c = vm.coach {
            CoachCard(urgency: c.urgency, emoji: c.emoji, title: c.title, reason: c.reason) {
                primaryButton(c)
            }
        } else if vm.loading {
            SkeletonCard(lines: 2)
        }
    }

    @ViewBuilder
    private func primaryButton(_ c: LeadCoach) -> some View {
        if isStageAction(c) {
            ActionButton(title: c.actionLabel, icon: "arrow.right.circle.fill", style: .primary) {
                Task {
                    if await vm.setStage(c.stage ?? "QUALIFIED") {
                        Haptics.success(); showToast("That deal just moved forward")
                    }
                }
            }
        } else {
            ActionButton(title: c.actionLabel, icon: primaryIcon(c), style: .primary, url: primaryURL(c))
        }
    }

    // MARK: - Progress (stage + follow-up — all kept)

    private var pipelineCard: some View {
        PremiumCard {
            VStack(spacing: Space.md) {
                HStack {
                    StageBadge(stage: vm.stage)
                    Spacer()
                    stageMenu
                }
                Divider()
                HStack(spacing: Space.xs) {
                    Image(systemName: "bell").font(.footnote).foregroundStyle(.secondary)
                    Text(followupText).font(.footnote).foregroundStyle(.secondary)
                    Spacer()
                    Menu {
                        Button("Tomorrow") { setFollowup(1) }
                        Button("In 3 days") { setFollowup(3) }
                        Button("In 1 week") { setFollowup(7) }
                    } label: {
                        Text("Set").font(.footnote.weight(.semibold)).foregroundStyle(Brand.primary).hitTarget()
                    }
                    .disabled(vm.working)
                }
            }
            .animation(Anim.standard, value: vm.stage)
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
            HStack(spacing: Space.xs) {
                Text("Change").font(.footnote.weight(.semibold))
                Image(systemName: "chevron.up.chevron.down").font(.system(size: 10))
            }
            .foregroundStyle(Brand.primary)
            .hitTarget()
        }
        .disabled(vm.working)
    }

    // MARK: - Activity (new notes animate in)

    private var timelineCard: some View {
        PremiumCard {
            VStack(alignment: .leading, spacing: Space.md) {
                SectionHeader(title: "Activity")
                if vm.loading && vm.timeline.isEmpty {
                    SkeletonBlock(height: 12).padding(.vertical, Space.xs)
                } else if vm.timeline.isEmpty {
                    Text("Nothing captured yet — hold the mic and I'll remember it for you.")
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
        HStack(alignment: .top, spacing: Space.md) {
            Image(systemName: item.icon).foregroundStyle(Brand.primary).frame(width: 22)
            VStack(alignment: .leading, spacing: Space.xxs) {
                Text(item.title).font(.subheadline).foregroundStyle(Brand.navy)
                HStack(spacing: Space.xs) {
                    if let sub = item.subtitle { Text(sub) }
                    if let date = item.date { Text("· \(date.formatted(.relative(presentation: .named)))") }
                }
                .font(.footnote).foregroundStyle(.secondary)
            }
            Spacer(minLength: 0)
        }
        .padding(.vertical, Space.sm)
    }

    // MARK: - Derived copy

    private var meta: String {
        [vm.lead.clientType, vm.lead.preferredArea].compactMap { $0 }.joined(separator: " · ")
    }

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
        vm.nextFollowup != nil ? "Follow-up \(AppDate.shortDateTime(vm.nextFollowup))" : "No follow-up set"
    }

    // MARK: - Coach action mapping

    private func isStageAction(_ c: LeadCoach) -> Bool { c.actionType == "advance" || c.actionType == "qualify" }
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
            if await vm.setFollowup(daysFromNow: days) { Haptics.success(); showToast("Done — I'll keep this on your radar") }
        }
    }

    private func showToast(_ text: String) {
        withAnimation(Anim.standard) { toast = text }
        Task {
            try? await Task.sleep(nanoseconds: 1_600_000_000)
            withAnimation(Anim.standard) { toast = nil }
        }
    }
}
