import SwiftUI

@MainActor
final class LeadsViewModel: ObservableObject {
    @Published var leads: [Lead] = []
    @Published var isLoading = false
    @Published var failed = false
    @Published var search = ""

    private let api: APIClient
    private var searchTask: Task<Void, Never>?

    init(api: APIClient) { self.api = api }

    func load() async {
        isLoading = true
        failed = false
        do { leads = try await api.leads(search: search) }
        catch { failed = true }
        isLoading = false
    }

    func searchChanged() {
        searchTask?.cancel()
        searchTask = Task { [weak self] in
            try? await Task.sleep(nanoseconds: 300_000_000)
            if Task.isCancelled { return }
            await self?.load()
        }
    }
}

struct LeadsListView: View {
    let api: APIClient
    @StateObject private var vm: LeadsViewModel

    init(api: APIClient) {
        self.api = api
        _vm = StateObject(wrappedValue: LeadsViewModel(api: api))
    }

    var body: some View {
        NavigationStack {
            Group {
                if vm.isLoading && vm.leads.isEmpty {
                    ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if vm.failed && vm.leads.isEmpty {
                    ContentUnavailableView("Couldn’t load leads", systemImage: "wifi.exclamationmark", description: Text("Pull to refresh."))
                } else if vm.leads.isEmpty {
                    ContentUnavailableView("No leads yet", systemImage: "person.2", description: Text("Add or import clients from your CRM."))
                } else {
                    list
                }
            }
            .navigationTitle("Leads")
            .searchable(text: $vm.search, prompt: "Search leads")
            .onChange(of: vm.search) { _, _ in vm.searchChanged() }
            .refreshable { await vm.load() }
            .task { if vm.leads.isEmpty { await vm.load() } }
        }
    }

    private var list: some View {
        List(vm.leads) { lead in
            NavigationLink(destination: LeadDetailView(api: api, lead: lead)) {
                LeadRow(lead: lead)
            }
            .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                if let url = PhoneLinks.tel(lead.phone) {
                    Link(destination: url) { Label("Call", systemImage: "phone.fill") }.tint(.green)
                }
                if let url = PhoneLinks.whatsapp(lead.phone) {
                    Link(destination: url) { Label("WhatsApp", systemImage: "message.fill") }.tint(.blue)
                }
            }
        }
        .listStyle(.plain)
    }
}

struct LeadRow: View {
    let lead: Lead

    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle().fill(.quaternary)
                Text(initials).font(.subheadline.weight(.semibold)).foregroundStyle(.secondary)
            }
            .frame(width: 42, height: 42)

            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 6) {
                    Text(lead.fullName).font(.body.weight(.semibold)).lineLimit(1)
                    if lead.hotScore == 3 { Text("🔥") }
                }
                Text(subtitle).font(.caption).foregroundStyle(.secondary).lineLimit(1)
            }

            Spacer()
            StageBadge(stage: lead.pipelineStage)
        }
        .padding(.vertical, 4)
    }

    private var initials: String {
        let chars = lead.fullName.split(separator: " ").prefix(2).compactMap { $0.first }
        return String(chars).uppercased()
    }

    private var subtitle: String {
        lead.preferredArea ?? lead.clientType ?? "—"
    }
}

struct StageBadge: View {
    let stage: String

    var body: some View {
        Text(LeadStage(rawValue: stage)?.label ?? stage)
            .font(.caption2.weight(.semibold))
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(color.opacity(0.16), in: Capsule())
            .foregroundStyle(color)
    }

    private var color: Color {
        switch stage {
        case "NEW": return .blue
        case "QUALIFIED": return .indigo
        case "CONTACTED": return .purple
        case "SHOWING_SCHEDULED": return .orange
        case "NEGOTIATION": return .yellow
        case "CLOSED": return .green
        case "LOST": return .red
        default: return .gray
        }
    }
}
