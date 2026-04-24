import SwiftUI

struct RootView: View {
    @EnvironmentObject private var store: AppStore
    @State private var isMenuOpen = false
    @State private var isAccountOpen = false
    @State private var navigateToCart = false

    var body: some View {
        NavigationStack {
            ZStack(alignment: .top) {
                Color.black.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 0) {
                        hero
                        categoryButtons
                        ProductListView(category: nil, title: "Collezione")
                            .padding(.top, 18)
                    }
                }
                .ignoresSafeArea(edges: .top)

                header

                if isMenuOpen {
                    sideMenu
                }

                if isAccountOpen {
                    WebAccountPanel(isPresented: $isAccountOpen)
                        .padding(.top, 84)
                        .padding(.horizontal, 14)
                        .transition(.move(edge: .top).combined(with: .opacity))
                }

                NavigationLink(isActive: $navigateToCart) {
                    CheckoutView()
                } label: {
                    EmptyView()
                }
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

    private var hero: some View {
        ZStack(alignment: .bottom) {
            Image("BrandLogo")
                .resizable()
                .scaledToFit()
                .frame(maxWidth: 260)
                .padding(.top, 115)
                .padding(.bottom, 38)

            LinearGradient(colors: [.black.opacity(0.0), .black.opacity(0.85)], startPoint: .top, endPoint: .bottom)
                .frame(height: 90)
                .frame(maxHeight: .infinity, alignment: .bottom)
        }
        .frame(maxWidth: .infinity)
        .frame(height: 360)
        .background {
            Image("hero")
                .resizable()
                .scaledToFill()
                .opacity(0.92)
        }
        .clipped()
    }

    private var header: some View {
        HStack(spacing: 14) {
            Button {
                withAnimation(.easeInOut(duration: 0.2)) { isMenuOpen.toggle() }
            } label: {
                Image(systemName: "line.3.horizontal")
                    .font(.system(size: 22, weight: .medium))
                    .foregroundStyle(.white)
                    .frame(width: 44, height: 44)
            }

            Spacer()

            Menu {
                ForEach(AppLanguage.allCases) { language in
                    Button(language.flag) {
                        store.language = language
                    }
                }
            } label: {
                Text(store.language.flag)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(width: 42, height: 42)
                    .overlay(Circle().stroke(Color.white.opacity(0.28), lineWidth: 1))
            }

            Button {
                withAnimation(.easeInOut(duration: 0.2)) { isAccountOpen.toggle() }
            } label: {
                Image(systemName: "person")
                    .font(.system(size: 20, weight: .medium))
                    .foregroundStyle(.white)
                    .frame(width: 42, height: 42)
            }

            Button {
                isMenuOpen = false
                isAccountOpen = false
                navigateToCart = true
            } label: {
                ZStack(alignment: .topTrailing) {
                    Image(systemName: "cart")
                        .font(.system(size: 21, weight: .medium))
                        .foregroundStyle(.white)
                        .frame(width: 42, height: 42)
                    if store.cartCount > 0 {
                        Text("\(store.cartCount)")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundStyle(.black)
                            .frame(minWidth: 17, minHeight: 17)
                            .background(Color.white)
                            .clipShape(Circle())
                    }
                }
            }
        }
        .padding(.horizontal, 14)
        .padding(.top, 48)
    }

    private var categoryButtons: some View {
        VStack(spacing: 12) {
            NavigationLink {
                ProductListView(category: "gioielli", title: store.l10n.text(.gioielli))
            } label: {
                Text(store.l10n.text(.gioielli))
                    .webButton()
            }
            NavigationLink {
                ProductListView(category: "abbigliamento", title: store.l10n.text(.abbigliamento))
            } label: {
                Text(store.l10n.text(.abbigliamento))
                    .webButton()
            }
            NavigationLink {
                ProductListView(category: "accessori", title: store.l10n.text(.accessori))
            } label: {
                Text(store.l10n.text(.accessori))
                    .webButton()
            }
        }
        .padding(.horizontal, 28)
        .padding(.top, 20)
    }

    private var sideMenu: some View {
        HStack {
            VStack(alignment: .leading, spacing: 22) {
                Button("Home") { withAnimation { isMenuOpen = false } }
                NavigationLink(store.l10n.text(.gioielli)) { ProductListView(category: "gioielli", title: store.l10n.text(.gioielli)) }
                NavigationLink(store.l10n.text(.abbigliamento)) { ProductListView(category: "abbigliamento", title: store.l10n.text(.abbigliamento)) }
                NavigationLink(store.l10n.text(.accessori)) { ProductListView(category: "accessori", title: store.l10n.text(.accessori)) }
                NavigationLink(store.l10n.text(.offerte)) { ProductListView(category: nil, title: store.l10n.text(.offerte), onlyOffers: true) }
                Button("info@g-rgabriellaromeo.it") {
                    if let url = URL(string: "mailto:info@g-rgabriellaromeo.it") {
                        UIApplication.shared.open(url)
                    }
                }
                Spacer()
            }
            .font(.custom("GRGabriellaFinal", size: 22))
            .foregroundStyle(.white)
            .padding(.top, 110)
            .padding(.horizontal, 22)
            .frame(width: 280, alignment: .leading)
            .background(Color.black.opacity(0.96))

            Spacer()
        }
        .ignoresSafeArea()
        .transition(.move(edge: .leading))
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
