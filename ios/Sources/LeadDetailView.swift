import SwiftUI

@MainActor
final class LeadDetailViewModel: ObservableObject {
    @Published var lead: Lead              // upgraded to the full record once detail loads
    @Published var score: Int?
    @Published var temperature: Int?       // hot_score: 3 hot / 2 warm / 1 cold
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

    // One call returns the full lead + Smart Score + temperature + Coach move + timeline.
    func load() async {
        loading = true
        defer { loading = false }
        do {
            let d = try await api.leadDetail(id: lead.id)
            lead = d.lead
            score = d.score
            temperature = d.temperature
            coach = d.coach
            stage = d.lead.pipelineStage
            nextFollowup = d.lead.nextFollowup
            timeline = TimelineBuilder.merge(notes: d.notes, appointments: d.appointments)
        } catch {
            // Keep the initial header from the passed-in lead; the Coach card just won't show.
        }
    }

    func insertNote(_ note: Note) {
        let item = TimelineItem(id: "note-\(note.id)", kind: .note, title: note.content,
                                subtitle: note.author, date: AppDate.parse(note.createdAt) ?? Date())
        timeline.insert(item, at: 0)
    }

    func setStage(_ newStage: String) async {
        guard newStage != stage else { return }
        working = true
        do {
            try await api.updateStage(leadId: lead.id, stage: newStage)
            stage = newStage
        } catch {}
        working = false
        await load()   // refresh the Coach move now that the stage changed
    }

    func setFollowup(daysFromNow days: Int) async {
        working = true
        let date = Calendar.current.date(byAdding: .day, value: days, to: Date()) ?? Date()
        let iso = ISO8601DateFormatter().string(from: date)
        do {
            try await api.updateFollowup(leadId: lead.id, isoDate: iso)
            nextFollowup = iso
        } catch {}
        working = false
        await load()   // a new follow-up can change the recommended move
    }
}

// "I opened this client — what's the next right move?"
// Header (who + how ready) → Coach card (what + why + do it) → demoted pipeline + timeline.
struct LeadDetailView: View {
    let api: APIClient
    @StateObject private var vm: LeadDetailViewModel

    init(api: APIClient, lead: Lead) {
        self.api = api
        _vm = StateObject(wrappedValue: LeadDetailViewModel(api: api, lead: lead))
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 14) {
                headerCard
                if let coach = vm.coach { coachCard(coach) }
                pipelineCard
                timelineCard
            }
            .padding(16)
            .padding(.bottom, 100)   // room above the floating mic
        }
        .background(Brand.groupedBg)
        .navigationTitle(vm.lead.fullName)
        .navigationBarTitleDisplayMode(.inline)
        .task { await vm.load() }
        .refreshable { await vm.load() }
        .overlay {
            VoiceCaptureButton(api: api, lead: vm.lead) { note in vm.insertNote(note) }
        }
    }

    // MARK: - Header — who is this person & how ready are they?

    private var headerCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top, spacing: 8) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(vm.lead.fullName).font(.title2.weight(.bold)).foregroundStyle(Brand.navy)
                    let meta = [vm.lead.clientType, vm.lead.preferredArea].compactMap { $0 }.joined(separator: " · ")
                    if !meta.isEmpty {
                        Text(meta).font(.subheadline).foregroundStyle(.secondary)
                    }
                }
                Spacer(minLength: 8)
                if let t = vm.temperature { tempPill(t) }
            }
            HStack(spacing: 8) {
                StageBadge(stage: vm.stage)
                if let score = vm.score { scoreChip(score) }
                Spacer(minLength: 0)
                if !vm.lead.createdAt.isEmpty {
                    Text("Added \(AppDate.relative(vm.lead.createdAt))").font(.caption).foregroundStyle(.secondary)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .brandCard()
    }

    // MARK: - Coach — the next right move, front and center.

    private func coachCard(_ c: LeadCoach) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 6) {
                urgencyTag(c.urgency)
                Text("YOUR NEXT MOVE").font(.caption2.weight(.bold)).foregroundStyle(.secondary).tracking(0.6)
                Spacer(minLength: 0)
                Text(c.emoji)
            }
            Text(c.title).font(.headline).foregroundStyle(Brand.navy)
                .fixedSize(horizontal: false, vertical: true)
            Text(c.reason).font(.subheadline).foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
            primaryButton(c)
            secondaryRow
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .brandCard(padding: 18)
        .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .stroke(urgencyColor(c.urgency).opacity(0.30), lineWidth: 1.5)
        )
    }

    @ViewBuilder
    private func primaryButton(_ c: LeadCoach) -> some View {
        if isStageAction(c) {
            Button { Task { await vm.setStage(c.stage ?? "QUALIFIED") } } label: {
                primaryLabel(c.actionLabel, "arrow.right.circle.fill")
            }
            .disabled(vm.working)
        } else if let url = primaryURL(c) {
            Link(destination: url) { primaryLabel(c.actionLabel, primaryIcon(c)) }
        } else {
            primaryLabel(c.actionLabel, primaryIcon(c)).opacity(0.4)
        }
    }

    private func primaryLabel(_ text: String, _ icon: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: icon).font(.system(size: 16, weight: .semibold))
            Text(text).font(.subheadline.weight(.bold))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 13)
        .background(Brand.primary, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
        .foregroundStyle(.white)
    }

    // Call · WhatsApp · Follow-up. (Voice Note is the persistent floating mic below —
    // one premium press-and-hold entry point, not a second, inconsistent tap action.)
    private var secondaryRow: some View {
        HStack(spacing: 10) {
            secLink("Call", "phone.fill", url: PhoneLinks.tel(vm.lead.phone))
            secLink("WhatsApp", "message.fill",
                    url: PhoneLinks.whatsapp(vm.lead.phone, message: "Hi \(firstName)! 👋 Jordan here."))
            Menu {
                Button("Tomorrow") { Task { await vm.setFollowup(daysFromNow: 1) } }
                Button("In 3 days") { Task { await vm.setFollowup(daysFromNow: 3) } }
                Button("In 1 week") { Task { await vm.setFollowup(daysFromNow: 7) } }
            } label: {
                secContent("Follow-up", "bell.fill")
            }
            .disabled(vm.working)
        }
    }

    @ViewBuilder
    private func secLink(_ title: String, _ icon: String, url: URL?) -> some View {
        if let url {
            Link(destination: url) { secContent(title, icon) }
        } else {
            secContent(title, icon).opacity(0.35)
        }
    }

    private func secContent(_ title: String, _ icon: String) -> some View {
        VStack(spacing: 5) {
            Image(systemName: icon).font(.system(size: 15, weight: .semibold))
            Text(title).font(.caption2.weight(.semibold))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 11)
        .background(Brand.primary.opacity(0.10), in: RoundedRectangle(cornerRadius: 12, style: .continuous))
        .foregroundStyle(Brand.primary)
    }

    // MARK: - Pipeline (demoted) — stage control + follow-up status.

    private var pipelineCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("PIPELINE").font(.caption2.weight(.bold)).foregroundStyle(.secondary).tracking(0.6)
                Spacer()
                stageMenu
            }
            Divider()
            HStack(spacing: 8) {
                Image(systemName: "bell.fill").font(.caption).foregroundStyle(.secondary)
                Text(vm.nextFollowup != nil ? "Follow-up: \(AppDate.shortDateTime(vm.nextFollowup))" : "No follow-up set")
                    .font(.subheadline).foregroundStyle(vm.nextFollowup != nil ? Brand.navy : .secondary)
                Spacer(minLength: 0)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .brandCard()
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
            HStack(spacing: 4) {
                Text("Change stage").font(.caption.weight(.semibold))
                Image(systemName: "chevron.up.chevron.down").font(.system(size: 10))
            }
            .foregroundStyle(Brand.primary)
        }
        .disabled(vm.working)
    }

    // MARK: - Activity (demoted) — what happened last.

    private var timelineCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("ACTIVITY").font(.caption2.weight(.bold)).foregroundStyle(.secondary).tracking(0.6)
            if vm.loading && vm.timeline.isEmpty {
                HStack { Spacer(); ProgressView(); Spacer() }.padding(.vertical, 8)
            } else if vm.timeline.isEmpty {
                Text("No activity yet. Hold the mic to add a voice note.")
                    .font(.subheadline).foregroundStyle(.secondary)
            } else {
                ForEach(Array(vm.timeline.enumerated()), id: \.element.id) { index, item in
                    if index > 0 { Divider() }
                    HStack(alignment: .top, spacing: 12) {
                        Image(systemName: item.icon).foregroundStyle(Brand.primary).frame(width: 22)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(item.title).font(.subheadline).foregroundStyle(Brand.navy)
                            HStack(spacing: 4) {
                                if let sub = item.subtitle { Text(sub) }
                                if let date = item.date {
                                    Text("· \(date.formatted(.relative(presentation: .named)))")
                                }
                            }
                            .font(.caption).foregroundStyle(.secondary)
                        }
                        Spacer(minLength: 0)
                    }
                    .padding(.vertical, 2)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .brandCard()
    }

    // MARK: - Action mapping (coach intent → concrete app action)

    private func isStageAction(_ c: LeadCoach) -> Bool {
        c.actionType == "advance" || c.actionType == "qualify"
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

    // MARK: - Small reusable bits

    private func tempPill(_ t: Int) -> some View {
        let (label, color, emoji): (String, Color, String) =
            t >= 3 ? ("Hot", .red, "🔥") : t == 2 ? ("Warm", .orange, "🌤️") : ("Cold", Brand.sky, "❄️")
        return HStack(spacing: 4) {
            Text(emoji).font(.caption2)
            Text(label).font(.caption2.weight(.bold))
        }
        .foregroundStyle(color)
        .padding(.horizontal, 9).padding(.vertical, 5)
        .background(color.opacity(0.14), in: Capsule())
    }

    private func scoreChip(_ score: Int) -> some View {
        let color: Color = score >= 75 ? .red : score >= 50 ? .orange : score >= 30 ? Brand.sky : .gray
        return HStack(spacing: 3) {
            Image(systemName: "bolt.fill").font(.system(size: 10))
            Text("Score \(score)").font(.caption2.weight(.bold))
        }
        .foregroundStyle(color)
        .padding(.horizontal, 8).padding(.vertical, 4)
        .background(color.opacity(0.14), in: Capsule())
    }

    private func urgencyTag(_ u: String) -> some View {
        let s = urgencyStyle(u)
        return Text(s.0).font(.caption2.weight(.bold)).foregroundStyle(s.1)
            .padding(.horizontal, 7).padding(.vertical, 2)
            .background(s.1.opacity(0.15), in: Capsule())
    }

    private func urgencyColor(_ u: String) -> Color { urgencyStyle(u).1 }

    private func urgencyStyle(_ u: String) -> (String, Color) {
        switch u {
        case "now":   return ("Do Now", Brand.wine)
        case "today": return ("Today", .orange)
        case "soon":  return ("Soon", Brand.sky)
        default:      return ("Nurture", .gray)
        }
    }

    private var firstName: String {
        vm.lead.fullName.split(separator: " ").first.map(String.init) ?? "there"
    }
}
