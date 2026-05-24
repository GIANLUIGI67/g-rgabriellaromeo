import SwiftUI

struct ProductListView: View {
    @EnvironmentObject private var store: AppStore
    let category: String?
    let title: String
    var onlyOffers = false
    @State private var selectedSubcategory = "Tutte le sottocategorie"
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
            let subcategoryMatch = selectedSubcategory == "Tutte le sottocategorie" || product.sottocategoria == selectedSubcategory
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
                        Text("Nessun prodotto disponibile")
                            .font(.custom("Michroma-Regular", size: 20))
                            .foregroundStyle(Color.grGold.opacity(0.72))
                            .padding(.top, 30)
                    } else {
                        LazyVStack(spacing: 26) {
                            ForEach(filteredProducts) { product in
                                NavigationLink {
                                    ProductDetailView(product: product)
                                } label: {
                                    ProductCard(product: product)
                                }
                                .buttonStyle(.plain)
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
                    Text(selectedSubcategory)
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
                    dropdownOption("Tutte le sottocategorie")
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

    private func dropdownOption(_ value: String) -> some View {
        Button {
            selectedSubcategory = value
            withAnimation(.easeInOut(duration: 0.16)) {
                isSubcategoryMenuOpen = false
            }
        } label: {
            HStack(spacing: 10) {
                Text(value)
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
                Text(product.displayPrice.euro)
                    .font(.system(size: 16, weight: .regular))
                    .foregroundStyle(Color.grGold)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            }
        }
        .frame(maxWidth: 326)
    }
}

struct ProductDetailView: View {
    @EnvironmentObject private var store: AppStore
    let product: Product

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    ProductImage(product: product)
                        .frame(height: 430)
                        .clipped()

                    Text(product.nome)
                        .font(.custom("Michroma-Regular", size: 38))
                        .foregroundStyle(Color.grGold)

                    Text(product.displayPrice.euro)
                        .font(.system(size: 24, weight: .regular))
                        .foregroundStyle(Color.grGold)

                    if let description = product.descrizione, !description.isEmpty {
                        Text(description)
                            .font(.custom("Michroma-Regular", size: 19))
                            .foregroundStyle(Color.grGold.opacity(0.78))
                    }

                    Button {
                        store.addToCart(product)
                    } label: {
                        Text(product.isAvailable ? store.l10n.text(.addToCart) : store.l10n.text(.soldOut))
                            .font(.custom("Michroma-Regular", size: 24))
                            .foregroundStyle(.black)
                            .frame(maxWidth: .infinity)
                            .frame(height: 54)
                            .background(Color.grGold)
                    }
                    .disabled(!product.isAvailable)
                    .opacity(product.isAvailable ? 1 : 0.45)
                }
                .padding(18)
                .padding(.top, 42)
                .padding(.bottom, 30)
            }

            WebBackButton()
                .padding(.top, 48)
                .padding(.leading, 14)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        }
        .toolbar(.hidden, for: .navigationBar)
    }
}

struct ProductImage: View {
    let product: Product

    var body: some View {
        AsyncImage(url: AppConfig.imageURL(for: product.immagine)) { phase in
            switch phase {
            case .empty:
                ZStack {
                    Color.grGold.opacity(0.08)
                    ProgressView().tint(.white)
                }
            case .success(let image):
                image
                    .resizable()
                    .scaledToFill()
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
