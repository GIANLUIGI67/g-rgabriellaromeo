import SwiftUI
import UIKit

struct RootView: View {
    @EnvironmentObject private var store: AppStore
    @State private var isMenuOpen = false
    @State private var isContactOpen = false
    @State private var isAccountOpen = false

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
                            isAccountOpen: $isAccountOpen
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
                            .padding(.top, max(92, geometry.safeAreaInsets.top + 66))
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
                            .frame(width: min(geometry.size.width * 0.78, 322))
                            .frame(height: min(geometry.size.height * 0.52, 430), alignment: .top)
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
    @EnvironmentObject private var store: AppStore
    let availableWidth: CGFloat
    @Binding var isMenuOpen: Bool
    @Binding var isContactOpen: Bool
    @Binding var isAccountOpen: Bool

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
                    Text(store.l10n.text(.menu))
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

            NavigationLink {
                WishlistView()
            } label: {
                ZStack(alignment: .topTrailing) {
                    Image(systemName: store.wishlistCount > 0 ? "heart.fill" : "heart")
                        .webHeaderIcon(size: heartIconSize)
                    if store.wishlistCount > 0 {
                        Text("\(store.wishlistCount)")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundStyle(.black)
                            .frame(minWidth: 16, minHeight: 16)
                            .background(Color.grGold)
                            .clipShape(Circle())
                            .offset(x: 8, y: -8)
                    }
                }
            }
            .simultaneousGesture(TapGesture().onEnded {
                isMenuOpen = false
                isContactOpen = false
                isAccountOpen = false
            })

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

    private let items: [(L10n.Key, String?)] = [
        (.home, nil),
        (.gioielli, "gioielli"),
        (.abbigliamento, "abbigliamento"),
        (.accessori, "accessori"),
        (.offerte, "offerte"),
        (.wishlist, "wishlist"),
        (.servizi, "servizi"),
        (.eventi, "eventi"),
        (.brand, "brand")
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 7) {
            HStack(spacing: 10) {
                Text(store.l10n.text(.navigation))
                    .font(.custom("Michroma-Regular", size: 13))
                    .foregroundStyle(.black)
                    .lineLimit(1)
                    .minimumScaleFactor(0.62)
                    .allowsTightening(true)
                    .layoutPriority(1)
                Spacer()
                Button {
                    withAnimation(.easeInOut(duration: 0.18)) { isPresented = false }
                } label: {
                    Image(systemName: "xmark")
                        .font(.system(size: 18, weight: .regular))
                        .foregroundStyle(.black)
                }
            }

            VStack(alignment: .leading, spacing: 4) {
                ForEach(items, id: \.0) { item in
                    if let category = item.1 {
                        NavigationLink {
                            if category == "eventi" {
                                EventsView()
                            } else if category == "servizi" {
                                ServicesView()
                            } else if category == "wishlist" {
                                WishlistView()
                            } else if category == "brand" {
                                BrandView()
                            } else {
                                ProductListView(category: category, title: galleryTitle(for: item.0))
                            }
                        } label: {
                            Text(store.l10n.text(item.0))
                                .drawerItem()
                        }
                    } else {
                        Button {
                            withAnimation(.easeInOut(duration: 0.18)) { isPresented = false }
                        } label: {
                            Text(store.l10n.text(item.0))
                                .drawerItem()
                        }
                    }
                }
            }
        }
        .padding(.horizontal, 14)
        .padding(.top, 12)
        .padding(.bottom, 13)
        .frame(width: 248, alignment: .leading)
        .background(Color.white)
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func galleryTitle(for key: L10n.Key) -> String {
        let label = store.l10n.text(key)
        if key == .offerte {
            return label.uppercased()
        }
        return "\(store.l10n.text(.gallery)) \(label)"
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

            WebBackButton()
                .padding(.top, 48)
                .padding(.leading, 14)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        }
        .task {
            await store.refreshEvents()
        }
        .toolbar(.hidden, for: .navigationBar)
    }
}

struct WishlistView: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            ScrollView {
                VStack(spacing: 22) {
                    Text(store.l10n.text(.wishlist))
                        .font(.custom("Michroma-Regular", size: 30))
                        .tracking(1.4)
                        .foregroundStyle(Color.grGold)
                        .padding(.top, 88)

                    Text("\(store.wishlistCount) \(store.l10n.text(.savedProducts))")
                        .font(.custom("Michroma-Regular", size: 13))
                        .foregroundStyle(Color.grGold.opacity(0.75))

                    if store.wishlist.isEmpty {
                        VStack(spacing: 18) {
                            Text(store.l10n.text(.wishlistEmpty))
                                .font(.custom("Michroma-Regular", size: 13))
                                .foregroundStyle(Color.grGold.opacity(0.78))
                                .multilineTextAlignment(.center)
                                .lineSpacing(5)

                            NavigationLink {
                                ProductListView(category: nil, title: store.l10n.text(.gallery).uppercased())
                            } label: {
                                Text(store.l10n.text(.browseProducts))
                                    .webButton()
                            }
                            .buttonStyle(.plain)
                        }
                        .padding(.top, 40)
                    } else {
                        LazyVStack(spacing: 28) {
                            ForEach(store.wishlist) { product in
                                VStack(spacing: 12) {
                                    NavigationLink {
                                        ProductDetailView(product: product)
                                    } label: {
                                        ProductCard(product: product)
                                    }
                                    .buttonStyle(.plain)

                                    HStack(spacing: 10) {
                                        Button {
                                            store.removeFromWishlist(product)
                                        } label: {
                                            Text(store.l10n.text(.remove))
                                                .wishlistActionStyle(borderColor: Color(red: 0.74, green: 0.12, blue: 0.12), foregroundColor: Color(red: 0.9, green: 0.25, blue: 0.25))
                                        }
                                        .buttonStyle(.plain)

                                        if product.hasDisplayPrice {
                                            Button {
                                                store.addToCart(product)
                                            } label: {
                                                Text(store.l10n.text(.addToCart))
                                                    .wishlistActionStyle(borderColor: Color.grGold, foregroundColor: Color.grGold)
                                            }
                                            .buttonStyle(.plain)
                                            .disabled(!product.isAvailable)
                                            .opacity(product.isAvailable ? 1 : 0.45)
                                        } else if let url = priceRequestURL(for: product) {
                                            Link(store.l10n.text(.requestPrice), destination: url)
                                                .wishlistActionStyle(borderColor: Color.grGold, foregroundColor: Color.grGold)
                                        }
                                    }
                                }
                            }

                            NavigationLink {
                                CheckoutView()
                            } label: {
                                Text(store.l10n.text(.checkout))
                                    .webButton()
                            }
                            .buttonStyle(.plain)
                            .padding(.top, 8)
                        }
                    }
                }
                .padding(.horizontal, 30)
                .padding(.bottom, 42)
            }

            WebBackButton()
                .padding(.top, 48)
                .padding(.leading, 14)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        }
        .toolbar(.hidden, for: .navigationBar)
    }

    private func priceRequestURL(for product: Product) -> URL? {
        var components = URLComponents()
        components.scheme = "mailto"
        components.path = "info@g-rgabriellaromeo.it"
        components.queryItems = [
            URLQueryItem(name: "subject", value: "Price request - \(product.englishName)"),
            URLQueryItem(name: "body", value: "Hello,\n\nI would like to receive price and ordering information for: \(product.englishName)\n\nThank you.")
        ]
        return components.url
    }
}

struct ServicesView: View {
    @EnvironmentObject private var store: AppStore
    @State private var name = ""
    @State private var email = ""
    @State private var phone = ""
    @State private var preferredDate = ""
    @State private var notes = ""
    @State private var selectedService = ""
    @State private var selectedOccasion = ""
    @State private var selectedBudget = ""
    @State private var selectedContact = ""
    @State private var isSending = false
    @State private var statusMessage: String?
    @State private var statusIsError = false

    private let serviceOptions = ["Consulenza gioielli", "Look completo", "Appuntamento atelier"]
    private let occasionOptions = ["Cerimonia", "Viaggio", "Sera", "Regalo", "Su misura"]
    private let budgetOptions = ["Fino a 250 EUR", "250-750 EUR", "750-1500 EUR", "Oltre 1500 EUR"]
    private let contactOptions = ["Email", "WhatsApp", "Telefono"]

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            ScrollView {
                VStack(spacing: 18) {
                    Text(store.l10n.text(.servicesTitle))
                        .font(.custom("Michroma-Regular", size: 30))
                        .foregroundStyle(Color.grGold)
                        .multilineTextAlignment(.center)
                        .padding(.top, 88)

                    Text(store.l10n.text(.ourServices))
                        .font(.custom("Michroma-Regular", size: 16))
                        .foregroundStyle(Color.grGold.opacity(0.86))

                    VStack(alignment: .leading, spacing: 14) {
                        serviceGroup(label: store.l10n.text(.service), value: selectedService, options: serviceOptions) {
                            selectedService = $0
                        }
                        serviceGroup(label: store.l10n.text(.occasion), value: selectedOccasion, options: occasionOptions) {
                            selectedOccasion = $0
                        }
                        serviceGroup(label: store.l10n.text(.budget), value: selectedBudget, options: budgetOptions) {
                            selectedBudget = $0
                        }
                        serviceGroup(label: store.l10n.text(.contactMethod), value: selectedContact, options: contactOptions) {
                            selectedContact = $0
                        }

                        Group {
                            serviceField(store.l10n.text(.name), text: $name)
                            serviceField(store.l10n.text(.email), text: $email, keyboard: .emailAddress)
                            serviceField(store.l10n.text(.phone), text: $phone, keyboard: .phonePad)
                            serviceField(store.l10n.text(.preferredDate), text: $preferredDate)
                            serviceField(store.l10n.text(.notes), text: $notes, height: 88)
                        }

                        if let statusMessage {
                            Text(statusMessage)
                                .font(.custom("Michroma-Regular", size: 12))
                                .foregroundStyle(statusIsError ? Color(red: 0.95, green: 0.28, blue: 0.28) : Color(red: 0.35, green: 0.85, blue: 0.42))
                                .fixedSize(horizontal: false, vertical: true)
                        }

                        Button {
                            Task { await submitRequest() }
                        } label: {
                            ZStack {
                                if isSending {
                                    ProgressView().tint(.black)
                                } else {
                                    Text(store.l10n.text(.sendRequest))
                                }
                            }
                            .font(.custom("Michroma-Regular", size: 16))
                            .foregroundStyle(.black)
                            .frame(maxWidth: .infinity)
                            .frame(height: 48)
                            .background(Color.grGold)
                        }
                        .buttonStyle(.plain)
                        .disabled(isSending)

                        HStack(spacing: 10) {
                            if let emailURL {
                                Link(store.l10n.text(.emailBackup), destination: emailURL)
                                    .wishlistActionStyle(borderColor: Color.grGold, foregroundColor: Color.grGold)
                            }

                            NavigationLink {
                                ProductListView(category: nil, title: store.l10n.text(.gallery).uppercased())
                            } label: {
                                Text(store.l10n.text(.browseProducts))
                                    .wishlistActionStyle(borderColor: Color.grGold, foregroundColor: Color.grGold)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(16)
                    .background(Color(red: 0.04, green: 0.04, blue: 0.04))
                    .overlay(Rectangle().stroke(Color.grGold.opacity(0.32), lineWidth: 1))
                }
                .padding(.horizontal, 22)
                .padding(.bottom, 38)
            }

            WebBackButton()
                .padding(.top, 48)
                .padding(.leading, 14)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        }
        .toolbar(.hidden, for: .navigationBar)
    }

    private func serviceGroup(label: String, value: String, options: [String], onSelect: @escaping (String) -> Void) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(label)
                .font(.custom("Michroma-Regular", size: 12))
                .foregroundStyle(Color.grGold.opacity(0.85))

            FlowLayout(spacing: 8) {
                ForEach(options, id: \.self) { option in
                    Button {
                        onSelect(option)
                    } label: {
                        Text(option)
                            .font(.custom("Michroma-Regular", size: 11))
                            .foregroundStyle(value == option ? .black : Color.grGold)
                            .padding(.horizontal, 10)
                            .frame(height: 34)
                            .background(value == option ? Color.grGold : Color.clear)
                            .overlay(Rectangle().stroke(Color.grGold.opacity(0.62), lineWidth: 1))
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private func serviceField(_ placeholder: String, text: Binding<String>, keyboard: UIKeyboardType = .default, height: CGFloat = 42) -> some View {
        TextField(placeholder, text: text, axis: height > 50 ? .vertical : .horizontal)
            .keyboardType(keyboard)
            .textInputAutocapitalization(keyboard == .emailAddress ? .never : .sentences)
            .autocorrectionDisabled(keyboard == .emailAddress)
            .font(.custom("Michroma-Regular", size: 12))
            .foregroundStyle(.black)
            .padding(.horizontal, 10)
            .frame(minHeight: height, alignment: .topLeading)
            .background(Color.white)
    }

    private var emailURL: URL? {
        var components = URLComponents()
        components.scheme = "mailto"
        components.path = "info@g-rgabriellaromeo.it"
        components.queryItems = [
            URLQueryItem(name: "subject", value: "G-R style request - \(selectedService.isEmpty ? "Service" : selectedService)"),
            URLQueryItem(name: "body", value: "Nome: \(name)\nEmail: \(email)\nTelefono: \(phone)\nServizio: \(selectedService)\nOccasione: \(selectedOccasion)\nBudget: \(selectedBudget)\nData preferita: \(preferredDate)\nContatto preferito: \(selectedContact)\nNote: \(notes)")
        ]
        return components.url
    }

    private func submitRequest() async {
        let cleanName = name.trimmingCharacters(in: .whitespacesAndNewlines)
        let cleanEmail = email.trimmingCharacters(in: .whitespacesAndNewlines)

        guard !cleanName.isEmpty, !cleanEmail.isEmpty, !selectedService.isEmpty, !selectedOccasion.isEmpty, !selectedContact.isEmpty else {
            statusMessage = store.l10n.text(.serviceRequired)
            statusIsError = true
            return
        }

        isSending = true
        statusMessage = nil
        defer { isSending = false }

        do {
            try await store.submitServiceRequest(ServiceRequestPayload(
                name: cleanName,
                email: cleanEmail,
                phone: phone.trimmingCharacters(in: .whitespacesAndNewlines),
                service: selectedService,
                occasion: selectedOccasion,
                budget: selectedBudget,
                preferredDate: preferredDate.trimmingCharacters(in: .whitespacesAndNewlines),
                contactMethod: selectedContact,
                notes: notes.trimmingCharacters(in: .whitespacesAndNewlines),
                lang: store.language.rawValue
            ))
            statusMessage = store.l10n.text(.requestSent)
            statusIsError = false
        } catch {
            statusMessage = error.localizedDescription
            statusIsError = true
        }
    }
}

struct BrandView: View {
    @EnvironmentObject private var store: AppStore
    @Environment(\.dismiss) private var dismiss

    private var brandText: String {
        Self.texts[store.language] ?? Self.texts[.it] ?? ""
    }

    var body: some View {
        GeometryReader { geometry in
            ZStack {
                Image("BrandCarretti")
                    .resizable()
                    .scaledToFill()
                    .frame(width: geometry.size.width, height: geometry.size.height)
                    .clipped()
                    .ignoresSafeArea()

                LinearGradient(
                    colors: [
                        Color.black.opacity(0.68),
                        Color.black.opacity(0.34)
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 12) {
                        Text(brandText)
                            .font(.custom("Michroma-Regular", size: 15))
                            .foregroundStyle(.white)
                            .multilineTextAlignment(.center)
                            .lineSpacing(8)
                            .shadow(color: .black.opacity(0.55), radius: 8, x: 0, y: 2)
                            .fixedSize(horizontal: false, vertical: true)

                        Image("BrandSignature")
                            .resizable()
                            .scaledToFit()
                            .frame(width: min(geometry.size.width * 0.62, 280))
                            .blendMode(.screen)
                            .shadow(color: .black.opacity(0.5), radius: 4, x: 0, y: 2)
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, max(88, geometry.safeAreaInsets.top + 72))
                    .padding(.bottom, max(34, geometry.safeAreaInsets.bottom + 24))
                    .frame(minHeight: geometry.size.height, alignment: .center)
                }

                Button {
                    dismiss()
                } label: {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundStyle(.black)
                        .frame(width: 42, height: 34)
                        .background(Color.white)
                        .clipShape(RoundedRectangle(cornerRadius: 6))
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Indietro")
                .padding(.top, max(16, geometry.safeAreaInsets.top + 8))
                .padding(.leading, 16)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            }
        }
        .toolbar(.hidden, for: .navigationBar)
    }

    private static let texts: [AppLanguage: String] = [
        .it: """
        Gabriella Romeo nasce a Catania, culla di miti e luce mediterranea, dove il sole bacia il mare e la storia si intreccia con la magia. Ogni creazione è un pezzo unico, realizzato a mano con amore e dedizione, un’incantevole fusione di arte e cuore.

        Il brand celebra una femminilità rara, autentica e potente, capace di illuminare chi la indossa con eleganza senza tempo. GR Gabriella Romeo è molto più di moda: è un viaggio poetico tra tradizione e innovazione, un sogno tangibile che cattura l’essenza vibrante e magica della Sicilia.

        Questo è il mio stile.
        """,
        .en: """
        Gabriella Romeo was born in Catania, cradle of myths and Mediterranean light, where the sun kisses the sea and history intertwines with magic. Each creation is a unique piece, handmade with love and dedication — a magical fusion of art and heart.

        The brand celebrates a rare, authentic and powerful femininity, capable of illuminating the wearer with timeless elegance. GR Gabriella Romeo is more than fashion: it is a poetic journey between tradition and innovation, a tangible dream that captures the vibrant and magical essence of Sicily.

        This is my style.
        """,
        .fr: """
        Gabriella Romeo est née à Catane, berceau des mythes et de la lumière méditerranéenne, où le soleil embrasse la mer et où l’histoire se mêle à la magie. Chaque création est une pièce unique, réalisée à la main avec amour et dévouement, une fusion enchanteresse d’art et de cœur.

        La marque célèbre une féminité rare, authentique et puissante, capable d’illuminer celle qui la porte avec une élégance intemporelle. GR Gabriella Romeo, c’est bien plus que de la mode : c’est un voyage poétique entre tradition et innovation, un rêve tangible qui capture l’essence vibrante et magique de la Sicile.

        C’est mon style.
        """,
        .de: """
        Gabriella Romeo wurde in Catania geboren, Wiege von Mythen und mediterranem Licht, wo die Sonne das Meer küsst und sich Geschichte mit Magie vermischt. Jede Kreation ist ein Unikat, von Hand gefertigt mit Liebe und Hingabe — eine zauberhafte Verschmelzung von Kunst und Herz.

        Die Marke feiert eine seltene, authentische und kraftvolle Weiblichkeit, die ihre Trägerin mit zeitloser Eleganz erstrahlen lässt. GR Gabriella Romeo ist mehr als Mode: eine poetische Reise zwischen Tradition und Innovation, ein greifbarer Traum, der die lebendige, magische Essenz Siziliens einfängt.

        Das ist mein Stil.
        """,
        .es: """
        Gabriella Romeo nació en Catania, cuna de mitos y luz mediterránea, donde el sol besa el mar y la historia se entrelaza con la magia. Cada creación es una pieza única, hecha a mano con amor y dedicación, una fusión encantadora de arte y corazón.

        La marca celebra una feminidad rara, auténtica y poderosa, capaz de iluminar a quien la lleva con una elegancia atemporal. GR Gabriella Romeo es mucho más que moda: es un viaje poético entre tradición e innovación, un sueño tangible que captura la esencia vibrante y mágica de Sicilia.

        Este es mi estilo.
        """,
        .ar: """
        وُلدت علامة Gabriella Romeo في كاتانيا، مهد الأساطير والنور المتوسطي، حيث تقبّل الشمس البحر وتتشابك فيهما الحكاية بالسحر. كلّ تصميم هو قطعة فريدة مصنوعة يدويًا بحب واهتمام، ومزيج ساحر بين الفن والقلب.

        تحتفي العلامة بأنوثة نادرة وأصيلة وقوية، تضيء من ترتديها بأناقة خالدة. GR Gabriella Romeo هي أكثر من مجرّد موضة؛ إنها رحلة شعرية بين التقاليد والابتكار، حلم ملموس يلتقط جوهر صقلية النابض والساحر.

        هذا هو أسلوبي.
        """,
        .zh: """
        Gabriella Romeo 诞生于卡塔尼亚，这是一个充满神话与地中海阳光的地方，阳光亲吻着大海，历史与魔法交织在一起。每件作品都是独一无二的手工制作，融合了爱与奉献，是艺术与心灵的迷人结合。

        这个品牌颂扬一种罕见、真实而强大的女性气质，使佩戴者散发出永恒的优雅。GR Gabriella Romeo 远不止于时尚：它是一场诗意的旅程，融合传统与创新，是一个捕捉西西里岛生动魔力的可触梦想。

        这就是我的风格。
        """,
        .ja: """
        Gabriella Romeo は、神話と地中海の光に満ちたカターニアで生まれました。太陽が海を照らし、歴史が魔法と交差する地です。すべての作品は、愛と献身を込めて手作業で作られたユニークな一点物であり、芸術と心の魅惑的な融合です。

        ブランドは、まれで本物、そして力強い女性らしさを称賛し、それをまとう人を時を超えた優雅さで輝かせます。GR Gabriella Romeo はファッションを超えた存在。伝統と革新の間を旅する詩的な物語であり、西シチリアの活気ある魔法の本質を捉えた、触れられる夢です。

        これが私のスタイルです。
        """
    ]
}

private struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let maxWidth = proposal.width ?? 320
        var rowWidth: CGFloat = 0
        var rowHeight: CGFloat = 0
        var totalHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if rowWidth > 0, rowWidth + spacing + size.width > maxWidth {
                totalHeight += rowHeight + spacing
                rowWidth = size.width
                rowHeight = size.height
            } else {
                rowWidth += rowWidth > 0 ? spacing + size.width : size.width
                rowHeight = max(rowHeight, size.height)
            }
        }

        totalHeight += rowHeight
        return CGSize(width: maxWidth, height: totalHeight)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var x = bounds.minX
        var y = bounds.minY
        var rowHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x > bounds.minX, x + spacing + size.width > bounds.maxX {
                x = bounds.minX
                y += rowHeight + spacing
                rowHeight = 0
            }

            subview.place(at: CGPoint(x: x, y: y), proposal: ProposedViewSize(size))
            x += size.width + spacing
            rowHeight = max(rowHeight, size.height)
        }
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
    @EnvironmentObject private var store: AppStore

    var body: some View {
        VStack(alignment: .leading, spacing: 15) {
            HStack {
                Text(store.l10n.text(.contacts))
                    .font(.custom("Michroma-Regular", size: 27))
                    .lineLimit(1)
                    .minimumScaleFactor(0.55)
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
            .font(.custom("Michroma-Regular", size: 14.5))
            .foregroundStyle(.black)
            .lineLimit(1)
            .minimumScaleFactor(0.68)
            .allowsTightening(true)
            .frame(maxWidth: .infinity, alignment: .leading)
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

    func wishlistActionStyle(borderColor: Color, foregroundColor: Color) -> some View {
        self
            .font(.custom("Michroma-Regular", size: 11.5))
            .foregroundStyle(foregroundColor)
            .lineLimit(1)
            .minimumScaleFactor(0.7)
            .frame(maxWidth: .infinity)
            .frame(height: 36)
            .overlay(Rectangle().stroke(borderColor.opacity(0.9), lineWidth: 1.1))
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
