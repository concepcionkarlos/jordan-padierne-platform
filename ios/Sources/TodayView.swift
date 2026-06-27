import SwiftUI

@MainActor
final class TodayViewModel: ObservableObject {
    @Published var data: TodayData?
    @Published var failed = false
    private let api: APIClient

    init(api: APIClient) { self.api = api }

    // Refresh keeps the last data on screen (no blanking); only a first, dataless
    // failure flips to the error state.
    func load() async {
        failed = false
        do { data = try await api.today() }
        catch { if data == nil { failed = true } }
    }
}

// "Now" — the assistant home. Native large title; Morning Brief + the Coach's
// next-moves are the screen; metrics are a quiet glance at the bottom.
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
                .navigationTitle(greeting)
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
                .task { if vm.data == nil { await vm.load() } }
        }
        .overlay { VoiceCaptureButton(api: api, lead: nil) }
    }

    @ViewBuilder private var content: some View {
        if let data = vm.data {
            loadedView(data)
        } else if vm.failed {
            failedView
        } else {
            TodaySkeleton()
        }
    }

    private var failedView: some View {
        ZStack {
            Brand.groupedBg.ignoresSafeArea()
            VStack(spacing: Space.md) {
                Image(systemName: "wifi.exclamationmark").font(.system(size: 34)).foregroundStyle(.secondary)
                Text("Couldn't load your day").font(.headline).foregroundStyle(Brand.navy)
                Text("Pull to refresh, or try again.").font(.subheadline).foregroundStyle(.secondary)
                Button("Try Again") { Task { await vm.load() } }.buttonStyle(.borderedProminent).tint(Brand.primary)
            }
        }
    }

    private func loadedView(_ data: TodayData) -> some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Layout.sectionSpacing) {
                Text(todayDate.uppercased()).font(.caption.weight(.semibold)).foregroundStyle(.secondary).tracking(0.5)
                    .padding(.bottom, -Space.sm)
                briefCard(data.brief)
                nextMoves(data.actions)
                if let appt = data.nextAppointment { nextAppointmentCard(appt) }
                metricsSection(data.counts)
            }
            .padding(.horizontal, Layout.screenMargin)
            .padding(.top, Space.xs)
            .padding(.bottom, Layout.bottomInset)
        }
        .background(Brand.groupedBg)
    }

    private var todayDate: String {
        Date().formatted(.dateTime.weekday(.wide).month(.wide).day())
    }

    // MARK: Morning Brief — the assistant speaking. No label; the voice carries it.

    private func briefCard(_ brief: [String]) -> some View {
        PremiumCard {
            VStack(alignment: .leading, spacing: Space.sm) {
                ForEach(Array(brief.enumerated()), id: \.offset) { i, line in
                    Text(line)
                        .font(i == 0 ? .body.weight(.semibold) : .subheadline)
                        .foregroundStyle(i == 0 ? Brand.navy : .secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
        }
    }

    // MARK: Next Moves (Coach)

    private func nextMoves(_ actions: [CoachAction]) -> some View {
        VStack(alignment: .leading, spacing: Layout.cardSpacing) {
            SectionHeader(title: "Next moves")
            if actions.isEmpty {
                PremiumCard {
                    EmptyState(icon: "checkmark.seal",
                               title: "You're ahead of the day",
                               message: "A calm pipeline is a good thing — a perfect moment to open a new door.",
                               tint: .green)
                    .frame(maxWidth: .infinity)
                }
            } else {
                ForEach(actions) { CoachActionRow(api: api, action: $0) }
            }
        }
    }

    private func nextAppointmentCard(_ appt: NextAppointment) -> some View {
        PremiumCard {
            HStack(spacing: Space.md) {
                IconTile(symbol: "calendar", tint: Brand.primary)
                VStack(alignment: .leading, spacing: Space.xxs) {
                    Text("Next appointment").font(Typography.sectionLabel).foregroundStyle(.secondary)
                    Text(appt.title).font(.subheadline.weight(.semibold)).foregroundStyle(Brand.navy).lineLimit(1)
                    Text(AppDate.shortDateTime(appt.startTime)).font(.footnote).foregroundStyle(.secondary)
                }
                Spacer(minLength: 0)
                if let url = PhoneLinks.tel(appt.leadPhone) {
                    CircleIconLink(url: url, symbol: "phone.fill", tint: Brand.primary)
                }
            }
        }
    }

    // MARK: A quiet glance (demoted)

    private func metricsSection(_ c: Counts) -> some View {
        HStack(spacing: Space.sm) {
            MetricChip(icon: "flame.fill", tint: .red, value: c.hotLeads, label: "Hot")
            MetricChip(icon: "bolt.fill", tint: .orange, value: c.urgentLeads, label: "Urgent")
            MetricChip(icon: "clock.badge.exclamationmark", tint: Brand.wine, value: c.overdueFollowups, label: "Overdue")
            MetricChip(icon: "checklist", tint: Brand.primary, value: c.todaysTasks, label: "Tasks")
        }
    }

    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        let part = hour < 5 ? "Working late" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
        return "\(part), Jordan"
    }
}

// Elegant placeholder while the day loads.
struct TodaySkeleton: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Layout.sectionSpacing) {
                SkeletonCard(lines: 2)
                VStack(spacing: Layout.cardSpacing) {
                    SkeletonCard(lines: 3)
                    SkeletonCard(lines: 3)
                }
                SkeletonCard(lines: 1)
            }
            .padding(.horizontal, Layout.screenMargin)
            .padding(.top, Space.sm)
        }
        .background(Brand.groupedBg)
        .disabled(true)
    }
}

#if DEBUG
extension TodayViewModel {
    static func previewLoaded() -> TodayViewModel {
        let vm = TodayViewModel(api: APIClient(baseURL: AppConfig.apiBaseURL, auth: PreviewAuthService()))
        vm.data = TodayData(
            brief: [
                "Start here: call María — a brand-new lead worth moving on now.",
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
        )
        return vm
    }
}

#Preview {
    TodayView(previewModel: .previewLoaded())
        .environmentObject(AppSession(auth: PreviewAuthService()))
}
#endif
