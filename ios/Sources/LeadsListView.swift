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
                    ZStack { Brand.groupedBg.ignoresSafeArea(); ProgressView() }
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
            .listRowInsets(EdgeInsets(top: 5, leading: 16, bottom: 5, trailing: 16))
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

    // Professional, intentional empty state.
    private var emptyState: some View {
        ZStack {
            Brand.groupedBg.ignoresSafeArea()
            VStack(spacing: 18) {
                ZStack {
                    Circle().fill(Brand.primary.opacity(0.10))
                    Image(systemName: "person.2.fill").font(.system(size: 30, weight: .medium)).foregroundStyle(Brand.primary)
                }
                .frame(width: 84, height: 84)

                VStack(spacing: 6) {
                    Text("No clients yet").font(.title3.weight(.bold)).foregroundStyle(Brand.navy)
                    Text("New leads from your website and CRM will appear here.")
                        .font(.subheadline).foregroundStyle(.secondary).multilineTextAlignment(.center)
                }

                HStack(spacing: 8) {
                    Image(systemName: "arrow.up.forward.app.fill").font(.footnote)
                    Text("Add or import clients from the web CRM.").font(.footnote.weight(.semibold))
                }
                .foregroundStyle(Brand.primary)
                .padding(.horizontal, 16).padding(.vertical, 11)
                .background(Brand.primary.opacity(0.10), in: Capsule())
            }
            .padding(40)
        }
    }

    private var errorState: some View {
        ZStack {
            Brand.groupedBg.ignoresSafeArea()
            VStack(spacing: 12) {
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
        HStack(spacing: 12) {
            ZStack {
                Circle().fill(Brand.primary.opacity(0.12))
                Text(initials).font(.subheadline.weight(.bold)).foregroundStyle(Brand.primary)
            }
            .frame(width: 44, height: 44)

            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 6) {
                    Text(lead.fullName).font(.body.weight(.semibold)).foregroundStyle(Brand.navy).lineLimit(1)
                    if lead.hotScore == 3 { Text("🔥") }
                }
                Text(subtitle).font(.caption).foregroundStyle(.secondary).lineLimit(1)
            }

            Spacer(minLength: 8)
            VStack(alignment: .trailing, spacing: 5) {
                if let score = lead.score { scoreChip(score) }
                StageBadge(stage: lead.pipelineStage)
            }
        }
        .padding(.vertical, 8)
        .padding(.horizontal, 14)
        .background(Brand.cardBg, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
        .shadow(color: Color.black.opacity(0.05), radius: 6, y: 2)
    }

    private func scoreChip(_ score: Int) -> some View {
        let color: Color = score >= 75 ? .red : score >= 50 ? .orange : score >= 30 ? Brand.sky : .gray
        return HStack(spacing: 3) {
            Image(systemName: "bolt.fill").font(.system(size: 9))
            Text("\(score)").font(.caption2.weight(.bold))
        }
        .foregroundStyle(color)
        .padding(.horizontal, 6).padding(.vertical, 2)
        .background(color.opacity(0.14), in: Capsule())
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
            .padding(.horizontal, 9)
            .padding(.vertical, 4)
            .background(color.opacity(0.16), in: Capsule())
            .foregroundStyle(color)
    }

    private var color: Color {
        switch stage {
        case "NEW": return Brand.sky
        case "QUALIFIED": return .indigo
        case "CONTACTED": return .purple
        case "SHOWING_SCHEDULED": return .orange
        case "NEGOTIATION": return Brand.wine
        case "CLOSED": return .green
        case "LOST": return .gray
        default: return .gray
        }
    }
}
