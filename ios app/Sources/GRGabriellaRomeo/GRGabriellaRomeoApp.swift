import CoreText
import SwiftUI

@main
struct GRGabriellaRomeoApp: App {
    @StateObject private var store = AppStore()

    init() {
        FontRegistrar.registerAll()
    }

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

enum FontRegistrar {
    static func registerAll() {
        ["Michroma.ttf"].forEach(registerFont)
    }

    private static func registerFont(named fileName: String) {
        let parts = fileName.split(separator: ".").map(String.init)
        guard let name = parts.first, let ext = parts.last,
              let url = Bundle.main.url(forResource: name, withExtension: ext) else { return }
        CTFontManagerRegisterFontsForURL(url as CFURL, .process, nil)
    }
}

extension Color {
    static let grGold = Color(red: 0.831, green: 0.686, blue: 0.216)
}
