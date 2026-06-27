import SwiftUI

// Routes between the loading splash, Login, and the Face-ID-locked Today.
struct RootView: View {
    let api: APIClient
    @EnvironmentObject private var session: AppSession

    var body: some View {
        Group {
            switch session.state {
            case .loading:
                ProgressView()
                    .task { await session.bootstrap() }
            case .signedOut:
                LoginView()
            case .signedIn:
                LockedGate { MainTabView(api: api) }
            }
        }
        .tint(Brand.primary)
    }
}
