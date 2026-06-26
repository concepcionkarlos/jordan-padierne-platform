import SwiftUI

// The signed-in shell: Today + Leads. Both tabs share the one APIClient. Foreground
// transitions flush any voice notes that were queued offline.
struct MainTabView: View {
    let api: APIClient
    @EnvironmentObject private var sync: NoteSyncService
    @Environment(\.scenePhase) private var scenePhase

    var body: some View {
        TabView {
            TodayView(api: api)
                .tabItem { Label("Today", systemImage: "house.fill") }
            LeadsListView(api: api)
                .tabItem { Label("Leads", systemImage: "person.2.fill") }
        }
        .onChange(of: scenePhase) { _, newPhase in
            if newPhase == .active { Task { await sync.flush() } }
        }
        .task {
            guard AppConfig.pushEnabled else { return }   // dormant until Increment ③
            PushRegistration.shared.attach(api: api)
            await PushRegistration.shared.requestAndRegister()
        }
    }
}
