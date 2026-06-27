import SwiftUI

@MainActor
final class TodayViewModel: ObservableObject {
    enum Phase {
        case loading
        case loaded(TodayData)
        case failed
    }

    @Published var phase: Phase = .loading
    private let api: APIClient

    init(api: APIClient) { self.api = api }

    func load() async {
        phase = .loading
        do { phase = .loaded(try await api.today()) }
        catch { phase = .failed }
    }
}

// "Now" — the executive-assistant home. Morning Brief + the Coach's ranked
// next-moves are the screen; stats are demoted to a glance.
struct TodayView: View {
    let api: APIClient
    @EnvironmentObject private var session: AppSession
    @StateObject private var vm: TodayViewModel

    init(api: APIClient) {
        self.api = api
        _vm = StateObject(wrappedValue: TodayViewModel(api: api))
    }

    #if DEBUG
    init(previewModel: TodayViewModel) {
        self.api = APIClient(baseURL: AppConfig.apiBaseURL, auth: PreviewAuthService())
        _vm = StateObject(wrappedValue: previewModel)
    }
    #endif

    var body: some View {
        NavigationStack {
            content
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .topBarTrailing) {
                        Menu {
                            Button(role: .destructive) { Task { await session.signOut() } } label: {
                                Label("Sign Out", systemImage: "rectangle.portrait.and.arrow.right")
                            }
                        } label: {
                            Image(systemName: "person.crop.circle").foregroundStyle(Brand.primary)
                        }
                    }
                }
                .refreshable { await vm.load() }
                .task { await vm.load() }
        }
        .overlay { VoiceCaptureButton(api: api, lead: nil) }
    }

    @ViewBuilder private var content: some View {
        switch vm.phase {
        case .loading:
            ZStack { Brand.groupedBg.ignoresSafeArea(); ProgressView() }
        case .failed:
            failedView
        case .loaded(let data):
            loadedView(data)
        }
    }

    private var failedView: some View {
        ZStack {
            Brand.groupedBg.ignoresSafeArea()
            VStack(spacing: 12) {
                Image(systemName: "wifi.exclamationmark").font(.system(size: 34)).foregroundStyle(.secondary)
                Text("Couldn't load your day").font(.headline).foregroundStyle(Brand.navy)
                Text("Pull to refresh, or try again.").font(.subheadline).foregroundStyle(.secondary)
                Button("Try Again") { Task { await vm.load() } }.buttonStyle(.borderedProminent).tint(Brand.primary)
            }
        }
    }

    private func loadedView(_ data: TodayData) -> some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                header
                briefCard(data.brief)
                if let appt = data.nextAppointment { nextAppointmentCard(appt) }
                nextMoves(data.actions)
                statsStrip(data.counts)
            }
            .padding(20)
            .padding(.bottom, 100)   // breathing room above the mic
        }
        .background(Brand.groupedBg)
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(greeting).font(.system(.largeTitle, design: .default).weight(.bold)).foregroundStyle(Brand.navy)
            Text("Here's what needs you today").font(.subheadline).foregroundStyle(.secondary)
        }
    }

    // MARK: Morning Brief (primary)

    private func briefCard(_ brief: [String]) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 6) {
                Image(systemName: "sparkles").font(.caption).foregroundStyle(Brand.primary)
                Text("MORNING BRIEF").font(.caption2.weight(.bold)).foregroundStyle(Brand.primary).tracking(0.6)
            }
            ForEach(Array(brief.enumerated()), id: \.offset) { index, line in
                Text(line)
                    .font(index == 0 ? .subheadline.weight(.semibold) : .subheadline)
                    .foregroundStyle(Brand.navy)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .brandCard()
    }

    private func nextAppointmentCard(_ appt: NextAppointment) -> some View {
        HStack(spacing: 12) {
            IconTile(symbol: "calendar", tint: Brand.primary)
            VStack(alignment: .leading, spacing: 2) {
                Text("NEXT APPOINTMENT").font(.caption2.weight(.bold)).foregroundStyle(.secondary).tracking(0.5)
                Text(appt.title).font(.subheadline.weight(.semibold)).foregroundStyle(Brand.navy).lineLimit(1)
                Text(AppDate.shortDateTime(appt.startTime)).font(.caption).foregroundStyle(.secondary)
            }
            Spacer(minLength: 0)
        }
        .brandCard(padding: 14)
    }

    // MARK: Next Moves (Coach — primary)

    private func nextMoves(_ actions: [CoachAction]) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("NEXT MOVES").font(.caption2.weight(.bold)).foregroundStyle(.secondary).tracking(0.6)
            if actions.isEmpty {
                VStack(spacing: 8) {
                    IconTile(symbol: "checkmark.seal.fill", tint: .green, size: 44)
                    Text("You're all caught up").font(.headline).foregroundStyle(Brand.navy)
                    Text("Add a client in the web CRM and your next best moves will appear here.")
                        .font(.subheadline).foregroundStyle(.secondary).multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity)
                .brandCard(padding: 24)
            } else {
                ForEach(actions) { actionCard($0) }
            }
        }
    }

    private func actionCard(_ a: CoachAction) -> some View {
        HStack(spacing: 12) {
            NavigationLink {
                LeadDetailView(api: api, lead: Lead(minimalId: a.leadId, name: a.name, phone: a.phone, stage: a.stage, score: a.score))
            } label: {
                VStack(alignment: .leading, spacing: 6) {
                    Text(a.title).font(.subheadline.weight(.semibold)).foregroundStyle(Brand.navy)
                        .lineLimit(2).multilineTextAlignment(.leading)
                    HStack(spacing: 6) {
                        urgencyTag(a.urgency)
                        Text(a.name).font(.caption).foregroundStyle(.secondary).lineLimit(1)
                        scorePill(a.score)
                    }
                    Text(a.reason).font(.caption2).foregroundStyle(.secondary)
                        .lineLimit(2).multilineTextAlignment(.leading)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .buttonStyle(.plain)

            VStack(spacing: 8) {
                if let url = PhoneLinks.tel(a.phone) {
                    Link(destination: url) { circleIcon("phone.fill", Brand.primary) }
                }
                if let url = PhoneLinks.whatsapp(a.phone, message: "Hi \(firstName(a.name))! 👋 Jordan here.") {
                    Link(destination: url) { circleIcon("message.fill", .green) }
                }
            }
        }
        .brandCard(padding: 14)
    }

    // MARK: Stats (demoted glance)

    private func statsStrip(_ c: Counts) -> some View {
        HStack(spacing: 8) {
            statPill("flame.fill", .red, c.hotLeads, "Hot")
            statPill("bolt.fill", .orange, c.urgentLeads, "Urgent")
            statPill("clock.badge.exclamationmark", Brand.wine, c.overdueFollowups, "Overdue")
            statPill("checklist", Brand.primary, c.todaysTasks, "Tasks")
        }
    }

    private func statPill(_ symbol: String, _ tint: Color, _ value: Int, _ label: String) -> some View {
        VStack(spacing: 4) {
            HStack(spacing: 4) {
                Image(systemName: symbol).font(.system(size: 11)).foregroundStyle(tint)
                Text("\(value)").font(.subheadline.weight(.bold)).foregroundStyle(Brand.navy)
            }
            Text(label).font(.caption2).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 10)
        .background(Brand.cardBg, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
    }

    // MARK: Bits

    private func urgencyTag(_ u: String) -> some View {
        let s = urgencyStyle(u)
        return Text(s.0).font(.caption2.weight(.bold)).foregroundStyle(s.1)
            .padding(.horizontal, 7).padding(.vertical, 2)
            .background(s.1.opacity(0.15), in: Capsule())
    }

    private func urgencyStyle(_ u: String) -> (String, Color) {
        switch u {
        case "now": return ("Do Now", Brand.wine)
        case "today": return ("Today", .orange)
        case "soon": return ("Soon", Brand.sky)
        default: return ("Nurture", .gray)
        }
    }

    private func scorePill(_ score: Int) -> some View {
        let color: Color = score >= 75 ? .red : score >= 50 ? .orange : score >= 30 ? Brand.sky : .gray
        return HStack(spacing: 3) {
            Image(systemName: "bolt.fill").font(.system(size: 9))
            Text("\(score)").font(.caption2.weight(.bold))
        }
        .foregroundStyle(color)
        .padding(.horizontal, 6).padding(.vertical, 2)
        .background(color.opacity(0.14), in: Capsule())
    }

    private func circleIcon(_ symbol: String, _ tint: Color) -> some View {
        Image(systemName: symbol).font(.system(size: 15, weight: .semibold)).foregroundStyle(.white)
            .frame(width: 38, height: 38).background(tint, in: Circle())
    }

    private func firstName(_ full: String) -> String {
        full.split(separator: " ").first.map(String.init) ?? "there"
    }

    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        let part = hour < 5 ? "Working late" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
        return "\(part), Jordan"
    }
}

#if DEBUG
extension TodayViewModel {
    static func previewLoaded() -> TodayViewModel {
        let vm = TodayViewModel(api: APIClient(baseURL: AppConfig.apiBaseURL, auth: PreviewAuthService()))
        vm.phase = .loaded(TodayData(
            brief: [
                "Start here: Call now — brand new lead — María G.",
                "1 deal at risk — David has gone quiet for 6 days.",
            ],
            actions: [
                CoachAction(leadId: "1", name: "María G.", phone: nil, stage: "NEGOTIATION", score: 82,
                            urgency: "now", title: "Call now — brand new lead",
                            reason: "Speed wins. Leads contacted within 5 minutes convert far more often.",
                            emoji: "⚡", actionLabel: "Call now"),
            ],
            counts: Counts(hotLeads: 1, urgentLeads: 2, overdueFollowups: 1, todaysTasks: 3),
            nextAppointment: nil
        ))
        return vm
    }
}

#Preview {
    TodayView(previewModel: .previewLoaded())
        .environmentObject(AppSession(auth: PreviewAuthService()))
}
#endif
