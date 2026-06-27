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
                    LeadsSkeleton()
                } else if vm.failed && vm.leads.isEmpty {
                    errorState
                } else if vm.leads.isEmpty {
                    emptyState
                } else {
                    list
                }
            }
            .navigationTitle("Leads")
            .searchable(text: $vm.search, prompt: "Search clients")
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
            .listRowSeparator(.hidden)
            .listRowBackground(Color.clear)
            .listRowInsets(EdgeInsets(top: Space.xs, leading: Layout.screenMargin, bottom: Space.xs, trailing: Layout.screenMargin))
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
        .scrollContentBackground(.hidden)
        .background(Brand.groupedBg)
    }

    private var emptyState: some View {
        ZStack {
            Brand.groupedBg.ignoresSafeArea()
            EmptyState(icon: "person.2",
                       title: "No clients yet",
                       message: "New leads from your website and CRM will appear here.",
                       hint: "Add or import clients from the web.")
        }
    }

    private var errorState: some View {
        ZStack {
            Brand.groupedBg.ignoresSafeArea()
            VStack(spacing: Space.md) {
                Image(systemName: "wifi.exclamationmark").font(.system(size: 34)).foregroundStyle(.secondary)
                Text("Couldn't load clients").font(.headline).foregroundStyle(Brand.navy)
                Text("Pull to refresh, or try again.").font(.subheadline).foregroundStyle(.secondary)
                Button("Try Again") { Task { await vm.load() } }
                    .buttonStyle(.borderedProminent).tint(Brand.primary)
            }
        }
    }
}

struct LeadRow: View {
    let lead: Lead

    var body: some View {
        HStack(spacing: Space.md) {
            ZStack {
                Circle().fill(Brand.primary.opacity(0.12))
                Text(initials).font(.subheadline.weight(.bold)).foregroundStyle(Brand.primary)
            }
            .frame(width: 44, height: 44)

            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: Space.xs) {
                    Text(lead.fullName).font(.body.weight(.semibold)).foregroundStyle(Brand.navy).lineLimit(1)
                    if lead.hotScore == 3 { Text("🔥").font(.caption) }
                }
                Text(subtitle).font(.footnote).foregroundStyle(.secondary).lineLimit(1)
            }

            Spacer(minLength: Space.sm)
            VStack(alignment: .trailing, spacing: Space.xs) {
                if let score = lead.score { ScorePill(score: score) }
                StageBadge(stage: lead.pipelineStage)
            }
        }
        .padding(.vertical, Space.sm)
        .padding(.horizontal, Space.md)
        .background(Brand.cardBg, in: RoundedRectangle(cornerRadius: Radius.card, style: .continuous))
    }

    private var initials: String {
        let chars = lead.fullName.split(separator: " ").prefix(2).compactMap { $0.first }
        return String(chars).uppercased()
    }

    private var subtitle: String {
        lead.preferredArea ?? lead.clientType ?? "—"
    }
}

// Elegant placeholder while clients load.
struct LeadsSkeleton: View {
    var body: some View {
        ScrollView {
            VStack(spacing: Space.sm) {
                ForEach(0..<8, id: \.self) { _ in
                    HStack(spacing: Space.md) {
                        Circle().fill(Color.primary.opacity(0.08)).frame(width: 44, height: 44)
                        VStack(alignment: .leading, spacing: Space.sm) {
                            SkeletonBlock(height: 13, width: 160)
                            SkeletonBlock(height: 10, width: 90)
                        }
                        Spacer()
                    }
                    .padding(.vertical, Space.sm)
                    .padding(.horizontal, Space.md)
                    .background(Brand.cardBg, in: RoundedRectangle(cornerRadius: Radius.card, style: .continuous))
                }
            }
            .padding(.horizontal, Layout.screenMargin)
            .padding(.top, Space.sm)
        }
        .background(Brand.groupedBg)
        .disabled(true)
    }
}
