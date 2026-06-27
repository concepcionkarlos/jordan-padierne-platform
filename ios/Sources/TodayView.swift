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

// Today — the morning command center. Premium header + polished cards; intentional
// even when the CRM is empty.
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
                Text("Couldn't load Today").font(.headline).foregroundStyle(Brand.navy)
                Text("Pull to refresh, or try again.").font(.subheadline).foregroundStyle(.secondary)
                Button("Try Again") { Task { await vm.load() } }
                    .buttonStyle(.borderedProminent).tint(Brand.primary)
            }
        }
    }

    private func loadedView(_ data: TodayData) -> some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                header
                nextAppointmentCard(data.nextAppointment)
                countsGrid(data.counts)
                if isEmpty(data) { emptyGuidanceCard }
            }
            .padding(20)
            .padding(.bottom, 100)   // breathing room above the mic
        }
        .background(Brand.groupedBg)
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(greeting).font(.system(.largeTitle, design: .default).weight(.bold)).foregroundStyle(Brand.navy)
            Text("Here's what needs attention today").font(.subheadline).foregroundStyle(.secondary)
        }
    }

    private func nextAppointmentCard(_ appt: NextAppointment?) -> some View {
        HStack(spacing: 14) {
            IconTile(symbol: "calendar", tint: Brand.primary)
            VStack(alignment: .leading, spacing: 3) {
                Text("NEXT APPOINTMENT").font(.caption2.weight(.bold)).foregroundStyle(.secondary).tracking(0.6)
                if let appt {
                    Text(appt.title).font(.headline).foregroundStyle(Brand.navy).lineLimit(1)
                    Text(AppDate.shortDateTime(appt.startTime)).font(.subheadline).foregroundStyle(.secondary)
                } else {
                    Text("No upcoming appointments").font(.subheadline).foregroundStyle(.secondary)
                }
            }
            Spacer(minLength: 0)
        }
        .brandCard()
    }

    private func countsGrid(_ c: Counts) -> some View {
        LazyVGrid(columns: [GridItem(.flexible(), spacing: 14), GridItem(.flexible(), spacing: 14)], spacing: 14) {
            statCard("flame.fill", .red, c.hotLeads, "Hot leads")
            statCard("bolt.fill", .orange, c.urgentLeads, "Urgent")
            statCard("clock.badge.exclamationmark", Brand.wine, c.overdueFollowups, "Overdue follow-ups")
            statCard("checklist", Brand.primary, c.todaysTasks, "Today's tasks")
        }
    }

    private func statCard(_ symbol: String, _ tint: Color, _ value: Int, _ label: String) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            IconTile(symbol: symbol, tint: tint)
            VStack(alignment: .leading, spacing: 2) {
                Text("\(value)").font(.system(size: 32, weight: .bold, design: .rounded)).foregroundStyle(Brand.navy)
                Text(label).font(.subheadline).foregroundStyle(.secondary).lineLimit(1).minimumScaleFactor(0.8)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .brandCard()
    }

    private var emptyGuidanceCard: some View {
        VStack(spacing: 12) {
            IconTile(symbol: "sparkles", tint: Brand.primary, size: 48)
            Text("Your day starts here").font(.headline).foregroundStyle(Brand.navy)
            Text("Add your first lead in the web CRM to start seeing hot leads, follow-ups, and tasks here.")
                .font(.subheadline).foregroundStyle(.secondary).multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .brandCard(padding: 24)
    }

    private func isEmpty(_ data: TodayData) -> Bool {
        data.nextAppointment == nil
            && data.counts.hotLeads == 0 && data.counts.urgentLeads == 0
            && data.counts.overdueFollowups == 0 && data.counts.todaysTasks == 0
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
            nextAppointment: nil,
            counts: Counts(hotLeads: 0, urgentLeads: 0, overdueFollowups: 0, todaysTasks: 0)
        ))
        return vm
    }
}

#Preview {
    TodayView(previewModel: .previewLoaded())
        .environmentObject(AppSession(auth: PreviewAuthService()))
}
#endif
