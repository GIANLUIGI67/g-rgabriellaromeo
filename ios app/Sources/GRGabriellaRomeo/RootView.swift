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
                let headerHorizontalPadding: CGFloat = geometry.size.width < 390 ? 10 : 18

                ZStack(alignment: .top) {
                    HeroBackground()

                    VStack(spacing: 0) {
                        WebHeader(
                            availableWidth: geometry.size.width - (headerHorizontalPadding * 2),
                            isMenuOpen: $isMenuOpen,
                            isContactOpen: $isContactOpen,
                            isAccountOpen: $isAccountOpen,
                            showWishlistMessage: $showWishlistMessage
                        )
                        .padding(.top, max(12, geometry.safeAreaInsets.top + 8))
                        .padding(.horizontal, headerHorizontalPadding)

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
                            .frame(width: min(geometry.size.width * 0.74, 306))
                            .frame(height: min(geometry.size.height * 0.43, 390), alignment: .top)
                            .clipped()
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
    let availableWidth: CGFloat
    @Binding var isMenuOpen: Bool
    @Binding var isContactOpen: Bool
    @Binding var isAccountOpen: Bool
    @Binding var showWishlistMessage: Bool

    var body: some View {
        HStack(spacing: headerSpacing) {
            NavigationLink {
                ProductListView(category: nil, title: "CERCA")
            } label: {
                Image(systemName: "magnifyingglass")
                    .webHeaderIcon(size: searchIconSize)
            }

            Button {
                withAnimation(.easeInOut(duration: 0.18)) {
                    isMenuOpen.toggle()
                    isContactOpen = false
                    isAccountOpen = false
                }
            } label: {
                HStack(spacing: menuItemSpacing) {
                    Image(systemName: "line.3.horizontal")
                        .font(.system(size: menuIconSize, weight: .regular))
                    Text("MENU")
                        .font(.custom("Michroma-Regular", size: menuTextSize))
                        .lineLimit(1)
                        .minimumScaleFactor(0.78)
                }
                .foregroundStyle(Color.grGold)
            }
            .layoutPriority(1)

            Spacer(minLength: 0)

            Button {
                withAnimation(.easeInOut(duration: 0.18)) {
                    isContactOpen.toggle()
                    isMenuOpen = false
                    isAccountOpen = false
                }
            } label: {
                Image(systemName: "phone")
                    .webHeaderIcon(size: iconSize)
            }

            Button {
                isMenuOpen = false
                isContactOpen = false
                isAccountOpen = false
                showWishlistMessage = true
            } label: {
                Image(systemName: "heart")
                    .webHeaderIcon(size: heartIconSize)
            }

            NavigationLink {
                CheckoutView()
            } label: {
                Image(systemName: "cart")
                    .webHeaderIcon(size: iconSize)
            }

            Button {
                withAnimation(.easeInOut(duration: 0.18)) {
                    isAccountOpen.toggle()
                    isMenuOpen = false
                    isContactOpen = false
                }
            } label: {
                Image(systemName: "person")
                    .webHeaderIcon(size: iconSize)
            }
        }
        .frame(maxWidth: .infinity)
    }

    private var isCompact: Bool { availableWidth < 410 }
    private var isNarrow: Bool { availableWidth < 350 }
    private var headerSpacing: CGFloat { isCompact ? 8 : 12 }
    private var menuItemSpacing: CGFloat { isCompact ? 6 : 10 }
    private var menuTextSize: CGFloat { isNarrow ? 17 : (isCompact ? 18 : 24) }
    private var menuIconSize: CGFloat { isCompact ? 21 : 25 }
    private var searchIconSize: CGFloat { isCompact ? 22 : 27 }
    private var iconSize: CGFloat { isCompact ? 23 : 27 }
    private var heartIconSize: CGFloat { isCompact ? 24 : 28 }
}

private struct BrandMark: View {
    var body: some View {
        VStack(spacing: 14) {
            Text("G-R")
                .font(.custom("Michroma-Regular", size: 60))
                .frame(maxWidth: .infinity)
            Text("GABRIELLA ROMEO")
                .font(.custom("Michroma-Regular", size: 30))
                .frame(maxWidth: .infinity)
        }
        .foregroundStyle(Color.grGold)
        .tracking(5)
        .multilineTextAlignment(.center)
        .minimumScaleFactor(0.62)
        .lineLimit(1)
        .frame(maxWidth: .infinity)
        .padding(.horizontal, 18)
    }
}

private struct FooterSocialBlock: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        VStack(spacing: 18) {
            BundleImage(name: "qr-instagram", extensionName: "png")
                .scaledToFit()
                .frame(width: 104, height: 104)

            VStack(spacing: 5) {
                HStack(spacing: 10) {
                    Image(systemName: "camera")
                        .font(.system(size: 18, weight: .regular))
                    Text("Instagram")
                        .font(.custom("Michroma-Regular", size: 18))
                }

                HStack(spacing: 7) {
                    Image(systemName: "c.circle")
                        .font(.system(size: 12, weight: .regular))
                    Text("grgabriellaromeo")
                        .font(.custom("Michroma-Regular", size: 12))
                }
            }
            .foregroundStyle(Color.grGold)

            HStack(spacing: 13) {
                ForEach(AppLanguage.allCases) { language in
                    Button {
                        store.language = language
                    } label: {
                        Text(language.flag)
                            .font(.system(size: 20))
                            .opacity(store.language == language ? 1 : 0.5)
                            .scaleEffect(store.language == language ? 1.08 : 1)
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("Lingua \(language.rawValue)")
                }
            }
        }
    }
}

private struct NavigationDrawer: View {
    @Binding var isPresented: Bool
    @EnvironmentObject private var store: AppStore

    private let items: [(L10n.Key?, String?, String)] = [
        (nil, nil, "Home"),
        (.gioielli, "gioielli", "Gioielli"),
        (.abbigliamento, "abbigliamento", "Abbigliamento"),
        (.accessori, "accessori", "Accessori"),
        (.offerte, "offerte", "Offerte"),
        (nil, "servizi", "Servizi"),
        (nil, "eventi", "Eventi"),
        (nil, "brand", "Il Brand")
    ]

    var body: some View {
        VStack(spacing: 14) {
            HStack {
                Text("NAVIGAZIONE")
                    .font(.custom("Michroma-Regular", size: 28))
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
                ForEach(items, id: \.2) { item in
                    if let category = item.1 {
                        NavigationLink {
                            if category == "eventi" {
                                EventsView()
                            } else {
                                ProductListView(category: category, title: title(for: category))
                            }
                        } label: {
                            Text(label(for: item))
                                .drawerItem()
                        }
                    } else {
                        Button {
                            withAnimation(.easeInOut(duration: 0.18)) { isPresented = false }
                        } label: {
                            Text(label(for: item))
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
        .background(Color.grGold)
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func label(for item: (L10n.Key?, String?, String)) -> String {
        if let key = item.0 {
            return store.l10n.text(key)
        }
        return item.2
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

struct EventsView: View {
    @EnvironmentObject private var store: AppStore

    private var inProgrammazione: [EventRecord] {
        store.events.filter { $0.isInProgrammazione }
    }

    private var conclusi: [EventRecord] {
        store.events.filter { $0.stato == "concluso" }
    }

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            ScrollView {
                VStack(alignment: .leading, spacing: 22) {
                    Text("EVENTI")
                        .font(.custom("Michroma-Regular", size: 26))
                        .foregroundStyle(Color.grGold)
                        .frame(maxWidth: .infinity, alignment: .center)
                        .padding(.top, 24)

                    if store.events.isEmpty {
                        Text("NESSUN EVENTO")
                            .font(.custom("Michroma-Regular", size: 14))
                            .foregroundStyle(Color.grGold.opacity(0.76))
                            .frame(maxWidth: .infinity, alignment: .center)
                            .padding(.top, 40)
                    } else {
                        EventsSection(title: "IN PROGRAMMAZIONE", events: inProgrammazione)
                        EventsSection(title: "CONCLUSI", events: conclusi)
                    }
                }
                .padding(.horizontal, 18)
                .padding(.bottom, 34)
            }
        }
        .task {
            await store.refreshEvents()
        }
        .toolbar(.hidden, for: .navigationBar)
    }
}

private struct EventsSection: View {
    let title: String
    let events: [EventRecord]

    var body: some View {
        if !events.isEmpty {
            VStack(alignment: .leading, spacing: 14) {
                Text(title)
                    .font(.custom("Michroma-Regular", size: 14))
                    .foregroundStyle(Color.grGold)

                ForEach(events) { event in
                    EventCard(event: event)
                }
            }
        }
    }
}

private struct EventCard: View {
    let event: EventRecord

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            if let url = event.primaryImageURL {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .scaledToFill()
                    default:
                        Color(red: 0.07, green: 0.07, blue: 0.07)
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 210)
                .clipped()
            }

            VStack(alignment: .leading, spacing: 8) {
                Text(event.titolo)
                    .font(.custom("Michroma-Regular", size: 17))
                    .foregroundStyle(Color.grGold)
                    .lineLimit(2)
                    .minimumScaleFactor(0.78)

                if let dateLabel = event.dateLabel {
                    Text(dateLabel)
                        .font(.custom("Michroma-Regular", size: 11))
                        .foregroundStyle(Color.grGold.opacity(0.68))
                }

                if let description = event.descrizione, !description.isEmpty {
                    Text(description)
                        .font(.custom("Michroma-Regular", size: 11))
                        .foregroundStyle(Color.grGold.opacity(0.82))
                        .lineSpacing(4)
                }

                if !event.pdfUrls.isEmpty || !event.videoUrls.isEmpty {
                    Text("PDF \(event.pdfUrls.count)  VIDEO \(event.videoUrls.count)")
                        .font(.custom("Michroma-Regular", size: 10))
                        .foregroundStyle(Color.grGold.opacity(0.74))
                        .padding(.top, 2)
                }
            }
            .padding(14)
        }
        .background(Color(red: 0.04, green: 0.04, blue: 0.04))
        .overlay(Rectangle().stroke(Color.grGold.opacity(0.18), lineWidth: 1))
    }
}

private struct ContactCard: View {
    @Binding var isPresented: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 15) {
            HStack {
                Text("CONTATTI")
                    .font(.custom("Michroma-Regular", size: 27))
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
        .font(.custom("Michroma-Regular", size: 24))
        .foregroundStyle(Color.grGold)
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
            .foregroundStyle(Color.grGold)
    }
}

private extension Text {
    func drawerItem() -> some View {
        self
            .font(.custom("Michroma-Regular", size: 28))
            .foregroundStyle(.black)
            .frame(maxWidth: .infinity)
    }
}

extension View {
    func webButton() -> some View {
        self
            .font(.custom("Michroma-Regular", size: 22))
            .foregroundStyle(Color.grGold)
            .frame(maxWidth: .infinity)
            .frame(height: 52)
            .overlay(Rectangle().stroke(Color.grGold.opacity(0.72), lineWidth: 1))
    }

    func webSectionTitle() -> some View {
        self
            .font(.custom("Michroma-Regular", size: 20))
            .foregroundStyle(Color.grGold)
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
                .foregroundStyle(Color.grGold)
                .frame(width: 48, height: 48)
                .background(Color.black.opacity(0.28))
                .clipShape(Circle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel("Indietro")
    }
}
