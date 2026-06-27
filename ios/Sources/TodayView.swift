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
// next-moves are the screen; metrics are demoted to a glance at the bottom.
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
            VStack(alignment: .leading, spacing: 16) {
                header.cardEntrance(0)
                briefCard(data.brief).cardEntrance(1)
                nextMoves(data.actions).cardEntrance(2)
                if let appt = data.nextAppointment { nextAppointmentCard(appt).cardEntrance(3) }
                metricsSection(data.counts).cardEntrance(4)
            }
            .padding(20)
            .padding(.bottom, 110)
        }
        .background(Brand.groupedBg)
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(greeting).font(.system(.largeTitle, design: .default).weight(.bold)).foregroundStyle(Brand.navy)
            Text("Here's what needs you today").font(.subheadline).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    // MARK: Morning Brief (primary)

    private func briefCard(_ brief: [String]) -> some View {
        PremiumCard {
            VStack(alignment: .leading, spacing: 10) {
                SectionHeader(title: "Morning Brief", systemImage: "sparkles", accent: Brand.primary)
                ForEach(Array(brief.enumerated()), id: \.offset) { index, line in
                    Text(line)
                        .font(index == 0 ? .subheadline.weight(.semibold) : .subheadline)
                        .foregroundStyle(Brand.navy)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
        }
    }

    // MARK: Next Moves (Coach — primary)

    private func nextMoves(_ actions: [CoachAction]) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            SectionHeader(title: "Next Moves")
            if actions.isEmpty {
                PremiumCard {
                    EmptyState(icon: "checkmark.seal.fill",
                               title: "You're all caught up",
                               message: "Add a client in the web CRM and your next best moves appear here.",
                               tint: .green)
                    .frame(maxWidth: .infinity)
                }
            } else {
                ForEach(actions) { CoachActionRow(api: api, action: $0) }
            }
        }
    }

    private func nextAppointmentCard(_ appt: NextAppointment) -> some View {
        PremiumCard(padding: 14) {
            HStack(spacing: 12) {
                IconTile(symbol: "calendar", tint: Brand.primary)
                VStack(alignment: .leading, spacing: 2) {
                    SectionHeader(title: "Next Appointment")
                    Text(appt.title).font(.subheadline.weight(.semibold)).foregroundStyle(Brand.navy).lineLimit(1)
                    Text(AppDate.shortDateTime(appt.startTime)).font(.caption).foregroundStyle(.secondary)
                }
                Spacer(minLength: 0)
                if let url = PhoneLinks.tel(appt.leadPhone) {
                    CircleIconLink(url: url, symbol: "phone.fill", tint: Brand.primary)
                }
            }
        }
    }

    // MARK: Today at a glance (demoted metrics)

    private func metricsSection(_ c: Counts) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            SectionHeader(title: "Today at a glance")
            HStack(spacing: 8) {
                MetricChip(icon: "flame.fill", tint: .red, value: c.hotLeads, label: "Hot")
                MetricChip(icon: "bolt.fill", tint: .orange, value: c.urgentLeads, label: "Urgent")
                MetricChip(icon: "clock.badge.exclamationmark", tint: Brand.wine, value: c.overdueFollowups, label: "Overdue")
                MetricChip(icon: "checklist", tint: Brand.primary, value: c.todaysTasks, label: "Tasks")
            }
        }
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
