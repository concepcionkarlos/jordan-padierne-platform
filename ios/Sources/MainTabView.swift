import SwiftUI

// The signed-in shell: Today + Leads. Both tabs share the one APIClient.
struct MainTabView: View {
    let api: APIClient

    var body: some View {
        TabView {
            TodayView(api: api)
                .tabItem { Label("Today", systemImage: "house.fill") }
            LeadsListView(api: api)
                .tabItem { Label("Leads", systemImage: "person.2.fill") }
        }
    }
}
