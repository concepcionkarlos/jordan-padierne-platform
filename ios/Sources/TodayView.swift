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

// Today — the read-only command center. Next appointment + the four counts from
// GET /api/today, with loading / error / pull-to-refresh.
struct TodayView: View {
    @EnvironmentObject private var session: AppSession
    @StateObject private var vm: TodayViewModel

    init(api: APIClient) {
        _vm = StateObject(wrappedValue: TodayViewModel(api: api))
    }

    #if DEBUG
    init(previewModel: TodayViewModel) {
        _vm = StateObject(wrappedValue: previewModel)
    }
    #endif

    var body: some View {
        NavigationStack {
            content
                .navigationTitle("Today")
                .toolbar {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button("Sign Out") { Task { await session.signOut() } }
                    }
                }
                .refreshable { await vm.load() }
                .task { await vm.load() }
        }
    }

    @ViewBuilder private var content: some View {
        switch vm.phase {
        case .loading:
            ProgressView("Loading…")
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        case .failed:
            failedView
        case .loaded(let data):
            loadedView(data)
        }
    }

    private var failedView: some View {
        VStack(spacing: 12) {
            Image(systemName: "wifi.exclamationmark")
                .font(.system(size: 34))
                .foregroundStyle(.secondary)
            Text("Couldn’t load Today").font(.headline)
            Text("Pull to refresh, or try again.")
                .font(.subheadline).foregroundStyle(.secondary)
            Button("Try Again") { Task { await vm.load() } }
                .buttonStyle(.bordered)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private func loadedView(_ data: TodayData) -> some View {
        ScrollView {
            VStack(spacing: 16) {
                nextAppointmentCard(data.nextAppointment)
                countsGrid(data.counts)
            }
            .padding()
        }
    }

    private func nextAppointmentCard(_ appt: NextAppointment?) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("NEXT APPOINTMENT")
                .font(.caption2.bold())
                .foregroundStyle(.secondary)
            if let appt {
                Text(appt.title).font(.headline)
                Text(Self.formatTime(appt.startTime))
                    .font(.subheadline).foregroundStyle(.secondary)
                if let name = appt.leadName {
                    Text(name).font(.subheadline)
                }
            } else {
                Text("No upcoming appointments")
                    .font(.subheadline).foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(.quaternary, in: RoundedRectangle(cornerRadius: 16))
    }

    private func countsGrid(_ c: Counts) -> some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
            countTile("🔥", "Hot", c.hotLeads)
            countTile("⚡️", "Urgent", c.urgentLeads)
            countTile("⏰", "Overdue follow-ups", c.overdueFollowups)
            countTile("✅", "Today’s tasks", c.todaysTasks)
        }
    }

    private func countTile(_ emoji: String, _ label: String, _ value: Int) -> some View {
        VStack(spacing: 4) {
            Text(emoji).font(.title2)
            Text("\(value)").font(.system(size: 30, weight: .bold))
            Text(label)
                .font(.caption).foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .background(.quaternary, in: RoundedRectangle(cornerRadius: 16))
    }

    static func formatTime(_ iso: String) -> String {
        let withFrac = ISO8601DateFormatter()
        withFrac.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        let plain = ISO8601DateFormatter()
        plain.formatOptions = [.withInternetDateTime]
        guard let date = withFrac.date(from: iso) ?? plain.date(from: iso) else { return iso }
        return date.formatted(date: .abbreviated, time: .shortened)
    }
}

#if DEBUG
extension TodayViewModel {
    static func previewLoaded() -> TodayViewModel {
        let vm = TodayViewModel(api: APIClient(baseURL: AppConfig.apiBaseURL, auth: PreviewAuthService()))
        vm.phase = .loaded(TodayData(
            nextAppointment: NextAppointment(
                id: "1", title: "Showing — Brickell condo",
                startTime: "2026-06-27T15:00:00Z", type: "showing",
                location: nil, leadName: "María G.", leadPhone: nil
            ),
            counts: Counts(hotLeads: 3, urgentLeads: 2, overdueFollowups: 1, todaysTasks: 4)
        ))
        return vm
    }
}

#Preview {
    TodayView(previewModel: .previewLoaded())
        .environmentObject(AppSession(auth: PreviewAuthService()))
}
#endif
