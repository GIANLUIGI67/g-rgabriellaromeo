import SwiftUI

@main
struct GRGabriellaRomeoApp: App {
    @StateObject private var store = AppStore()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(store)
                .task {
                    await store.bootstrap()
                }
        }
    }
}

extension Color {
    static let grGold = Color(red: 0.831, green: 0.686, blue: 0.216)
}
