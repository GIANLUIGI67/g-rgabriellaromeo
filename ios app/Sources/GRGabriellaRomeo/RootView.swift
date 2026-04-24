import SwiftUI
import UIKit

struct RootView: View {
    @EnvironmentObject private var store: AppStore
    @State private var isMenuOpen = false
    @State private var isContactOpen = false
    @State private var isAccountOpen = false
    @State private var showWishlistMessage = false

    var body: some View {
        NavigationStack {
            GeometryReader { geometry in
                ZStack(alignment: .top) {
                    HeroBackground()

                    VStack(spacing: 0) {
                        WebHeader(
                            isMenuOpen: $isMenuOpen,
                            isContactOpen: $isContactOpen,
                            isAccountOpen: $isAccountOpen,
                            showWishlistMessage: $showWishlistMessage
                        )
                        .padding(.top, max(12, geometry.safeAreaInsets.top + 8))
                        .padding(.horizontal, 18)

                        Spacer()

                        BrandMark()
                            .padding(.bottom, geometry.size.height * 0.23)

                        Spacer()

                        FooterSocialBlock()
                            .padding(.bottom, max(26, geometry.safeAreaInsets.bottom + 18))
                    }
                    .frame(width: geometry.size.width, height: geometry.size.height)

                    if isMenuOpen {
                        NavigationDrawer(isPresented: $isMenuOpen)
                            .padding(.top, max(98, geometry.safeAreaInsets.top + 72))
                            .transition(.opacity)
                            .zIndex(10)
                    }

                    if isContactOpen {
                        ContactCard(isPresented: $isContactOpen)
                            .padding(.top, max(92, geometry.safeAreaInsets.top + 66))
                            .padding(.trailing, 96)
                            .frame(maxWidth: .infinity, alignment: .trailing)
                            .transition(.opacity)
                            .zIndex(11)
                    }

                    if isAccountOpen {
                        LoginPanel(isPresented: $isAccountOpen)
                            .frame(width: min(geometry.size.width * 0.85, 336))
                            .frame(maxHeight: min(geometry.size.height * 0.66, 560), alignment: .top)
                            .frame(maxWidth: .infinity, alignment: .trailing)
                            .padding(.top, max(56, geometry.safeAreaInsets.top + 30))
                            .transition(.move(edge: .trailing).combined(with: .opacity))
                            .zIndex(12)
                    }
                }
                .ignoresSafeArea()
            }
            .toolbar(.hidden, for: .navigationBar)
            .alert("Pagina in Sviluppo", isPresented: $showWishlistMessage) {
                Button("OK", role: .cancel) {}
            } message: {
                Text("La pagina della wishlist e attualmente in fase di sviluppo. Tornera presto disponibile!")
            }
            .alert("Errore", isPresented: Binding(
                get: { store.errorMessage != nil },
                set: { if !$0 { store.errorMessage = nil } }
            )) {
                Button("OK", role: .cancel) { store.errorMessage = nil }
            } message: {
                Text(store.errorMessage ?? "")
            }
        }
    }
}

struct HeroBackground: View {
    var body: some View {
        GeometryReader { geometry in
            BundleImage(name: "hero", extensionName: "png")
                .scaledToFill()
                .frame(width: geometry.size.width, height: geometry.size.height, alignment: .center)
                .clipped()
                .overlay(Color.black.opacity(0.10))
        }
        .ignoresSafeArea()
    }
}

struct BundleImage: View {
    let name: String
    let extensionName: String

    var body: some View {
        if let url = Bundle.main.url(forResource: name, withExtension: extensionName),
           let uiImage = UIImage(contentsOfFile: url.path) {
            Image(uiImage: uiImage)
                .resizable()
        } else {
            Color.black
        }
    }
}

private struct WebHeader: View {
    @Binding var isMenuOpen: Bool
    @Binding var isContactOpen: Bool
    @Binding var isAccountOpen: Bool
    @Binding var showWishlistMessage: Bool

    var body: some View {
        HStack(spacing: 16) {
            NavigationLink {
                ProductListView(category: nil, title: "CERCA")
            } label: {
                Image(systemName: "magnifyingglass")
                    .webHeaderIcon(size: 28)
            }

            Button {
                withAnimation(.easeInOut(duration: 0.18)) {
                    isMenuOpen.toggle()
                    isContactOpen = false
                    isAccountOpen = false
                }
            } label: {
                HStack(spacing: 12) {
                    Image(systemName: "line.3.horizontal")
                        .font(.system(size: 26, weight: .regular))
                    Text("MENU")
                        .font(.custom("GRGabriellaFinal", size: 26))
                        .lineLimit(1)
                        .fixedSize()
                }
                .foregroundStyle(.white)
            }

            Spacer(minLength: 0)

            Button {
                withAnimation(.easeInOut(duration: 0.18)) {
                    isContactOpen.toggle()
                    isMenuOpen = false
                    isAccountOpen = false
                }
            } label: {
                Image(systemName: "phone")
                    .webHeaderIcon(size: 27)
            }

            Button {
                isMenuOpen = false
                isContactOpen = false
                isAccountOpen = false
                showWishlistMessage = true
            } label: {
                Image(systemName: "heart")
                    .webHeaderIcon(size: 29)
            }

            NavigationLink {
                CheckoutView()
            } label: {
                Image(systemName: "cart")
                    .webHeaderIcon(size: 28)
            }

            Button {
                withAnimation(.easeInOut(duration: 0.18)) {
                    isAccountOpen.toggle()
                    isMenuOpen = false
                    isContactOpen = false
                }
            } label: {
                Image(systemName: "person")
                    .webHeaderIcon(size: 28)
            }
        }
    }
}

private struct BrandMark: View {
    var body: some View {
        VStack(spacing: 18) {
            Text("G-R")
                .font(.custom("GRGabriellaFinal", size: 60))
                .frame(maxWidth: .infinity)
            Text("GABRIELLA")
                .font(.custom("GRGabriellaFinal", size: 45))
                .frame(maxWidth: .infinity)
            Text("ROMEO")
                .font(.custom("GRGabriellaFinal", size: 45))
                .frame(maxWidth: .infinity)
        }
        .foregroundStyle(.white)
        .tracking(5)
        .multilineTextAlignment(.center)
        .minimumScaleFactor(0.72)
        .frame(maxWidth: .infinity)
        .padding(.horizontal, 24)
    }
}

private struct FooterSocialBlock: View {
    private let flags = ["🇮🇹", "🇬🇧", "🇫🇷", "🇩🇪", "🇪🇸", "🇸🇦", "🇨🇳", "🇯🇵"]

    var body: some View {
        VStack(spacing: 18) {
            HStack(spacing: 13) {
                ForEach(flags, id: \.self) { flag in
                    Text(flag)
                        .font(.system(size: 20))
                }
            }

            BundleImage(name: "qr-instagram", extensionName: "png")
                .scaledToFit()
                .frame(width: 104, height: 104)

            HStack(spacing: 10) {
                Image(systemName: "camera")
                    .font(.system(size: 25, weight: .regular))
                Text("Instagram")
                    .font(.custom("GRGabriellaFinal", size: 31))
            }
            .foregroundStyle(.white)
        }
    }
}

private struct NavigationDrawer: View {
    @Binding var isPresented: Bool

    private let items: [(String, String?)] = [
        ("Home", nil),
        ("Gioielli", "gioielli"),
        ("Abbigliamento", "abbigliamento"),
        ("Accessori", "accessori"),
        ("Offerte", "offerte"),
        ("Servizi", "servizi"),
        ("Eventi", "eventi"),
        ("Il Brand", "brand")
    ]

    var body: some View {
        VStack(spacing: 14) {
            HStack {
                Text("NAVIGAZIONE")
                    .font(.custom("GRGabriellaFinal", size: 28))
                    .foregroundStyle(.black)
                Spacer()
                Button {
                    withAnimation(.easeInOut(duration: 0.18)) { isPresented = false }
                } label: {
                    Image(systemName: "xmark")
                        .font(.system(size: 28, weight: .regular))
                        .foregroundStyle(.black)
                }
            }

            VStack(spacing: 16) {
                ForEach(items, id: \.0) { item in
                    if let category = item.1 {
                        NavigationLink {
                            ProductListView(category: category, title: title(for: category))
                        } label: {
                            Text(item.0)
                                .drawerItem()
                        }
                    } else {
                        Button {
                            withAnimation(.easeInOut(duration: 0.18)) { isPresented = false }
                        } label: {
                            Text(item.0)
                                .drawerItem()
                        }
                    }
                }
            }
        }
        .padding(.horizontal, 28)
        .padding(.top, 24)
        .padding(.bottom, 28)
        .frame(width: 292)
        .background(Color.white)
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func title(for category: String) -> String {
        switch category {
        case "gioielli":
            return "GALLERIA GIOIELLI"
        case "abbigliamento":
            return "GALLERIA ABBIGLIAMENTO"
        case "accessori":
            return "GALLERIA ACCESSORI"
        case "offerte":
            return "OFFERTE"
        case "servizi":
            return "SERVIZI"
        case "eventi":
            return "EVENTI"
        case "brand":
            return "IL BRAND"
        default:
            return category.uppercased()
        }
    }
}

private struct ContactCard: View {
    @Binding var isPresented: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 15) {
            HStack {
                Text("CONTATTI")
                    .font(.custom("GRGabriellaFinal", size: 27))
                Spacer()
                Button {
                    withAnimation(.easeInOut(duration: 0.18)) { isPresented = false }
                } label: {
                    Image(systemName: "xmark")
                        .font(.system(size: 24, weight: .regular))
                }
            }

            ContactLink(label: "✉️ info@g-\nrgabriellaromeo.it", url: "mailto:info@g-rgabriellaromeo.it")
            ContactLink(label: "💬 WhatsApp", url: "https://wa.me/393429506938")
            ContactLink(label: "📸 Instagram", url: "https://www.instagram.com/grgabriellaromeo/")
            ContactLink(label: "📘 Facebook", url: "https://www.facebook.com/GRGabriellaRomeoItalianStyle")
        }
        .font(.custom("GRGabriellaFinal", size: 24))
        .foregroundStyle(.white)
        .padding(.horizontal, 24)
        .padding(.vertical, 23)
        .frame(width: 222, alignment: .leading)
        .background(Color(red: 0.07, green: 0.09, blue: 0.14))
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color(red: 0.26, green: 0.31, blue: 0.43), lineWidth: 1))
    }
}

private struct ContactLink: View {
    let label: String
    let url: String

    var body: some View {
        Button {
            if let url = URL(string: url) {
                UIApplication.shared.open(url)
            }
        } label: {
            Text(label)
                .multilineTextAlignment(.leading)
                .frame(maxWidth: .infinity, alignment: .leading)
        }
        .buttonStyle(.plain)
    }
}

private extension Image {
    func webHeaderIcon(size: CGFloat) -> some View {
        self
            .font(.system(size: size, weight: .regular))
            .foregroundStyle(.white)
    }
}

private extension Text {
    func drawerItem() -> some View {
        self
            .font(.custom("GRGabriellaFinal", size: 28))
            .foregroundStyle(.black)
            .frame(maxWidth: .infinity)
    }
}

extension View {
    func webButton() -> some View {
        self
            .font(.custom("GRGabriellaFinal", size: 22))
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .frame(height: 52)
            .overlay(Rectangle().stroke(Color.white.opacity(0.72), lineWidth: 1))
    }

    func webSectionTitle() -> some View {
        self
            .font(.custom("GRGabriellaFinal", size: 20))
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct WebBackButton: View {
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        Button {
            dismiss()
        } label: {
            Image(systemName: "chevron.left")
                .font(.system(size: 28, weight: .regular))
                .foregroundStyle(.white)
                .frame(width: 48, height: 48)
                .background(Color.black.opacity(0.28))
                .clipShape(Circle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel("Indietro")
    }
}
