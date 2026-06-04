import SwiftUI
import UIKit

struct ProductListView: View {
    @EnvironmentObject private var store: AppStore
    let category: String?
    let title: String
    var onlyOffers = false
    @State private var selectedSubcategory: String?
    @State private var isSubcategoryMenuOpen = false

    private var subcategories: [String] {
        let values = store.products
            .filter { product in
                guard let category else { return true }
                return product.categoria?.localizedCaseInsensitiveContains(category) == true
            }
            .compactMap(\.sottocategoria)
            .filter { !$0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }
        let unique = Array(Set(values)).sorted()

        if category == "gioielli", unique.isEmpty {
            return ["Anelli", "Collane", "Bracciali", "Orecchini"]
        }
        return unique
    }

    private var shouldShowSubcategoryMenu: Bool {
        guard let category else { return false }
        return category != "servizi" && !subcategories.isEmpty
    }

    private var filteredProducts: [Product] {
        store.products.filter { product in
            let categoryMatch = category == nil || product.categoria?.localizedCaseInsensitiveContains(category!) == true
            let offerMatch = !onlyOffers || product.offerta == true
            let subcategoryMatch = selectedSubcategory == nil || product.sottocategoria == selectedSubcategory
            return categoryMatch && offerMatch && subcategoryMatch
        }
    }

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            ScrollView {
                VStack(spacing: 22) {
                    Text(title)
                        .font(.custom("Michroma-Regular", size: 30))
                        .tracking(1.4)
                        .foregroundStyle(Color.grGold)
                        .multilineTextAlignment(.center)
                        .lineLimit(2)
                        .minimumScaleFactor(0.7)
                        .padding(.top, 88)

                    if shouldShowSubcategoryMenu {
                        subcategoryMenu
                    }

                    if store.isLoading {
                        ProgressView()
                            .tint(.white)
                            .padding(.top, 30)
                    } else if filteredProducts.isEmpty {
                        Text(store.l10n.text(.noProducts))
                            .font(.custom("Michroma-Regular", size: 20))
                            .foregroundStyle(Color.grGold.opacity(0.72))
                            .padding(.top, 30)
                    } else {
                        LazyVStack(spacing: 26) {
                            ForEach(filteredProducts) { product in
                                ZStack(alignment: .topTrailing) {
                                    NavigationLink {
                                        ProductDetailView(product: product)
                                    } label: {
                                        ProductCard(product: product)
                                    }
                                    .buttonStyle(.plain)

                                    WishlistToggle(product: product)
                                        .padding(.top, 10)
                                        .padding(.trailing, 10)
                                }
                                .frame(maxWidth: 326)
                            }
                        }
                        .padding(.top, 6)
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
        .task(id: category) {
            await store.refreshProducts()
        }
    }

    private var subcategoryMenu: some View {
        VStack(spacing: 0) {
            Button {
                withAnimation(.easeInOut(duration: 0.16)) {
                    isSubcategoryMenuOpen.toggle()
                }
            } label: {
                HStack(spacing: 10) {
                    Text(selectedSubcategory ?? store.l10n.text(.allSubcategories))
                        .font(.custom("Michroma-Regular", size: 16))
                        .foregroundStyle(.black)
                        .lineLimit(1)
                        .minimumScaleFactor(0.72)
                    Spacer()
                    Image(systemName: "chevron.down")
                        .font(.system(size: 17, weight: .regular))
                        .foregroundStyle(Color.grGold)
                        .rotationEffect(.degrees(isSubcategoryMenuOpen ? 180 : 0))
                }
                .padding(.horizontal, 14)
                .frame(height: 46)
                .background(Color.white)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color.grGold, lineWidth: 1.4)
                )
            }
            .buttonStyle(.plain)

            if isSubcategoryMenuOpen {
                VStack(alignment: .leading, spacing: 0) {
                    dropdownOption(nil)
                    ForEach(subcategories, id: \.self) { value in
                        dropdownOption(value)
                    }
                }
                .background(Color.white)
                .clipShape(RoundedRectangle(cornerRadius: 8))
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color.grGold.opacity(0.62), lineWidth: 1)
                )
                .padding(.top, 6)
            }
        }
        .padding(.horizontal, 12)
        .zIndex(20)
    }

    private func dropdownOption(_ value: String?) -> some View {
        Button {
            selectedSubcategory = value
            withAnimation(.easeInOut(duration: 0.16)) {
                isSubcategoryMenuOpen = false
            }
        } label: {
            HStack(spacing: 10) {
                Text(value ?? store.l10n.text(.allSubcategories))
                    .font(.custom("Michroma-Regular", size: 14))
                    .foregroundStyle(.black)
                    .lineLimit(1)
                    .minimumScaleFactor(0.72)
                Spacer()
                if selectedSubcategory == value {
                    Image(systemName: "checkmark")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(Color.grGold)
                }
            }
            .padding(.horizontal, 14)
            .frame(height: 38)
            .background(Color.white)
        }
        .buttonStyle(.plain)
    }
}

struct ProductCard: View {
    @EnvironmentObject private var store: AppStore
    let product: Product

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            ProductImage(product: product)
                .frame(height: 222)
                .clipShape(Rectangle())

            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(product.nome)
                        .font(.custom("Michroma-Regular", size: 17))
                        .foregroundStyle(Color.grGold)
                        .lineLimit(2)
                        .minimumScaleFactor(0.76)
                    if let sottocategoria = product.sottocategoria, !sottocategoria.isEmpty {
                        Text(sottocategoria)
                            .font(.custom("Michroma-Regular", size: 12))
                            .foregroundStyle(Color.grGold.opacity(0.62))
                            .lineLimit(1)
                    }
                    if let description = product.descrizione, !description.isEmpty {
                        Text(description)
                            .font(.custom("Michroma-Regular", size: 11))
                            .foregroundStyle(Color.grGold.opacity(0.58))
                            .lineLimit(2)
                    }
                }
                Spacer()
                Text(product.hasDisplayPrice ? product.displayPrice.euro : store.l10n.text(.priceOnRequest))
                    .font(.system(size: 16, weight: .regular))
                    .foregroundStyle(Color.grGold)
                    .lineLimit(1)
                    .minimumScaleFactor(0.58)
            }
        }
        .frame(maxWidth: 326)
    }
}

struct ProductDetailView: View {
    @EnvironmentObject private var store: AppStore
    @Environment(\.dismiss) private var dismiss
    let product: Product
    @State private var showAddedAlert = false
    @State private var showProductionPolicy = false
    @State private var navigateToCheckout = false

    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .topLeading) {
                Color.black.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 14) {
                        ProductImage(product: product, contentMode: .fit)
                            .frame(maxWidth: .infinity)
                            .frame(height: detailImageHeight(for: geometry))
                            .background(Color.white)
                            .clipped()

                        VStack(alignment: .leading, spacing: 12) {
                            Text(product.nome)
                                .font(.custom("Michroma-Regular", size: 22))
                                .foregroundStyle(Color.grGold)
                                .lineLimit(3)
                                .minimumScaleFactor(0.62)
                                .fixedSize(horizontal: false, vertical: true)

                            Text(product.hasDisplayPrice ? product.displayPrice.euro : store.l10n.text(.priceOnRequest))
                                .font(.system(size: 19, weight: .regular))
                                .foregroundStyle(Color.grGold)
                                .lineLimit(1)
                                .minimumScaleFactor(0.72)

                            if let description = product.descrizione, !description.isEmpty {
                                Text(description)
                                    .font(.custom("Michroma-Regular", size: 13.5))
                                    .foregroundStyle(Color.grGold.opacity(0.78))
                                    .lineSpacing(4)
                                    .fixedSize(horizontal: false, vertical: true)
                            }
                        }
                        .padding(.horizontal, 18)
                    }
                    .padding(.bottom, 96)
                }

                Button {
                    dismiss()
                } label: {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 22, weight: .semibold))
                        .foregroundStyle(.black)
                        .frame(width: 46, height: 40)
                        .background(Color.white)
                        .clipShape(RoundedRectangle(cornerRadius: 7))
                        .shadow(color: .black.opacity(0.18), radius: 6, x: 0, y: 2)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Indietro")
                .padding(.top, max(14, geometry.safeAreaInsets.top + 6))
                .padding(.leading, 14)

                WishlistToggle(product: product)
                    .padding(.top, max(14, geometry.safeAreaInsets.top + 6))
                    .padding(.trailing, 14)
                    .frame(maxWidth: .infinity, alignment: .topTrailing)
            }
            .safeAreaInset(edge: .bottom) {
                detailActionButton
                    .padding(.horizontal, 14)
                    .padding(.top, 10)
                    .padding(.bottom, max(10, geometry.safeAreaInsets.bottom + 4))
                    .background(Color.black.opacity(0.96))
            }
        }
        .navigationDestination(isPresented: $navigateToCheckout) {
            CheckoutView()
        }
        .alert(store.l10n.text(.addedToCart), isPresented: $showAddedAlert) {
            Button(store.l10n.text(.continueShopping), role: .cancel) {
                dismiss()
            }
            Button(store.l10n.text(.checkout)) {
                navigateToCheckout = true
            }
        } message: {
            Text(product.nome)
        }
        .alert(store.l10n.text(.productionPolicyTitle), isPresented: $showProductionPolicy) {
            Button(store.l10n.text(.cancel), role: .cancel) {}
            Button(store.l10n.text(.productionPolicyAccept)) {
                addProductToCart()
            }
        } message: {
            Text("\(product.nome)\n\n\(store.l10n.text(.productionPolicyBody))")
        }
        .toolbar(.hidden, for: .navigationBar)
    }

    @ViewBuilder
    private var detailActionButton: some View {
        if product.hasDisplayPrice {
            Button {
                if product.requiresProduction(for: 1) {
                    showProductionPolicy = true
                } else {
                    addProductToCart()
                }
            } label: {
                Text(product.isAvailable ? store.l10n.text(.addToCart) : store.l10n.text(.soldOut))
                    .font(.custom("Michroma-Regular", size: 21))
                    .foregroundStyle(.black)
                    .lineLimit(1)
                    .minimumScaleFactor(0.72)
                    .frame(maxWidth: .infinity)
                    .frame(height: 54)
                    .background(Color.grGold)
            }
            .disabled(!product.isAvailable)
            .opacity(product.isAvailable ? 1 : 0.45)
        } else {
            Button {
                if let url = priceRequestURL {
                    UIApplication.shared.open(url)
                }
            } label: {
                Text(store.l10n.text(.requestPrice))
                    .font(.custom("Michroma-Regular", size: 19))
                    .foregroundStyle(.white)
                    .lineLimit(1)
                    .minimumScaleFactor(0.72)
                    .frame(maxWidth: .infinity)
                    .frame(height: 54)
                    .background(Color(red: 0.17, green: 0.38, blue: 0.96))
            }
        }
    }

    private func addProductToCart() {
        store.addToCart(product)
        showAddedAlert = true
    }

    private func detailImageHeight(for geometry: GeometryProxy) -> CGFloat {
        min(max(geometry.size.height * 0.34, 220), 286)
    }

    private var priceRequestURL: URL? {
        var components = URLComponents()
        components.scheme = "mailto"
        components.path = "info@g-rgabriellaromeo.it"
        let productName = product.englishName
        components.queryItems = [
            URLQueryItem(name: "subject", value: "Price request - \(productName)"),
            URLQueryItem(name: "body", value: "Hello,\n\nI would like to receive price and ordering information for: \(productName)\n\nThank you.")
        ]
        return components.url
    }
}

private struct WishlistToggle: View {
    @EnvironmentObject private var store: AppStore
    let product: Product

    var body: some View {
        Button {
            store.toggleWishlist(product)
        } label: {
            Image(systemName: store.isInWishlist(product) ? "heart.fill" : "heart")
                .font(.system(size: 18, weight: .semibold))
                .foregroundStyle(Color.grGold)
                .frame(width: 42, height: 42)
                .background(Color.black.opacity(0.78))
                .clipShape(Circle())
                .overlay(Circle().stroke(Color.grGold.opacity(0.8), lineWidth: 1))
        }
        .buttonStyle(.plain)
        .accessibilityLabel(store.l10n.text(.wishlist))
    }
}

struct ProductImage: View {
    let product: Product
    var contentMode: ContentMode = .fill

    var body: some View {
        AsyncImage(url: AppConfig.imageURL(for: product.immagine)) { phase in
            switch phase {
            case .empty:
                ZStack {
                    Color.grGold.opacity(0.08)
                    ProgressView().tint(.white)
                }
            case .success(let image):
                if contentMode == .fit {
                    image
                        .resizable()
                        .scaledToFit()
                } else {
                    image
                        .resizable()
                        .scaledToFill()
                }
            case .failure:
                ZStack {
                    Color.grGold.opacity(0.08)
                    Text("G-R")
                        .font(.custom("Michroma-Regular", size: 46))
                        .foregroundStyle(Color.grGold.opacity(0.75))
                }
            @unknown default:
                Color.grGold.opacity(0.08)
            }
        }
    }
}
